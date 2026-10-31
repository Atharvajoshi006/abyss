import { db } from '../db/database';
import type { SupportedCurrency } from '../types/wallet';
import type { Transaction } from '../types/transaction';
import type { ExchangeRateSource } from '../types/exchange';
import { SUPPORTED_CURRENCIES, formatMinorUnits } from '../utils/currency';
import { getExchangeRate, convertCurrencyAmount } from './exchangeService';
import { evaluateFraudRules } from './fraudEngine';

export interface TransferCreditsParams {
  senderWalletId: string;
  recipientWalletId: string;
  amountMinor: number; // Source amount in integer minor units
  sourceCurrency?: SupportedCurrency;
  destinationCurrency?: SupportedCurrency;
  currency?: SupportedCurrency; // Phase 2 backward compatibility
  exchangeRate?: number; // Pre-captured rate snapshot
  exchangeRateDate?: string;
  exchangeRateFetchedAt?: string;
  exchangeRateSource?: ExchangeRateSource;
  idempotencyKey?: string;
}

/**
 * Transfers credits between two wallets inside one atomic Dexie transaction.
 * Supports same-currency and cross-currency conversions using deterministic arithmetic.
 * Evaluates rule-based fraud detection and persists any alerts atomically.
 */
export async function transferCredits(params: TransferCreditsParams): Promise<Transaction> {
  const { senderWalletId, recipientWalletId, amountMinor } = params;
  const sourceCurrency = params.sourceCurrency || params.currency || 'USD';
  const destinationCurrency = params.destinationCurrency || params.currency || sourceCurrency;
  const idempotencyKey = params.idempotencyKey || `idem_${crypto.randomUUID()}`;

  // 1. Validation: Self-transfer rejection
  if (senderWalletId === recipientWalletId) {
    throw new Error('Self-transfer is not permitted: Sender and recipient must be different wallets.');
  }

  // 2. Validation: Currency support
  if (!SUPPORTED_CURRENCIES.includes(sourceCurrency)) {
    throw new Error(`Unsupported source currency: ${sourceCurrency}`);
  }
  if (!SUPPORTED_CURRENCIES.includes(destinationCurrency)) {
    throw new Error(`Unsupported destination currency: ${destinationCurrency}`);
  }

  // 3. Validation: Positive integer minor units
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    throw new Error('Transfer amount must be a positive integer in source currency minor units.');
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

  // 5. Retrieve or use captured exchange rate BEFORE starting atomic database transaction
  let rate = params.exchangeRate;
  let rateDate = params.exchangeRateDate;
  let rateFetchedAt = params.exchangeRateFetchedAt;
  let rateSource = params.exchangeRateSource;

  if (sourceCurrency === destinationCurrency) {
    rate = 1;
    rateDate = new Date().toISOString().split('T')[0];
    rateFetchedAt = new Date().toISOString();
    rateSource = 'identity';
  } else if (rate === undefined || !rateDate || !rateFetchedAt || !rateSource) {
    const rateResult = await getExchangeRate(sourceCurrency, destinationCurrency);
    rate = rateResult.rate;
    rateDate = rateResult.date;
    rateFetchedAt = rateResult.fetchedAt;
    rateSource = rateResult.source;
  }

  // 6. Calculate destination amount using deterministic integer arithmetic
  const destMinor = convertCurrencyAmount(amountMinor, sourceCurrency, destinationCurrency, rate);

  const transactionId = `txn_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  let resultingTx!: Transaction;

  // 7. Execute atomic IndexedDB read-write transaction covering balances, transactions, and fraudAlerts
  await db.transaction('rw', [db.balances, db.transactions, db.fraudAlerts], async () => {
    // In-transaction Idempotency Check
    const inTxExisting = await db.transactions.where('idempotencyKey').equals(idempotencyKey).first();
    if (inTxExisting) {
      const existingSrcCurr = inTxExisting.sourceCurrency || inTxExisting.currency;
      const existingDestCurr = inTxExisting.destinationCurrency || inTxExisting.currency;
      const existingAmount = inTxExisting.sourceAmountMinor ?? inTxExisting.amountMinor;

      const isPayloadMatch =
        inTxExisting.type === 'TRANSFER' &&
        (inTxExisting.senderWalletId === senderWalletId || inTxExisting.walletId === senderWalletId) &&
        inTxExisting.recipientWalletId === recipientWalletId &&
        existingSrcCurr === sourceCurrency &&
        existingDestCurr === destinationCurrency &&
        existingAmount === amountMinor;

      if (isPayloadMatch) {
        // Operation already succeeded: return existing transaction without reapplying transfer or alerts
        resultingTx = inTxExisting;
        return;
      } else {
        throw new Error(
          `Idempotency conflict: A transaction with idempotency key "${idempotencyKey}" already exists with different parameters.`
        );
      }
    }

    // Retrieve sender balance in source currency
    const senderBalanceRecord = await db.balances.get([senderWalletId, sourceCurrency]);
    const senderCurrentMinor = senderBalanceRecord ? senderBalanceRecord.amountMinor : 0;

    // Validate sufficient funds
    if (senderCurrentMinor < amountMinor) {
      throw new Error(
        `Insufficient balance: Available balance is ${formatMinorUnits(
          senderCurrentMinor,
          sourceCurrency
        )}, attempted to transfer ${formatMinorUnits(amountMinor, sourceCurrency)}.`
      );
    }

    // Retrieve recipient balance in destination currency
    const recipientBalanceRecord = await db.balances.get([recipientWalletId, destinationCurrency]);
    const recipientCurrentMinor = recipientBalanceRecord ? recipientBalanceRecord.amountMinor : 0;

    // Calculate new balances
    const senderNewMinor = senderCurrentMinor - amountMinor;
    const recipientNewMinor = recipientCurrentMinor + destMinor;

    if (recipientNewMinor > Number.MAX_SAFE_INTEGER) {
      throw new Error('Recipient balance would exceed safe integer representation.');
    }

    // Update sender balance record (in source currency)
    await db.balances.put({
      walletId: senderWalletId,
      currency: sourceCurrency,
      amountMinor: senderNewMinor,
      updatedAt: now,
    });

    // Update recipient balance record (in destination currency)
    await db.balances.put({
      walletId: recipientWalletId,
      currency: destinationCurrency,
      amountMinor: recipientNewMinor,
      updatedAt: now,
    });

    // Evaluate fraud rules inside the transaction
    const fraudAlerts = await evaluateFraudRules({
      transactionId,
      senderWalletId,
      sourceAmountMinor: amountMinor,
      sourceCurrency,
      createdAt: now,
    });

    // Build immutable TRANSFER transaction record
    resultingTx = {
      id: transactionId,
      idempotencyKey,
      type: 'TRANSFER',
      walletId: senderWalletId, // backwards compatibility
      senderWalletId,
      recipientWalletId,
      amountMinor, // legacy source amount
      currency: sourceCurrency, // legacy source currency
      balanceAfterMinor: senderNewMinor, // backwards compatibility
      sourceAmountMinor: amountMinor,
      sourceCurrency,
      destinationAmountMinor: destMinor,
      destinationCurrency,
      exchangeRate: rate,
      exchangeRateDate: rateDate,
      exchangeRateFetchedAt: rateFetchedAt,
      exchangeRateSource: rateSource,
      senderBalanceAfterMinor: senderNewMinor,
      recipientBalanceAfterMinor: recipientNewMinor,
      createdAt: now,
      isFlagged: fraudAlerts.length > 0,
      flagReasons: fraudAlerts.map((a) => a.explanation),
    };

    // Insert transaction
    await db.transactions.add(resultingTx);

    // Persist fraud alerts atomically
    for (const alert of fraudAlerts) {
      await db.fraudAlerts.put(alert);
    }
  });

  return resultingTx;
}
