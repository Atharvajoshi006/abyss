import Dexie, { type Table } from 'dexie';
import type { Wallet, Balance } from '../types/wallet';
import type { Transaction } from '../types/transaction';

export class TimeWalletDatabase extends Dexie {
  wallets!: Table<Wallet, string>;
  balances!: Table<Balance, [string, string]>;
  transactions!: Table<Transaction, string>;

  constructor() {
    super('TimeWalletDB');

    // Version 1 of the schema
    // Future migrations can declare this.version(2)... without deleting existing tables
    this.version(1).stores({
      wallets: 'id, &usernameKey, createdAt',
      balances: '[walletId+currency], walletId, currency, updatedAt',
      transactions: 'id, &idempotencyKey, walletId, type, currency, createdAt',
    });
  }
}

export const db = new TimeWalletDatabase();
