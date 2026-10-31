import { generateTransactionsCSV } from '../services/csvExporter';
import type { Transaction } from '../types/transaction';
import type { Wallet } from '../types/wallet';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

console.log('=== TEST: CSV Exporter Integrity & Security ===');

const mockWallets: Wallet[] = [
  { id: 'w-alice', username: 'alice', usernameKey: 'alice', displayName: 'Alice In Wonderland', createdAt: '2026-10-31T00:00:00.000Z' },
  { id: 'w-bob', username: 'bob', usernameKey: 'bob', displayName: 'Bob The Builder', createdAt: '2026-10-31T00:00:00.000Z' },
  { id: 'w-malicious', username: '=cmd|/c calc', usernameKey: '=cmd|/c calc', displayName: '+malicious', createdAt: '2026-10-31T00:00:00.000Z' },
];

const mockTransactions: Transaction[] = [
  // 1. ISSUE transaction
  {
    id: 'tx-issue-1',
    walletId: 'w-alice',
    type: 'ISSUE',
    amountMinor: 50000, // 500.00 USD
    currency: 'USD',
    balanceAfterMinor: 50000,
    idempotencyKey: 'idem-issue-1',
    createdAt: '2026-10-31T10:00:00.000Z',
  },
  // 2. REDEEM transaction
  {
    id: 'tx-redeem-1',
    walletId: 'w-alice',
    type: 'REDEEM',
    amountMinor: 10000, // 100.00 USD
    currency: 'USD',
    balanceAfterMinor: 40000,
    idempotencyKey: 'idem-redeem-1',
    createdAt: '2026-10-31T10:30:00.000Z',
  },
  // 3. Same-currency TRANSFER transaction
  {
    id: 'tx-transfer-same',
    walletId: 'w-alice',
    senderWalletId: 'w-alice',
    recipientWalletId: 'w-bob',
    type: 'TRANSFER',
    amountMinor: 5000, // 50.00 USD
    currency: 'USD',
    balanceAfterMinor: 35000,
    senderBalanceAfterMinor: 35000,
    recipientBalanceAfterMinor: 5000,
    idempotencyKey: 'idem-transfer-same',
    createdAt: '2026-10-31T11:00:00.000Z',
  },
  // 4. Cross-currency TRANSFER with Fraud Flag
  {
    id: 'tx-transfer-cross-flagged',
    walletId: 'w-alice',
    senderWalletId: 'w-alice',
    recipientWalletId: 'w-bob',
    type: 'TRANSFER',
    amountMinor: 600000, // 6,000 USD
    currency: 'USD',
    balanceAfterMinor: 0,
    sourceAmountMinor: 600000,
    sourceCurrency: 'USD',
    destinationAmountMinor: 57072000, // 570,720.00 INR
    destinationCurrency: 'INR',
    exchangeRate: 95.12,
    exchangeRateDate: '2026-10-31',
    exchangeRateFetchedAt: '2026-10-31T11:15:00.000Z',
    exchangeRateSource: 'api',
    senderBalanceAfterMinor: 0,
    recipientBalanceAfterMinor: 57072000,
    isFlagged: true,
    flagReasons: ['Transfer strictly exceeds 5,000 unit threshold'],
    idempotencyKey: 'idem-transfer-cross',
    createdAt: '2026-10-31T11:15:00.000Z',
  },
  // 5. Formula Injection attempt transaction
  {
    id: 'tx-formula-injection',
    walletId: 'w-malicious',
    type: 'ISSUE',
    amountMinor: 1000,
    currency: 'USD',
    balanceAfterMinor: 1000,
    idempotencyKey: '=1+1',
    createdAt: '2026-10-31T11:30:00.000Z',
  },
];

const csvOutput = generateTransactionsCSV(mockTransactions, mockWallets);

// Test UTF-8 BOM
assert(csvOutput.charCodeAt(0) === 0xFEFF, 'CSV output starts with UTF-8 BOM (\\uFEFF)');

const lines = csvOutput.slice(1).split('\r\n');
assert(lines.length === 6, `Expected 6 lines (1 header + 5 rows), got ${lines.length}`);

// Header verification
const header = lines[0];
assert(header.includes('Transaction ID,Transaction Type,Sender Username,Recipient Username'), 'Header contains correct column names');
assert(header.includes('Exchange Rate,Exchange Rate Date'), 'Header contains exchange rate columns');
assert(header.includes('Fraud Status,Fraud Reasons'), 'Header contains fraud columns');

// Row 1 (ISSUE): recipient username and exchange rate must be empty, not invented
const issueRow = lines[1];
assert(issueRow.includes('tx-issue-1,ISSUE,alice'), 'Issue row correctly maps sender username and type');

// Row 3 (Same-currency transfer)
const sameTxRow = lines[3];
assert(sameTxRow.includes('tx-transfer-same,TRANSFER,alice,bob'), 'Transfer row correctly maps sender and recipient usernames');

// Row 4 (Cross-currency transfer with flag)
const crossRow = lines[4];
assert(crossRow.includes('USD,') && crossRow.includes('INR,'), 'Cross-currency row records source and destination currencies');
assert(crossRow.includes('95.12,2026-10-31'), 'Cross-currency row records exchange rate and rate date');
assert(crossRow.includes('FLAGGED'), 'Cross-currency row records FLAGGED status');
assert(crossRow.includes('5,000 unit threshold'), 'Cross-currency row records fraud reasons');

// Row 5 (Formula injection defense check)
const injectionRow = lines[5];
assert(injectionRow.includes("'=cmd|/c calc"), 'Username starting with = is safely escaped with single-quote prefix');

console.log('\nAll CSV Exporter unit tests passed successfully!');
