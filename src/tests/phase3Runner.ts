import { convertCurrencyAmount, rateToFraction } from '../services/exchangeService';
import { isLargeTransfer, isHighFrequency } from '../services/fraudEngine';

async function runPhase3Tests() {
  console.log('====================================================');
  console.log('   TIMEWALLET PHASE 3: TARGETED VERIFICATION RUN   ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      fn();
      console.log(`[PASS] Test ${total}: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`[FAIL] Test ${total}: ${name}`);
      console.error('       Error:', err.message || err);
    }
  }

  async function testAsync(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`[PASS] Test ${total}: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`[FAIL] Test ${total}: ${name}`);
      console.error('       Error:', err.message || err);
    }
  }

  // ----------------------------------------------------
  // TEST 1: Cross-Currency Transfer Calculation & Live Frankfurter Rate
  // ----------------------------------------------------
  await testAsync('Cross-Currency Transfer: Live Frankfurter V2 Rate & BigInt Half-Up Conversion', async () => {
    // 1. Fetch live rate directly from Frankfurter V2 API
    const res = await fetch('https://api.frankfurter.dev/v2/rate/USD/INR', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error(`Frankfurter HTTP ${res.status}`);
    const data = (await res.json()) as { date: string; base: string; quote: string; rate: number };

    if (data.base !== 'USD' || data.quote !== 'INR' || typeof data.rate !== 'number' || data.rate <= 0) {
      throw new Error(`Unexpected rate payload: ${JSON.stringify(data)}`);
    }

    console.log(`       Frankfurter V2 Rate: 1 USD = ${data.rate} INR (Effective date: ${data.date})`);

    // 2. Perform Alice (100 USD) -> Bob (INR) conversion
    const sourceAmountMinor = 10000; // 100.00 USD
    const destAmountMinor = convertCurrencyAmount(sourceAmountMinor, 'USD', 'INR', data.rate);

    // Expected: 100.00 * rate in INR minor units
    const { numerator, denominator } = rateToFraction(data.rate);
    const expectedMinor = Number(
      (BigInt(sourceAmountMinor) * 100n * numerator + (100n * denominator) / 2n) / (100n * denominator)
    );

    if (destAmountMinor !== expectedMinor) {
      throw new Error(`Mismatch in BigInt conversion: got ${destAmountMinor}, expected ${expectedMinor}`);
    }

    console.log(`       Alice sends: 100.00 USD (10000 minor)`);
    console.log(`       Bob receives: ${(destAmountMinor / 100).toFixed(2)} INR (${destAmountMinor} minor units)`);

    // 3. Test JPY zero-decimal precision conversion
    const jpyAmountMinor = convertCurrencyAmount(1000, 'USD', 'JPY', 153.456); // 10.00 USD -> JPY
    if (jpyAmountMinor !== 1535) {
      throw new Error(`JPY conversion failed: expected 1535 minor, got ${jpyAmountMinor}`);
    }
    console.log(`       USD->JPY precision check: 10.00 USD = ${jpyAmountMinor} JPY (zero fraction digits)`);
  });

  // ----------------------------------------------------
  // TEST 2: Rule 1 — Large Transfer Fraud Test
  // ----------------------------------------------------
  test('Rule 1: Large-Transfer Fraud Rule Detection (> 5,000 units)', () => {
    // 5,000 USD = 500,000 minor units
    const belowOrEqualThreshold = isLargeTransfer(500000, 'USD');
    if (belowOrEqualThreshold) {
      throw new Error('5,000 USD incorrectly triggered large transfer alert (must strictly exceed)');
    }

    // 6,000 USD = 600,000 minor units
    const aboveThreshold = isLargeTransfer(600000, 'USD');
    if (!aboveThreshold) {
      throw new Error('6,000 USD failed to trigger large transfer alert');
    }

    // Currency precision independence: 5,000 JPY (zero-decimal)
    if (isLargeTransfer(5000, 'JPY')) {
      throw new Error('5,000 JPY incorrectly triggered large transfer alert');
    }
    if (!isLargeTransfer(5001, 'JPY')) {
      throw new Error('5,001 JPY failed to trigger large transfer alert');
    }

    console.log('       5,000 USD -> No alert (threshold boundary enforced)');
    console.log('       6,000 USD -> FLAGGED: Strictly exceeds 5,000 units');
    console.log('       5,001 JPY -> FLAGGED: Strictly exceeds 5,000 units');
  });

  // ----------------------------------------------------
  // TEST 3: Rule 2 — High Transaction Frequency Fraud Test
  // ----------------------------------------------------
  test('Rule 2: High Transaction Frequency Rule Detection (> 3 outgoing in 24h)', () => {
    const now = Date.now();
    const oneHourAgo = now - 3600 * 1000;
    const twoHoursAgo = now - 2 * 3600 * 1000;
    const threeHoursAgo = now - 3 * 3600 * 1000;
    const twentySixHoursAgo = now - 26 * 3600 * 1000;

    // First transfer (0 past transfers): totalInWindow = 1 <= 3
    const t1 = isHighFrequency([], now);
    if (t1.triggered || t1.totalInWindow !== 1) {
      throw new Error('1st transfer incorrectly triggered high frequency alert');
    }

    // Second transfer (1 past transfer in 24h): totalInWindow = 2 <= 3
    const t2 = isHighFrequency([threeHoursAgo], now);
    if (t2.triggered || t2.totalInWindow !== 2) {
      throw new Error('2nd transfer incorrectly triggered high frequency alert');
    }

    // Third transfer (2 past transfers in 24h): totalInWindow = 3 <= 3
    const t3 = isHighFrequency([threeHoursAgo, twoHoursAgo], now);
    if (t3.triggered || t3.totalInWindow !== 3) {
      throw new Error('3rd transfer incorrectly triggered high frequency alert');
    }

    // Fourth transfer (3 past transfers in 24h): totalInWindow = 4 > 3 -> FLAGGED
    const t4 = isHighFrequency([threeHoursAgo, twoHoursAgo, oneHourAgo], now);
    if (!t4.triggered || t4.totalInWindow !== 4) {
      throw new Error('4th transfer failed to trigger high frequency alert');
    }

    // Transfers older than 24h are excluded
    const tOld = isHighFrequency([twentySixHoursAgo, twentySixHoursAgo - 1000, twentySixHoursAgo - 2000], now);
    if (tOld.triggered || tOld.totalInWindow !== 1) {
      throw new Error('Transfers outside rolling 24-hour window should be excluded');
    }

    console.log('       Transfers 1..3 in 24h -> No alert (within allowable velocity)');
    console.log('       Transfer 4 in 24h -> FLAGGED: 4 outgoing transfers in rolling 24h');
    console.log('       Transfers > 24h ago -> Excluded from rolling window');
  });

  console.log('\n----------------------------------------------------');
  console.log(`Results: ${passed}/${total} test suites passed cleanly.`);
  console.log('----------------------------------------------------\n');

  if (passed !== total) {
    throw new Error(`Test failure: ${total - passed} test(s) failed.`);
  }
}

runPhase3Tests().catch((err) => {
  console.error('Fatal error during test run:', err);
  throw err;
});
