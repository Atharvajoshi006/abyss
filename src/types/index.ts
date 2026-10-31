export type CurrencyCode = 'USD' | 'EUR' | 'INR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  rateToUSD: number; // illustrative baseline
  color: string;
}

export interface WalletAccount {
  username: string;
  currency: CurrencyCode;
  balance: number;
  createdAt: string;
}

export interface TransactionRecord {
  id: string;
  sender: string;
  receiver: string;
  sendAmount: number;
  sendCurrency: CurrencyCode;
  receiveAmount: number;
  receiveCurrency: CurrencyCode;
  exchangeRate: number;
  timestamp: string;
  status: 'completed' | 'flagged' | 'pending';
  flagReason?: string;
}

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  threshold: string;
  type: 'threshold' | 'velocity';
  severity: 'high' | 'medium';
}

export * from './wallet';
export * from './transaction';
export * from './exchange';
export * from './fraud';

