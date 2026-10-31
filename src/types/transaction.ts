import type { SupportedCurrency } from './wallet';

export type TransactionType = 'ISSUE' | 'REDEEM' | 'TRANSFER';

export interface Transaction {
  id: string;
  idempotencyKey: string;
  walletId: string; // Preserved for backwards compatibility (senderWalletId for transfers)
  type: TransactionType;
  amountMinor: number;
  currency: SupportedCurrency;
  balanceAfterMinor: number; // Preserved for backwards compatibility (senderBalanceAfterMinor for transfers)
  createdAt: string;

  // Phase 2: Wallet-to-Wallet Transfer Fields
  senderWalletId?: string;
  recipientWalletId?: string;
  senderBalanceAfterMinor?: number;
  recipientBalanceAfterMinor?: number;
}
