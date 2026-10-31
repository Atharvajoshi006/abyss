import { db } from '../db/database';
import type { SupportedCurrency } from '../types/wallet';
import type { ExchangeRateResult, CachedExchangeRate } from '../types/exchange';
import { CURRENCY_CONFIGS } from '../utils/currency';

const FRANKFURTER_BASE_URL = 'https://api.frankfurter.dev';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes fresh cache

/**
 * Converts a floating point rate to an exact BigInt fraction (numerator / denominator)
 * without precision loss.
 */
export function rateToFraction(rate: number): { numerator: bigint; denominator: bigint } {
  const str = rate.toString();
  if (!str.includes('.')) {
    return { numerator: BigInt(str), denominator: 1n };
  }
  const parts = str.split('.');
  const intPart = parts[0];
  const decPart = parts[1];
  const decimals = decPart.length;
  const denominator = 10n ** BigInt(decimals);
  const numerator = BigInt(intPart) * denominator + BigInt(decPart);
  return { numerator, denominator };
}

/**
 * Converts source currency minor units to destination currency minor units
 * using exact BigInt-based arithmetic and consistent half-up rounding.
 */
export function convertCurrencyAmount(
  sourceAmountMinor: number,
  sourceCurrency: SupportedCurrency,
  destCurrency: SupportedCurrency,
  rate: number
): number {
  if (sourceCurrency === destCurrency) {
    return sourceAmountMinor;
  }

  if (sourceAmountMinor <= 0) {
    return 0;
  }

  const sourceConfig = CURRENCY_CONFIGS[sourceCurrency];
  const destConfig = CURRENCY_CONFIGS[destCurrency];
  if (!sourceConfig || !destConfig) {
    throw new Error(`Invalid currency config for ${sourceCurrency} or ${destCurrency}`);
  }

  const sourceFractionDigits = sourceConfig.fractionDigits;
  const destFractionDigits = destConfig.fractionDigits;

  const { numerator: rateNum, denominator: rateDen } = rateToFraction(rate);

  // destMinor = (sourceMinor * 10^destFractionDigits * rateNum) / (10^sourceFractionDigits * rateDen)
  const num = BigInt(sourceAmountMinor) * (10n ** BigInt(destFractionDigits)) * rateNum;
  const den = (10n ** BigInt(sourceFractionDigits)) * rateDen;

  // Exact half-up rounding
  const quotient = num / den;
  const remainder = num % den;
  const finalMinor = remainder * 2n >= den ? quotient + 1n : quotient;

  if (finalMinor > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('Converted amount exceeds maximum safe integer representation.');
  }

  return Number(finalMinor);
}

/**
 * Retrieves an exchange rate for base -> quote currency.
 * Handles same-currency identity (rate 1), fresh API fetch via Frankfurter V2,
 * and IndexedDB cache with offline fallback.
 */
export async function getExchangeRate(
  base: SupportedCurrency,
  quote: SupportedCurrency
): Promise<ExchangeRateResult> {
  const now = new Date();
  const nowIso = now.toISOString();
  const todayStr = nowIso.split('T')[0];

  // 1. Same-currency identity (no network request)
  if (base === quote) {
    return {
      base,
      quote,
      rate: 1,
      date: todayStr,
      fetchedAt: nowIso,
      source: 'identity',
    };
  }

  // 2. Check IndexedDB cache
  let cached: CachedExchangeRate | undefined;
  try {
    cached = await db.exchangeRates.get([base, quote]);
  } catch (err) {
    console.warn('Error reading exchange rate cache from IndexedDB:', err);
  }

  const isCacheFresh =
    cached && now.getTime() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS;

  // If cache is fresh, return cached rate directly
  if (cached && isCacheFresh) {
    return {
      base,
      quote,
      rate: cached.rate,
      date: cached.date,
      fetchedAt: cached.fetchedAt,
      source: 'cache',
      isStale: false,
    };
  }

  // 3. Attempt to fetch fresh rate from Frankfurter V2 API with 5-second timeout
  try {
    const url = `${FRANKFURTER_BASE_URL}/v2/rate/${encodeURIComponent(base)}/${encodeURIComponent(quote)}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Frankfurter API returned HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      date?: string;
      base?: string;
      quote?: string;
      rate?: number;
    };

    if (typeof data.rate !== 'number' || data.rate <= 0) {
      throw new Error(`Invalid exchange rate received from API for ${base}/${quote}`);
    }

    const effectiveDate = data.date || todayStr;
    const rateRecord: CachedExchangeRate = {
      base,
      quote,
      rate: data.rate,
      date: effectiveDate,
      fetchedAt: nowIso,
      source: 'api',
    };

    // Cache rate in IndexedDB
    try {
      await db.exchangeRates.put(rateRecord);
    } catch (err) {
      console.warn('Failed to cache exchange rate in IndexedDB:', err);
    }

    return {
      base,
      quote,
      rate: data.rate,
      date: effectiveDate,
      fetchedAt: nowIso,
      source: 'api',
      isStale: false,
    };
  } catch (networkErr: unknown) {
    console.warn(`Frankfurter API fetch failed for ${base}/${quote}:`, networkErr);

    // 4. Fallback to cached rate if available
    if (cached) {
      return {
        base,
        quote,
        rate: cached.rate,
        date: cached.date,
        fetchedAt: cached.fetchedAt,
        source: 'cache',
        isStale: true,
      };
    }

    throw new Error(
      `Unable to fetch live reference rate for ${base}/${quote} and no cached rate is available. Please check your internet connection.`
    );
  }
}
