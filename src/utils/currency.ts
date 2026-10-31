import type { SupportedCurrency } from '../types/wallet';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  fractionDigits: number;
  flag: string;
}

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  'USD',
  'INR',
  'EUR',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
];

export const CURRENCY_CONFIGS: Record<SupportedCurrency, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    fractionDigits: 2,
    flag: '🇺🇸',
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    fractionDigits: 2,
    flag: '🇮🇳',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    fractionDigits: 2,
    flag: '🇪🇺',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    fractionDigits: 2,
    flag: '🇬🇧',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    fractionDigits: 0,
    flag: '🇯🇵',
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    fractionDigits: 2,
    flag: '🇨🇦',
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    fractionDigits: 2,
    flag: '🇦🇺',
  },
};

export interface ParseAmountResult {
  success: boolean;
  amountMinor?: number;
  error?: string;
}

/**
 * Reusable amount parser that:
 * - Accepts decimal strings from user input.
 * - Validates currency-specific decimal precision.
 * - Rejects negative, zero, malformed, and excessively large amounts.
 * - Rejects values that cannot be represented safely as integers.
 * - Never uses unrestricted floating point multiplication.
 */
export function parseAmountToMinor(input: string, currency: SupportedCurrency): ParseAmountResult {
  if (typeof input !== 'string') {
    return { success: false, error: 'Amount input must be a string' };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return { success: false, error: 'Amount cannot be empty' };
  }

  // Reject negative numbers
  if (trimmed.startsWith('-') || trimmed.includes('-')) {
    return { success: false, error: 'Negative amounts are not allowed' };
  }

  // Reject non-numeric patterns (only digits and optional single dot allowed)
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return {
      success: false,
      error: 'Invalid numeric format. Enter numbers only (e.g. 100 or 100.50)',
    };
  }

  const config = CURRENCY_CONFIGS[currency];
  if (!config) {
    return { success: false, error: `Unsupported currency: ${currency}` };
  }

  const parts = trimmed.split('.');
  const integerStr = parts[0].replace(/^0+(?=\d)/, ''); // Remove leading zeros unless it's just 0
  const decimalStr = parts[1] ?? '';

  // Zero fraction check (e.g. JPY)
  if (config.fractionDigits === 0 && parts.length > 1) {
    return {
      success: false,
      error: `${currency} does not support fractional amounts. Enter whole numbers only.`,
    };
  }

  // Decimal precision check
  if (decimalStr.length > config.fractionDigits) {
    return {
      success: false,
      error: `${currency} supports at most ${config.fractionDigits} decimal place${
        config.fractionDigits === 1 ? '' : 's'
      }.`,
    };
  }

  // Construct minor units without floating-point arithmetic
  const paddedDecimal = decimalStr.padEnd(config.fractionDigits, '0');
  const combinedStr = (integerStr || '0') + paddedDecimal;

  let minorBigInt: bigint;
  try {
    minorBigInt = BigInt(combinedStr);
  } catch {
    return { success: false, error: 'Malformed number' };
  }

  if (minorBigInt <= 0n) {
    return { success: false, error: 'Amount must be greater than zero' };
  }

  if (minorBigInt > BigInt(Number.MAX_SAFE_INTEGER)) {
    return {
      success: false,
      error: 'Amount exceeds the maximum supported integer limit',
    };
  }

  return {
    success: true,
    amountMinor: Number(minorBigInt),
  };
}

/**
 * Format integer minor units for display using Intl.NumberFormat.
 * Converts integer minor units to major units for display only.
 */
export function formatMinorUnits(amountMinor: number, currency: SupportedCurrency): string {
  const config = CURRENCY_CONFIGS[currency];
  const fractionDigits = config ? config.fractionDigits : 2;
  const majorUnits = amountMinor / 10 ** fractionDigits;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(majorUnits);
  } catch {
    return `${config?.symbol || currency} ${majorUnits.toFixed(fractionDigits)}`;
  }
}

/**
 * Converts minor integer units to a standard decimal string representation (e.g. 10050 -> "100.50").
 */
export function minorToDecimalString(amountMinor: number, currency: SupportedCurrency): string {
  const config = CURRENCY_CONFIGS[currency];
  const fractionDigits = config ? config.fractionDigits : 2;

  if (fractionDigits === 0) {
    return amountMinor.toString();
  }

  const str = amountMinor.toString().padStart(fractionDigits + 1, '0');
  const intPart = str.slice(0, str.length - fractionDigits);
  const fracPart = str.slice(str.length - fractionDigits);
  return `${intPart}.${fracPart}`;
}
