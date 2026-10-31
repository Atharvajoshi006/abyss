import React, { useState } from 'react';
import {
  History,
  Filter,
  Copy,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import type { Wallet } from '../../types/wallet';
import type { Transaction } from '../../types/transaction';
import { SUPPORTED_CURRENCIES, formatMinorUnits } from '../../utils/currency';

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
  const [selectedWalletId, setSelectedWalletId] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const walletMap = new Map<string, Wallet>();
  wallets.forEach((w) => walletMap.set(w.id, w));

  const filtered = transactions.filter((tx) => {
    if (selectedWalletId !== 'ALL' && tx.walletId !== selectedWalletId) return false;
    if (selectedType !== 'ALL' && tx.type !== selectedType) return false;
    if (selectedCurrency !== 'ALL' && tx.currency !== selectedCurrency) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Wallet Filter */}
          <select
            value={selectedWalletId}
            onChange={(e) => setSelectedWalletId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 font-mono focus:outline-hidden focus:bg-white"
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
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 font-mono focus:outline-hidden focus:bg-white"
          >
            <option value="ALL">All Types</option>
            <option value="ISSUE">ISSUE (Credit)</option>
            <option value="REDEEM">REDEEM (Debit)</option>
          </select>

          {/* Currency Filter */}
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 font-mono focus:outline-hidden focus:bg-white"
          >
            <option value="ALL">All Currencies</option>
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-stone-500 font-mono">
          Showing {filtered.length} of {transactions.length} records
        </div>
      </div>

      {/* Transactions Ledger Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-stone-200 rounded-2xl bg-white p-6">
          <History className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">No Operations Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-5">
            {transactions.length === 0
              ? 'No credit issuance or redemption transactions have been executed yet.'
              : 'No transactions matched the selected filter criteria.'}
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
                  <th className="py-3.5 px-4">Wallet</th>
                  <th className="py-3.5 px-4">Operation</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Currency</th>
                  <th className="py-3.5 px-4 text-right">Balance After</th>
                  <th className="py-3.5 px-4">Idempotency Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {filtered.map((tx) => {
                  const wallet = walletMap.get(tx.walletId);
                  const username = wallet ? `@${wallet.username}` : tx.walletId.slice(0, 10);
                  const isIssue = tx.type === 'ISSUE';

                  return (
                    <tr key={tx.id} className="hover:bg-stone-50/60 transition-colors">
                      {/* Tx ID */}
                      <td className="py-3 px-4 font-semibold text-stone-900">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[120px]">{tx.id}</span>
                          <button
                            onClick={() => handleCopy(tx.id)}
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

                      {/* Wallet */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-stone-900">{username}</span>
                      </td>

                      {/* Operation Type */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isIssue
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/60'
                              : 'bg-amber-100 text-amber-900 border border-amber-200/60'
                          }`}
                        >
                          {isIssue ? (
                            <ArrowDownLeft className="w-3 h-3 text-emerald-700" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-amber-700" />
                          )}
                          <span>{tx.type}</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-bold ${
                            isIssue ? 'text-emerald-700' : 'text-stone-900'
                          }`}
                        >
                          {isIssue ? '+' : '-'} {formatMinorUnits(tx.amountMinor, tx.currency)}
                        </span>
                      </td>

                      {/* Currency */}
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 rounded-sm bg-stone-100 text-stone-700 font-semibold text-[10px]">
                          {tx.currency}
                        </span>
                      </td>

                      {/* Balance After */}
                      <td className="py-3 px-4 text-right font-bold text-stone-800">
                        {formatMinorUnits(tx.balanceAfterMinor, tx.currency)}
                      </td>

                      {/* Idempotency Key */}
                      <td className="py-3 px-4 text-[10px] text-stone-400">
                        <span className="truncate max-w-[100px] block" title={tx.idempotencyKey}>
                          {tx.idempotencyKey.slice(0, 16)}...
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
