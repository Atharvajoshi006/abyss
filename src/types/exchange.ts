import type { SupportedCurrency } from './wallet';

export type ExchangeRateSource = 'api' | 'cache' | 'identity';

export interface CachedExchangeRate {
  base: SupportedCurrency;
  quote: SupportedCurrency;
  rate: number;
  date: string;
  fetchedAt: string;
  source: ExchangeRateSource;
}

export interface ExchangeRateResult {
  base: SupportedCurrency;
  quote: SupportedCurrency;
  rate: number;
  date: string;
  fetchedAt: string;
  source: ExchangeRateSource;
  isStale?: boolean;
}
