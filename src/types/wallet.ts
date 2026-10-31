export type SupportedCurrency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';

export interface Wallet {
  id: string;
  username: string;
  usernameKey: string;
  displayName?: string;
  createdAt: string;
}

export interface Balance {
  walletId: string;
  currency: SupportedCurrency;
  amountMinor: number;
  updatedAt: string;
}
