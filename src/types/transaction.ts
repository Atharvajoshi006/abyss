import type { SupportedCurrency } from './wallet';

export type TransactionType = 'ISSUE' | 'REDEEM';

export interface Transaction {
  id: string;
  idempotencyKey: string;
  walletId: string;
  type: TransactionType;
  amountMinor: number;
  currency: SupportedCurrency;
  balanceAfterMinor: number;
  createdAt: string;
}
