import type { Transaction } from '../types/transaction';
import type { Wallet } from '../types/wallet';
import { formatMinorUnits } from '../utils/currency';

/**
 * Escapes a cell value for CSV format.
 * - Protects against spreadsheet formula injection (=, +, -, @, tab, cr).
 * - Escapes double quotes by doubling them ("" -> """").
 * - Wraps fields in double quotes if they contain commas, quotes, or newlines.
 */
function sanitizeCSVField(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // Formula injection defense: prepend single quote if cell starts with dangerous formula chars
  const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousPrefixes.some((prefix) => str.startsWith(prefix))) {
    str = `'${str}`;
  }

  // Escape double quotes
  if (str.includes('"')) {
    str = str.replace(/"/g, '""');
  }

  // Quote if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str}"`;
  }

  return str;
}

/**
 * Formats a transaction list into CSV string format.
 */
export function generateTransactionsCSV(
  transactions: Transaction[],
  wallets: Wallet[]
): string {
  const walletMap = new Map<string, Wallet>();
  wallets.forEach((w) => walletMap.set(w.id, w));

  const headers = [
    'Transaction ID',
    'Transaction Type',
    'Sender Username',
    'Recipient Username',
    'Wallet ID',
    'Source Amount',
    'Source Currency',
    'Destination Amount',
    'Destination Currency',
    'Exchange Rate',
    'Exchange Rate Date',
    'Transaction Timestamp',
    'Sender Balance After',
    'Recipient Balance After',
    'Fraud Status',
    'Fraud Reasons',
  ];

  const rows: string[] = [headers.map(sanitizeCSVField).join(',')];

  for (const tx of transactions) {
    const isTransfer = tx.type === 'TRANSFER';
    const senderWallet = isTransfer
      ? walletMap.get(tx.senderWalletId || tx.walletId)
      : walletMap.get(tx.walletId);
    const recipientWallet = isTransfer && tx.recipientWalletId
      ? walletMap.get(tx.recipientWalletId)
      : undefined;

    const senderUsername = senderWallet ? senderWallet.username : (tx.senderWalletId || tx.walletId || '');
    const recipientUsername = recipientWallet ? recipientWallet.username : (tx.recipientWalletId || '');

    const sourceCurr = tx.sourceCurrency ?? tx.currency;
    const destCurr = tx.destinationCurrency ?? (isTransfer ? tx.currency : '');

    const sourceAmountFormatted = formatMinorUnits(tx.sourceAmountMinor ?? tx.amountMinor, sourceCurr);
    const destAmountFormatted = isTransfer
      ? formatMinorUnits(tx.destinationAmountMinor ?? tx.amountMinor, destCurr || sourceCurr)
      : '';

    const rateStr = tx.exchangeRate !== undefined ? String(tx.exchangeRate) : '';
    const rateDateStr = tx.exchangeRateDate || '';

    const senderBalAfter = tx.senderBalanceAfterMinor !== undefined
      ? formatMinorUnits(tx.senderBalanceAfterMinor, sourceCurr)
      : formatMinorUnits(tx.balanceAfterMinor, tx.currency);

    const recipientBalAfter = tx.recipientBalanceAfterMinor !== undefined
      ? formatMinorUnits(tx.recipientBalanceAfterMinor, destCurr || tx.currency)
      : '';

    const fraudStatus = tx.isFlagged ? 'FLAGGED' : 'CLEAR';
    const fraudReasons = tx.flagReasons && tx.flagReasons.length > 0 ? tx.flagReasons.join('; ') : '';

    const row = [
      tx.id,
      tx.type,
      senderUsername,
      recipientUsername,
      tx.walletId,
      sourceAmountFormatted,
      sourceCurr,
      destAmountFormatted,
      destCurr,
      rateStr,
      rateDateStr,
      new Date(tx.createdAt).toISOString(),
      senderBalAfter,
      recipientBalAfter,
      fraudStatus,
      fraudReasons,
    ];

    rows.push(row.map(sanitizeCSVField).join(','));
  }

  // Prepend UTF-8 BOM for Excel / spreadsheet compatibility
  return '\uFEFF' + rows.join('\r\n');
}

/**
 * Triggers a browser file download using native Blob and URL.createObjectURL APIs.
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Exports transactions to a downloaded CSV file.
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  wallets: Wallet[],
  isFiltered: boolean = false
): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = isFiltered
    ? `timewallet-filtered-transactions-${dateStr}.csv`
    : `timewallet-transactions-${dateStr}.csv`;

  const csvContent = generateTransactionsCSV(transactions, wallets);
  downloadCSV(csvContent, filename);
}
