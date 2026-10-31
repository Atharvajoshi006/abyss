import Dexie, { type Table } from 'dexie';
import type { Wallet, Balance } from '../types/wallet';
import type { Transaction } from '../types/transaction';
import type { CachedExchangeRate } from '../types/exchange';
import type { FraudAlert } from '../types/fraud';

export class TimeWalletDatabase extends Dexie {
  wallets!: Table<Wallet, string>;
  balances!: Table<Balance, [string, string]>;
  transactions!: Table<Transaction, string>;
  exchangeRates!: Table<CachedExchangeRate, [string, string]>;
  fraudAlerts!: Table<FraudAlert, string>;

  constructor() {
    super('TimeWalletDB');

    // Version 1 of the schema (Phase 1)
    this.version(1).stores({
      wallets: 'id, &usernameKey, createdAt',
      balances: '[walletId+currency], walletId, currency, updatedAt',
      transactions: 'id, &idempotencyKey, walletId, type, currency, createdAt',
    });

    // Version 2 of the schema (Phase 2: Wallet-to-Wallet Transfers)
    this.version(2).stores({
      transactions: 'id, &idempotencyKey, walletId, senderWalletId, recipientWalletId, type, currency, createdAt',
    });

    // Version 3 of the schema (Phase 3: Currency Exchange & Fraud Detection)
    // Preserves all existing tables and records; safely adds exchangeRates and fraudAlerts
    this.version(3).stores({
      exchangeRates: '[base+quote], base, quote, fetchedAt',
      fraudAlerts: 'id, &[transactionId+ruleType], transactionId, senderWalletId, ruleType, detectedAt',
    });
  }
}

export const db = new TimeWalletDatabase();
