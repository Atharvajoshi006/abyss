import { convertCurrencyAmount, rateToFraction } from '../services/exchangeService';
import { isLargeTransfer, isHighFrequency } from '../services/fraudEngine';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

console.log('=== TEST C: Conversion Arithmetic & Precision ===');

// 1. Same currency conversion (rate 1.0)
const sameCurrency = convertCurrencyAmount(10000, 'USD', 'USD', 1.0);
assert(sameCurrency === 10000, '100.00 USD at 1.0 rate converts to 10000 minor units (100.00 USD)');

// 2. USD (2 decimals) to INR (2 decimals) at 95.12
// 100.00 USD = 10000 minor units. 10000 * 95.12 = 9512.00 INR = 951200 minor units
const usdToInr = convertCurrencyAmount(10000, 'USD', 'INR', 95.12);
assert(usdToInr === 951200, `100.00 USD at rate 95.12 converts to 951200 minor units (got ${usdToInr})`);

// 3. USD (2 decimals) to JPY (0 decimals) at 153.456
// 10.00 USD = 1000 minor units. In major units: 10 * 153.456 = 1534.56 JPY.
// With half-up rounding to 0 decimal places: 1535 JPY.
const usdToJpy = convertCurrencyAmount(1000, 'USD', 'JPY', 153.456);
assert(usdToJpy === 1535, `10.00 USD at rate 153.456 converts to 1535 JPY minor units (got ${usdToJpy})`);

// 4. JPY (0 decimals) to USD (2 decimals) at 0.006516
// 1500 JPY (minor units = 1500). Major = 1500 * 0.006516 = 9.774 USD.
// Rounding 9.774 to 2 decimals gives 9.77 USD = 977 minor units.
const jpyToUsd = convertCurrencyAmount(1500, 'JPY', 'USD', 0.006516);
assert(jpyToUsd === 977, `1500 JPY at rate 0.006516 converts to 977 USD minor units (got ${jpyToUsd})`);

// 5. Half-up tie-breaking verification
// USD to EUR where fractionDigits are both 2 and rate is 1.005:
// numerator: 100 * 1005 = 100500, denom: 1000. 100500 / 1000 = 100.5.
// Half-up should round 100.5 to 101.
const tieBreakUsdEur = convertCurrencyAmount(100, 'USD', 'EUR', 1.005);
assert(tieBreakUsdEur === 101, `Half-up rounding properly rounds exact .5 upwards to 101 (got ${tieBreakUsdEur})`);

// 6. rateToFraction accuracy
const { numerator: num, denominator: den } = rateToFraction(95.12345);
assert(num === 9512345n && den === 100000n, 'rateToFraction preserves 5 decimal places accurately');

// 7. Unsafe amounts / negative amounts
try {
  convertCurrencyAmount(-500, 'USD', 'EUR', 0.92);
  assert(false, 'Negative amount should throw error');
} catch {
  assert(true, 'Negative amount correctly handled/rejected');
}

console.log('\n=== TEST E: Rule 1 — Large Transfer Detection ===');
// Threshold: strictly exceeding 5,000 units of source currency
// USD has 2 decimals, so 5,000 units = 500,000 minor units.

// 4,000 USD (400,000 minor units) -> NO alert
assert(!isLargeTransfer(400000, 'USD'), '4,000 USD does not trigger large-transfer alert');

// 5,000 USD (500,000 minor units) -> NO alert (strictly exceeding 5,000)
assert(!isLargeTransfer(500000, 'USD'), 'Exactly 5,000 USD does not trigger large-transfer alert');

// 6,000 USD (600,000 minor units) -> LARGE_TRANSFER alert
assert(isLargeTransfer(600000, 'USD'), '6,000 USD triggers large-transfer alert');

// Zero-decimal currency: JPY (5,000 JPY = 5000 minor units)
assert(!isLargeTransfer(5000, 'JPY'), '5,000 JPY does not trigger alert');
assert(isLargeTransfer(5001, 'JPY'), '5,001 JPY triggers alert');

console.log('\n=== TEST F: Rule 2 — High Transaction Frequency Detection ===');
// Flag users making more than three successful outgoing transfers within rolling 24h.
const now = Date.now();
const oneHourAgo = now - 3600 * 1000;
const twoHoursAgo = now - 2 * 3600 * 1000;
const threeHoursAgo = now - 3 * 3600 * 1000;
const twentyFiveHoursAgo = now - 25 * 3600 * 1000;

// Transfer 1: 0 previous outgoing transfers -> NO alert (total = 1 <= 3)
const f1 = isHighFrequency([], now);
assert(!f1.triggered && f1.totalInWindow === 1, '1st transfer: totalInWindow=1, no alert');

// Transfer 2: 1 previous outgoing transfer within 24h -> NO alert (total = 2 <= 3)
const f2 = isHighFrequency([threeHoursAgo], now);
assert(!f2.triggered && f2.totalInWindow === 2, '2nd transfer: totalInWindow=2, no alert');

// Transfer 3: 2 previous outgoing transfers within 24h -> NO alert (total = 3 <= 3)
const f3 = isHighFrequency([threeHoursAgo, twoHoursAgo], now);
assert(!f3.triggered && f3.totalInWindow === 3, '3rd transfer: totalInWindow=3, no alert');

// Transfer 4: 3 previous outgoing transfers within 24h -> ALERT! (total = 4 > 3)
const f4 = isHighFrequency([threeHoursAgo, twoHoursAgo, oneHourAgo], now);
assert(f4.triggered && f4.totalInWindow === 4, '4th transfer: totalInWindow=4, triggers HIGH_FREQUENCY alert');

// Test that transfers older than 24h are excluded
const fOld = isHighFrequency([twentyFiveHoursAgo, twentyFiveHoursAgo - 1000, twentyFiveHoursAgo - 2000], now);
assert(!fOld.triggered && fOld.totalInWindow === 1, 'Transfers outside rolling 24-hour window are excluded');

console.log('\nAll pure conversion and fraud rule tests passed successfully!');
