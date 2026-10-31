import { db } from '../db/database';
import type { SupportedCurrency } from '../types/wallet';
import type { Transaction } from '../types/transaction';
import { SUPPORTED_CURRENCIES, formatMinorUnits } from '../utils/currency';

export interface TransferCreditsParams {
  senderWalletId: string;
  recipientWalletId: string;
  currency: SupportedCurrency;
  amountMinor: number;
  idempotencyKey?: string;
}

/**
 * Transfers credits between two wallets inside one atomic Dexie transaction.
 * Guarantees all-or-nothing balance updates and idempotent duplicate-submission protection.
 */
export async function transferCredits(params: TransferCreditsParams): Promise<Transaction> {
  const { senderWalletId, recipientWalletId, currency, amountMinor } = params;
  const idempotencyKey = params.idempotencyKey || `idem_${crypto.randomUUID()}`;

  // 1. Validation: Self-transfer rejection
  if (senderWalletId === recipientWalletId) {
    throw new Error('Self-transfer is not permitted: Sender and recipient must be different wallets.');
  }

  // 2. Validation: Currency support
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  // 3. Validation: Positive integer minor units
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    throw new Error('Transfer amount must be a positive integer in currency minor units.');
  }

  if (amountMinor > Number.MAX_SAFE_INTEGER) {
    throw new Error('Transfer amount exceeds the maximum safe integer limit.');
  }

  // 4. Validate existence of both wallets
  const [senderWallet, recipientWallet] = await Promise.all([
    db.wallets.get(senderWalletId),
    db.wallets.get(recipientWalletId),
  ]);

  if (!senderWallet) {
    throw new Error(`Sender wallet not found with ID: ${senderWalletId}`);
  }
  if (!recipientWallet) {
    throw new Error(`Recipient wallet not found with ID: ${recipientWalletId}`);
  }

  const transactionId = `txn_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  let resultingTx!: Transaction;

  // 5. Execute atomic IndexedDB read-write transaction involving wallets, balances, and transactions
  await db.transaction('rw', [db.balances, db.transactions], async () => {
    // In-transaction Idempotency Check
    const inTxExisting = await db.transactions.where('idempotencyKey').equals(idempotencyKey).first();
    if (inTxExisting) {
      const isPayloadMatch =
        inTxExisting.type === 'TRANSFER' &&
        (inTxExisting.senderWalletId === senderWalletId || inTxExisting.walletId === senderWalletId) &&
        inTxExisting.recipientWalletId === recipientWalletId &&
        inTxExisting.currency === currency &&
        inTxExisting.amountMinor === amountMinor;

      if (isPayloadMatch) {
        // Operation already succeeded: return existing transaction without reapplying transfer
        resultingTx = inTxExisting;
        return;
      } else {
        throw new Error(
          `Idempotency conflict: A transaction with idempotency key "${idempotencyKey}" already exists with different parameters.`
        );
      }
    }

    // Retrieve sender balance
    const senderBalanceRecord = await db.balances.get([senderWalletId, currency]);
    const senderCurrentMinor = senderBalanceRecord ? senderBalanceRecord.amountMinor : 0;

    // Validate sufficient funds
    if (senderCurrentMinor < amountMinor) {
      throw new Error(
        `Insufficient balance: Available balance is ${formatMinorUnits(
          senderCurrentMinor,
          currency
        )}, attempted to transfer ${formatMinorUnits(amountMinor, currency)}.`
      );
    }

    // Retrieve recipient balance
    const recipientBalanceRecord = await db.balances.get([recipientWalletId, currency]);
    const recipientCurrentMinor = recipientBalanceRecord ? recipientBalanceRecord.amountMinor : 0;

    // Calculate new balances
    const senderNewMinor = senderCurrentMinor - amountMinor;
    const recipientNewMinor = recipientCurrentMinor + amountMinor;

    if (recipientNewMinor > Number.MAX_SAFE_INTEGER) {
      throw new Error('Recipient balance would exceed safe integer representation.');
    }

    // Update sender balance record
    await db.balances.put({
      walletId: senderWalletId,
      currency,
      amountMinor: senderNewMinor,
      updatedAt: now,
    });

    // Update recipient balance record
    await db.balances.put({
      walletId: recipientWalletId,
      currency,
      amountMinor: recipientNewMinor,
      updatedAt: now,
    });

    // Insert single immutable TRANSFER record
    resultingTx = {
      id: transactionId,
      idempotencyKey,
      type: 'TRANSFER',
      walletId: senderWalletId, // backwards compatibility
      senderWalletId,
      recipientWalletId,
      amountMinor,
      currency,
      balanceAfterMinor: senderNewMinor, // backwards compatibility
      senderBalanceAfterMinor: senderNewMinor,
      recipientBalanceAfterMinor: recipientNewMinor,
      createdAt: now,
    };

    await db.transactions.add(resultingTx);
  });

  return resultingTx;
}
