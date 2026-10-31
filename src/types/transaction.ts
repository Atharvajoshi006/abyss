import type { SupportedCurrency } from './wallet';
import type { ExchangeRateSource } from './exchange';

export type TransactionType = 'ISSUE' | 'REDEEM' | 'TRANSFER';

export interface Transaction {
  id: string;
  idempotencyKey: string;
  walletId: string; // Preserved for backwards compatibility (senderWalletId for transfers)
  type: TransactionType;
  amountMinor: number; // Preserved for backwards compatibility (source amount for cross-currency)
  currency: SupportedCurrency; // Preserved for backwards compatibility (source currency for cross-currency)
  balanceAfterMinor: number; // Preserved for backwards compatibility (sender balance after for transfers)
  createdAt: string;

  // Phase 2: Wallet-to-Wallet Transfer Fields
  senderWalletId?: string;
  recipientWalletId?: string;
  senderBalanceAfterMinor?: number;
  recipientBalanceAfterMinor?: number;

  // Phase 3: Multi-Currency Exchange & Fraud Fields
  sourceAmountMinor?: number;
  sourceCurrency?: SupportedCurrency;
  destinationAmountMinor?: number;
  destinationCurrency?: SupportedCurrency;
  exchangeRate?: number;
  exchangeRateDate?: string;
  exchangeRateFetchedAt?: string;
  exchangeRateSource?: ExchangeRateSource;

  // Fraud detection tags
  isFlagged?: boolean;
  flagReasons?: string[];
}
