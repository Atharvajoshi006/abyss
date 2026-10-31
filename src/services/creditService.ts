import { db } from '../db/database';
import type { SupportedCurrency, Balance } from '../types/wallet';
import type { Transaction } from '../types/transaction';
import { SUPPORTED_CURRENCIES, formatMinorUnits } from '../utils/currency';

export interface IssueCreditsParams {
  walletId: string;
  currency: SupportedCurrency;
  amountMinor: number;
  idempotencyKey?: string;
}

export interface RedeemCreditsParams {
  walletId: string;
  currency: SupportedCurrency;
  amountMinor: number;
  idempotencyKey?: string;
}

/**
 * Issues credits to a wallet atomically in an IndexedDB transaction.
 * Updates the balance record and inserts an immutable ISSUE transaction.
 * Guarantees duplicate-submission prevention via idempotency keys.
 */
export async function issueCredits(params: IssueCreditsParams): Promise<Transaction> {
  const { walletId, currency, amountMinor } = params;
  const idempotencyKey = params.idempotencyKey || `idem_${crypto.randomUUID()}`;

  // 1. Validate currency
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  // 2. Validate amountMinor
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    throw new Error('Issued amount must be a positive integer in minor units');
  }

  // 3. Validate wallet exists
  const wallet = await db.wallets.get(walletId);
  if (!wallet) {
    throw new Error(`Wallet not found with ID: ${walletId}`);
  }

  // 4. Pre-check idempotency key
  const existingTx = await db.transactions.where('idempotencyKey').equals(idempotencyKey).first();
  if (existingTx) {
    throw new Error(`Duplicate operation: Transaction with this idempotency key already exists.`);
  }

  const transactionId = `txn_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  let createdTx!: Transaction;

  // 5. Atomic IndexedDB read-write transaction
  await db.transaction('rw', [db.balances, db.transactions], async () => {
    // In-transaction idempotency guard
    const inTxExisting = await db.transactions.where('idempotencyKey').equals(idempotencyKey).first();
    if (inTxExisting) {
      throw new Error(`Duplicate operation: Transaction with this idempotency key already exists.`);
    }

    const currentRecord = await db.balances.get([walletId, currency]);
    const currentMinor = currentRecord ? currentRecord.amountMinor : 0;
    const newMinor = currentMinor + amountMinor;

    if (newMinor > Number.MAX_SAFE_INTEGER) {
      throw new Error('Balance would exceed maximum safe integer limit.');
    }

    // Update or create balance record
    await db.balances.put({
      walletId,
      currency,
      amountMinor: newMinor,
      updatedAt: now,
    });

    // Insert immutable ISSUE transaction record
    createdTx = {
      id: transactionId,
      idempotencyKey,
      walletId,
      type: 'ISSUE',
      amountMinor,
      currency,
      balanceAfterMinor: newMinor,
      createdAt: now,
    };

    await db.transactions.add(createdTx);
  });

  return createdTx;
}

/**
 * Redeems credits from a wallet atomically in an IndexedDB transaction.
 * Rejects negative balances and prevents duplicate submissions.
 */
export async function redeemCredits(params: RedeemCreditsParams): Promise<Transaction> {
  const { walletId, currency, amountMinor } = params;
  const idempotencyKey = params.idempotencyKey || `idem_${crypto.randomUUID()}`;

  // 1. Validate currency
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  // 2. Validate amountMinor
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    throw new Error('Redemption amount must be a positive integer in minor units');
  }

  // 3. Validate wallet exists
  const wallet = await db.wallets.get(walletId);
  if (!wallet) {
    throw new Error(`Wallet not found with ID: ${walletId}`);
  }

  // 4. Pre-check idempotency key
  const existingTx = await db.transactions.where('idempotencyKey').equals(idempotencyKey).first();
  if (existingTx) {
    throw new Error(`Duplicate operation: Transaction with this idempotency key already exists.`);
  }

  const transactionId = `txn_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  let createdTx!: Transaction;

  // 5. Atomic IndexedDB read-write transaction
  await db.transaction('rw', [db.balances, db.transactions], async () => {
    // In-transaction idempotency guard
    const inTxExisting = await db.transactions.where('idempotencyKey').equals(idempotencyKey).first();
    if (inTxExisting) {
      throw new Error(`Duplicate operation: Transaction with this idempotency key already exists.`);
    }

    const currentRecord = await db.balances.get([walletId, currency]);
    const currentMinor = currentRecord ? currentRecord.amountMinor : 0;

    // Validate sufficient balance
    if (currentMinor < amountMinor) {
      throw new Error(
        `Insufficient balance: Available balance is ${formatMinorUnits(
          currentMinor,
          currency
        )}, attempted to redeem ${formatMinorUnits(amountMinor, currency)}.`
      );
    }

    const newMinor = currentMinor - amountMinor;

    // Update balance record
    await db.balances.put({
      walletId,
      currency,
      amountMinor: newMinor,
      updatedAt: now,
    });

    // Insert immutable REDEEM transaction record
    createdTx = {
      id: transactionId,
      idempotencyKey,
      walletId,
      type: 'REDEEM',
      amountMinor,
      currency,
      balanceAfterMinor: newMinor,
      createdAt: now,
    };

    await db.transactions.add(createdTx);
  });

  return createdTx;
}

/**
 * Returns all balance records for a specific wallet.
 */
export async function getWalletBalances(walletId: string): Promise<Balance[]> {
  return await db.balances.where('walletId').equals(walletId).toArray();
}

/**
 * Returns all balance records across all wallets.
 */
export async function getAllBalances(): Promise<Balance[]> {
  return await db.balances.toArray();
}

/**
 * Returns all transactions, optionally filtered by walletId, ordered by newest first.
 */
export async function getTransactions(walletId?: string): Promise<Transaction[]> {
  if (walletId) {
    const txs = await db.transactions.where('walletId').equals(walletId).toArray();
    return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const txs = await db.transactions.toArray();
  return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
