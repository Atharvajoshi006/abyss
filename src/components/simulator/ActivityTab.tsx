import React, { useState, useMemo } from 'react';
import {
  History,
  Filter,
  Copy,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Download,
  Search,
  Calendar,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import type { Wallet } from '../../types/wallet';
import type { Transaction } from '../../types/transaction';
import { SUPPORTED_CURRENCIES, formatMinorUnits } from '../../utils/currency';
import { exportTransactionsToCSV } from '../../services/csvExporter';

interface ActivityTabProps {
  transactions: Transaction[];
  wallets: Wallet[];
  onNavigateToIssue: () => void;
}

export const ActivityTab: React.FC<ActivityTabProps> = ({
  transactions,
  wallets,
  onNavigateToIssue,
}) => {
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [flaggedOnly, setFlaggedOnly] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Interactive UI States
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<Transaction | null>(null);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const walletMap = useMemo(() => {
    const map = new Map<string, Wallet>();
    wallets.forEach((w) => map.set(w.id, w));
    return map;
  }, [wallets]);

  const handleCopy = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = (filteredOnly: boolean) => {
    try {
      const listToExport = filteredOnly ? filtered : transactions;
      if (listToExport.length === 0) {
        setExportFeedback('No transactions to export.');
        setTimeout(() => setExportFeedback(null), 3000);
        return;
      }
      exportTransactionsToCSV(listToExport, wallets, filteredOnly);
      setExportFeedback(`Exported ${listToExport.length} transaction(s) successfully!`);
      setTimeout(() => setExportFeedback(null), 3500);
    } catch (err: any) {
      setExportFeedback(`Export failed: ${err.message || 'Unknown error'}`);
      setTimeout(() => setExportFeedback(null), 4000);
    }
  };

  // Filter & Search Engine
  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return transactions
      .filter((tx) => {
        // 1. Text Search across ID, sender username, recipient username
        if (query) {
          const matchId = tx.id.toLowerCase().includes(query);
          const senderWallet = walletMap.get(tx.senderWalletId || tx.walletId);
          const matchSender = senderWallet?.username.toLowerCase().includes(query) ?? false;
          const recipientWallet = tx.recipientWalletId ? walletMap.get(tx.recipientWalletId) : undefined;
          const matchRecipient = recipientWallet?.username.toLowerCase().includes(query) ?? false;
          if (!matchId && !matchSender && !matchRecipient) {
            return false;
          }
        }

        // 2. Wallet Filter
        if (selectedWalletId !== 'ALL') {
          const isSender = tx.senderWalletId === selectedWalletId || tx.walletId === selectedWalletId;
          const isRecipient = tx.recipientWalletId === selectedWalletId;
          if (!isSender && !isRecipient) return false;
        }

        // 3. Operation Type Filter
        if (selectedType !== 'ALL' && tx.type !== selectedType) return false;

        // 4. Currency Filter
        if (selectedCurrency !== 'ALL') {
          const srcCurr = tx.sourceCurrency ?? tx.currency;
          const destCurr = tx.destinationCurrency ?? tx.currency;
          if (srcCurr !== selectedCurrency && destCurr !== selectedCurrency) {
            return false;
          }
        }

        // 5. Flagged Only Filter
        if (flaggedOnly && !tx.isFlagged) {
          return false;
        }

        // 6. Date Range Filter
        if (startDate) {
          const txDate = new Date(tx.createdAt).setHours(0, 0, 0, 0);
          const start = new Date(startDate).setHours(0, 0, 0, 0);
          if (txDate < start) return false;
        }

        if (endDate) {
          const txDate = new Date(tx.createdAt).setHours(23, 59, 59, 999);
          const end = new Date(endDate).setHours(23, 59, 59, 999);
          if (txDate > end) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [
    transactions,
    searchQuery,
    selectedWalletId,
    selectedType,
    selectedCurrency,
    flaggedOnly,
    startDate,
    endDate,
    sortOrder,
    walletMap,
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Controls: Search, Filters, CSV Actions */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
        {/* Row 1: Search Bar & Export Buttons */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by transaction ID or @username..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 bg-stone-50/60 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:bg-white focus:border-stone-400 font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {exportFeedback && (
              <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                {exportFeedback}
              </span>
            )}

            <button
              onClick={() => handleExport(false)}
              disabled={transactions.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold disabled:opacity-40 transition-colors"
              title="Download full transaction history as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-stone-600" />
              <span>Export All CSV</span>
            </button>

            <button
              onClick={() => handleExport(true)}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold disabled:opacity-40 transition-colors shadow-2xs"
              title="Download currently filtered transactions as CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Export Filtered ({filtered.length})</span>
            </button>
          </div>
        </div>

        {/* Row 2: Comprehensive Filters Bar */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-1.5 text-stone-500 font-bold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Wallet Filter */}
          <select
            value={selectedWalletId}
            onChange={(e) => setSelectedWalletId(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 font-mono focus:outline-hidden focus:bg-white"
          >
            <option value="ALL">All Wallets</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                @{w.username}
              </option>
            ))}
          </select>

          {/* Operation Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 font-mono focus:outline-hidden focus:bg-white"
          >
            <option value="ALL">All Types</option>
            <option value="ISSUE">ISSUE (Credit)</option>
            <option value="REDEEM">REDEEM (Debit)</option>
            <option value="TRANSFER">TRANSFER (P2P)</option>
          </select>

          {/* Currency Filter */}
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 font-mono focus:outline-hidden focus:bg-white"
          >
            <option value="ALL">All Currencies</option>
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Date Range Filters */}
          <div className="flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-xl border border-stone-200">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-stone-700 text-[11px] font-mono focus:outline-hidden"
              title="From date"
            />
            <span className="text-stone-300">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-stone-700 text-[11px] font-mono focus:outline-hidden"
              title="To date"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-stone-400 hover:text-stone-700 text-[10px]"
                title="Clear date filter"
              >
                ✕
              </button>
            )}
          </div>

          {/* Flagged Only Toggle */}
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer select-none text-stone-700 hover:bg-stone-100">
            <input
              type="checkbox"
              checked={flaggedOnly}
              onChange={(e) => setFlaggedOnly(e.target.checked)}
              className="rounded-xs text-amber-600 focus:ring-0"
            />
            <span className="text-[11px] font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span>Flagged Only</span>
            </span>
          </label>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 font-mono text-[11px]"
            title={`Sort: ${sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}`}
          >
            <ArrowUpDown className="w-3 h-3 text-stone-500" />
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>

          <div className="ml-auto text-xs text-stone-400 font-mono">
            {filtered.length} of {transactions.length}
          </div>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-stone-200 rounded-2xl bg-white p-6">
          <History className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">No Operations Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-5">
            {transactions.length === 0
              ? 'No credit issuance, redemption, or transfer transactions have been executed yet.'
              : 'No transactions matched the selected filter and search criteria.'}
          </p>
          {transactions.length === 0 && (
            <button
              onClick={onNavigateToIssue}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Issue First Credits</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200/80 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Entity / Participants</th>
                  <th className="py-3.5 px-4">Operation</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Currency</th>
                  <th className="py-3.5 px-4 text-right">Balance After</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {filtered.map((tx) => {
                  const isIssue = tx.type === 'ISSUE';
                  const isRedeem = tx.type === 'REDEEM';
                  const isTransfer = tx.type === 'TRANSFER';

                  let participantDisplay: React.ReactNode;
                  if (isTransfer) {
                    const sender = walletMap.get(tx.senderWalletId || tx.walletId);
                    const recipient = walletMap.get(tx.recipientWalletId || '');
                    participantDisplay = (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-stone-900">
                          {sender ? `@${sender.username}` : (tx.senderWalletId || tx.walletId).slice(0, 8)}
                        </span>
                        <span className="text-stone-400">→</span>
                        <span className="font-semibold text-stone-900">
                          {recipient ? `@${recipient.username}` : (tx.recipientWalletId || '').slice(0, 8)}
                        </span>
                      </div>
                    );
                  } else {
                    const wallet = walletMap.get(tx.walletId);
                    participantDisplay = (
                      <span className="font-semibold text-stone-900">
                        {wallet ? `@${wallet.username}` : tx.walletId.slice(0, 10)}
                      </span>
                    );
                  }

                  let typeBadge: React.ReactNode;
                  if (isIssue) {
                    typeBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                        <ArrowDownLeft className="w-3 h-3 text-emerald-700" />
                        <span>ISSUE</span>
                      </span>
                    );
                  } else if (isRedeem) {
                    typeBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200/60">
                        <ArrowUpRight className="w-3 h-3 text-amber-700" />
                        <span>REDEEM</span>
                      </span>
                    );
                  } else {
                    typeBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200/60">
                        <ArrowLeftRight className="w-3 h-3 text-indigo-700" />
                        <span>TRANSFER</span>
                      </span>
                    );
                  }

                  let balanceAfterDisplay: React.ReactNode;
                  if (isTransfer) {
                    const srcCurr = tx.sourceCurrency ?? tx.currency;
                    const destCurr = tx.destinationCurrency ?? tx.currency;
                    balanceAfterDisplay = (
                      <div className="text-right text-[11px]">
                        <span className="text-stone-700">
                          S: {formatMinorUnits(tx.senderBalanceAfterMinor ?? tx.balanceAfterMinor, srcCurr)}
                        </span>
                        <br />
                        <span className="text-emerald-700">
                          R: {formatMinorUnits(tx.recipientBalanceAfterMinor ?? 0, destCurr)}
                        </span>
                      </div>
                    );
                  } else {
                    balanceAfterDisplay = (
                      <span className="font-bold text-stone-800">
                        {formatMinorUnits(tx.balanceAfterMinor, tx.currency)}
                      </span>
                    );
                  }

                  const isCrossCurrency =
                    isTransfer &&
                    !!tx.destinationCurrency &&
                    tx.destinationCurrency !== (tx.sourceCurrency ?? tx.currency);

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedTxForDetail(tx)}
                      className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Tx ID */}
                      <td className="py-3 px-4 font-semibold text-stone-900">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[120px]">{tx.id}</span>
                          <button
                            onClick={(e) => handleCopy(tx.id, e)}
                            className="text-stone-400 hover:text-stone-700 p-0.5"
                            title="Copy full transaction ID"
                          >
                            {copiedId === tx.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-stone-600 text-[11px]">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>

                      {/* Entity / Participants */}
                      <td className="py-3 px-4">{participantDisplay}</td>

                      {/* Operation Type & Fraud Flag */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {typeBadge}
                          {tx.isFlagged && (
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300"
                              title={tx.flagReasons?.join('; ') || 'Flagged by fraud engine'}
                            >
                              ⚠️ Flagged
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right">
                        {isCrossCurrency ? (
                          <div>
                            <span className="font-bold text-indigo-700">
                              {formatMinorUnits(tx.sourceAmountMinor ?? tx.amountMinor, tx.sourceCurrency ?? tx.currency)}
                              {' → '}
                              {formatMinorUnits(tx.destinationAmountMinor ?? tx.amountMinor, tx.destinationCurrency!)}
                            </span>
                            {tx.exchangeRate && (
                              <div className="text-[10px] text-stone-400">
                                1 {tx.sourceCurrency ?? tx.currency} = {tx.exchangeRate.toFixed(4)} {tx.destinationCurrency}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span
                            className={`font-bold ${
                              isIssue
                                ? 'text-emerald-700'
                                : isRedeem
                                ? 'text-stone-900'
                                : 'text-indigo-700'
                            }`}
                          >
                            {isIssue ? '+' : isRedeem ? '-' : '↔'}{' '}
                            {formatMinorUnits(tx.amountMinor, tx.currency)}
                          </span>
                        )}
                      </td>

                      {/* Currency */}
                      <td className="py-3 px-4">
                        {isCrossCurrency ? (
                          <span className="px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-800 font-semibold text-[10px] border border-indigo-200">
                            {tx.sourceCurrency ?? tx.currency} → {tx.destinationCurrency}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-sm bg-stone-100 text-stone-700 font-semibold text-[10px]">
                            {tx.currency}
                          </span>
                        )}
                      </td>

                      {/* Balance After */}
                      <td className="py-3 px-4 text-right">{balanceAfterDisplay}</td>

                      {/* Action / View Detail */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTxForDetail(tx);
                          }}
                          className="px-2 py-1 rounded-md text-[10px] font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 group-hover:bg-stone-200 transition-colors inline-flex items-center gap-1"
                        >
                          <span>Details</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTxForDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800 font-bold">
                  {selectedTxForDetail.type === 'ISSUE' ? (
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  ) : selectedTxForDetail.type === 'REDEEM' ? (
                    <ArrowUpRight className="w-4 h-4 text-amber-600" />
                  ) : (
                    <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Transaction Details</h3>
                  <p className="text-[10px] font-mono text-stone-400">{selectedTxForDetail.type} Operation</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTxForDetail(null)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 text-[11px]">Transaction ID:</span>
                  <div className="flex items-center gap-1 font-bold text-stone-900">
                    <span className="truncate max-w-[200px]">{selectedTxForDetail.id}</span>
                    <button
                      onClick={() => handleCopy(selectedTxForDetail.id)}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-stone-500 text-[11px]">Timestamp:</span>
                  <span className="text-stone-800">{new Date(selectedTxForDetail.createdAt).toISOString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-stone-500 text-[11px]">Idempotency Key:</span>
                  <span className="text-stone-700 truncate max-w-[200px] text-[10px]">
                    {selectedTxForDetail.idempotencyKey}
                  </span>
                </div>
              </div>

              {/* Amounts & Currency Conversion breakdown */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 text-[11px]">Source Amount:</span>
                  <span className="font-bold text-stone-900">
                    {formatMinorUnits(
                      selectedTxForDetail.sourceAmountMinor ?? selectedTxForDetail.amountMinor,
                      selectedTxForDetail.sourceCurrency ?? selectedTxForDetail.currency
                    )}
                  </span>
                </div>

                {selectedTxForDetail.type === 'TRANSFER' && selectedTxForDetail.destinationCurrency && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500 text-[11px]">Destination Amount:</span>
                      <span className="font-bold text-indigo-700">
                        {formatMinorUnits(
                          selectedTxForDetail.destinationAmountMinor ?? selectedTxForDetail.amountMinor,
                          selectedTxForDetail.destinationCurrency
                        )}
                      </span>
                    </div>

                    {selectedTxForDetail.exchangeRate && (
                      <div className="flex justify-between items-center pt-1 border-t border-stone-200/60">
                        <span className="text-stone-500 text-[11px]">Applied Rate:</span>
                        <span className="text-stone-800 text-[11px]">
                          1 {selectedTxForDetail.sourceCurrency} = {selectedTxForDetail.exchangeRate.toFixed(4)}{' '}
                          {selectedTxForDetail.destinationCurrency} ({selectedTxForDetail.exchangeRateSource || 'ref'})
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Fraud Details if flagged */}
              {selectedTxForDetail.isFlagged && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Flagged by Rule-Based Fraud Detection</span>
                  </div>
                  {selectedTxForDetail.flagReasons && (
                    <ul className="list-disc list-inside text-[11px] text-amber-800 mt-1 space-y-0.5">
                      {selectedTxForDetail.flagReasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTxForDetail(null)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
