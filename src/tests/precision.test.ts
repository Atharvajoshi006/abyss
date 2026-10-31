import { parseAmountToMinor, formatMinorUnits } from '../utils/currency';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('--- RUNNING TEST 4: CURRENCY PRECISION TESTS ---');

// USD (2 decimals)
const usd1 = parseAmountToMinor('100.50', 'USD');
assert(usd1.success && usd1.amountMinor === 10050, 'USD 100.50 should parse to 10050 minor units');

const usd2 = parseAmountToMinor('10000', 'USD');
assert(usd2.success && usd2.amountMinor === 1000000, 'USD 10000 should parse to 1000000 minor units');

const usdFractionReject = parseAmountToMinor('100.555', 'USD');
assert(!usdFractionReject.success, 'USD with 3 decimals should be rejected');

// INR (2 decimals)
const inr1 = parseAmountToMinor('5000', 'INR');
assert(inr1.success && inr1.amountMinor === 500000, 'INR 5000 should parse to 500000 minor units');

const inr2 = parseAmountToMinor('500.00', 'INR');
assert(inr2.success && inr2.amountMinor === 50000, 'INR 500.00 should parse to 50000 minor units');

// JPY (0 decimals)
const jpy1 = parseAmountToMinor('1000', 'JPY');
assert(jpy1.success && jpy1.amountMinor === 1000, 'JPY 1000 should parse to 1000 minor units');

const jpyRejectFraction = parseAmountToMinor('1000.5', 'JPY');
assert(!jpyRejectFraction.success, 'JPY with decimal should be rejected');

const jpyRejectFractionZero = parseAmountToMinor('1000.0', 'JPY');
assert(!jpyRejectFractionZero.success, 'JPY with .0 should be rejected');

// Invalid inputs
assert(!parseAmountToMinor('-50', 'USD').success, 'Negative amounts must be rejected');
assert(!parseAmountToMinor('0', 'USD').success, 'Zero amounts must be rejected');
assert(!parseAmountToMinor('0.00', 'USD').success, 'Zero decimal amounts must be rejected');
assert(!parseAmountToMinor('abc', 'USD').success, 'Non-numeric input must be rejected');
assert(!parseAmountToMinor('100.5.2', 'USD').success, 'Multiple dots must be rejected');
assert(!parseAmountToMinor('', 'USD').success, 'Empty string must be rejected');

// Formatting
assert(formatMinorUnits(1000000, 'USD') === '$10,000.00', `USD format should be $10,000.00, got ${formatMinorUnits(1000000, 'USD')}`);
assert(formatMinorUnits(500000, 'INR').includes('5,000.00'), `INR format should be ₹5,000.00`);
assert(formatMinorUnits(900000, 'USD') === '$9,000.00', `USD format should be $9,000.00, got ${formatMinorUnits(900000, 'USD')}`);
assert(formatMinorUnits(1000, 'JPY') === '¥1,000', `JPY format should be ¥1,000, got ${formatMinorUnits(1000, 'JPY')}`);

console.log('✅ TEST 4: ALL CURRENCY PRECISION TESTS PASSED!');
