import React from 'react';
import {
  Users,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  PlusCircle,
  Database,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type { Wallet, Balance } from '../../types/wallet';
import type { Transaction } from '../../types/transaction';
import { SUPPORTED_CURRENCIES, CURRENCY_CONFIGS, formatMinorUnits } from '../../utils/currency';

interface OverviewTabProps {
  wallets: Wallet[];
  balances: Balance[];
  transactions: Transaction[];
  onOpenCreateWallet: () => void;
  onNavigateToTab: (tab: 'wallets' | 'issue' | 'redeem' | 'transfer' | 'fraud' | 'activity') => void;
  onSelectWallet: (wallet: Wallet) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  wallets,
  balances,
  transactions,
  onOpenCreateWallet,
  onNavigateToTab,
  onSelectWallet,
}) => {
  // Aggregate totals by currency (Never mixing currencies!)
  const currencyTotals: Record<string, number> = {};
  SUPPORTED_CURRENCIES.forEach((c) => {
    currencyTotals[c] = 0;
  });

  balances.forEach((b) => {
    if (currencyTotals[b.currency] !== undefined) {
      currencyTotals[b.currency] += b.amountMinor;
    }
  });

  // Calculate issue / redeem counts
  const issueCount = transactions.filter((t) => t.type === 'ISSUE').length;
  const redeemCount = transactions.filter((t) => t.type === 'REDEEM').length;

  // Build wallet lookup for quick username display
  const walletMap = new Map<string, Wallet>();
  wallets.forEach((w) => walletMap.set(w.id, w));

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Wallets Card */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Wallets
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#121316] font-mono">
              {wallets.length}
            </span>
            <span className="text-xs text-stone-400">client entities</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-600">
            <button
              onClick={onOpenCreateWallet}
              className="font-medium text-stone-900 hover:underline flex items-center gap-1"
            >
              <span>+ Create new wallet</span>
            </button>
          </div>
        </div>

        {/* Issued Ops */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Credits Issued
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700 font-mono">
              {issueCount}
            </span>
            <span className="text-xs text-stone-400">transactions</span>
          </div>
          <div className="mt-3 text-xs text-stone-500 font-mono">
            Immutable ISSUE history
          </div>
        </div>

        {/* Redeemed Ops */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Credits Redeemed
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-800 font-mono">
              {redeemCount}
            </span>
            <span className="text-xs text-stone-400">transactions</span>
          </div>
          <div className="mt-3 text-xs text-stone-500 font-mono">
            Atomic debit execution
          </div>
        </div>

        {/* Storage status */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Storage Engine
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-stone-800 font-mono">
              IndexedDB
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dexie 100% In-Browser</span>
          </div>
        </div>
      </div>

      {/* Total Fictional Credits Grouped By Currency (Strictly Isolated) */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-[#121316] flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Total Fictional Credits Grouped by Currency</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Currency isolation invariant: Distinct currencies represent independent credit pools and are never summed together.
            </p>
          </div>
          <div className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200/80 shrink-0 self-start sm:self-auto">
            7 Supported Currencies
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {SUPPORTED_CURRENCIES.map((curr) => {
            const config = CURRENCY_CONFIGS[curr];
            const minor = currencyTotals[curr] || 0;
            const hasPool = minor > 0;

            return (
              <div
                key={curr}
                className={`p-3.5 rounded-xl border transition-all ${
                  hasPool
                    ? 'bg-amber-50/50 border-amber-300/80 shadow-2xs'
                    : 'bg-stone-50/60 border-stone-200/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-lg">{config.flag}</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-stone-200/70 text-stone-800">
                    {curr}
                  </span>
                </div>
                <div className="text-sm sm:text-base font-bold font-mono text-[#121316] truncate">
                  {formatMinorUnits(minor, curr)}
                </div>
                <div className="text-[10px] text-stone-500 truncate mt-0.5">
                  {config.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Wallet Summary & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet Balance Summary */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#121316]">Active Wallets</h3>
              <p className="text-xs text-stone-500">Summary of registered wallet holders</p>
            </div>
            <button
              onClick={() => onNavigateToTab('wallets')}
              className="text-xs font-semibold text-stone-700 hover:text-black flex items-center gap-1 group"
            >
              <span>View all ({wallets.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {wallets.length === 0 ? (
            <div className="my-auto py-10 text-center border border-dashed border-stone-200 rounded-xl">
              <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs text-stone-600 font-medium">No wallets created yet</p>
              <p className="text-[11px] text-stone-400 max-w-xs mx-auto mt-1 mb-4">
                Create a wallet for Alice or Bob to start issuing and redeeming credits.
              </p>
              <button
                onClick={onOpenCreateWallet}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#121316] text-[#faf8f5] text-xs font-semibold hover:bg-stone-800 shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>Create First Wallet</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 overflow-hidden">
              {wallets.slice(0, 4).map((w) => {
                // Find non-zero balances for this wallet
                const wBalances = balances.filter(
                  (b) => b.walletId === w.id && b.amountMinor > 0
                );

                return (
                  <div
                    key={w.id}
                    onClick={() => onSelectWallet(w)}
                    className="py-3 flex items-center justify-between hover:bg-stone-50/70 px-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {w.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-stone-900 flex items-center gap-1.5">
                          <span>{w.displayName || `@${w.username}`}</span>
                          {w.displayName && (
                            <span className="text-[10px] text-stone-400 font-mono">
                              @{w.username}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          ID: {w.id.slice(0, 12)}...
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {wBalances.length === 0 ? (
                        <span className="text-[11px] text-stone-400 italic">No balance</span>
                      ) : (
                        <div className="flex flex-wrap justify-end gap-1">
                          {wBalances.slice(0, 2).map((b) => (
                            <span
                              key={b.currency}
                              className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-800"
                            >
                              {formatMinorUnits(b.amountMinor, b.currency)}
                            </span>
                          ))}
                          {wBalances.length > 2 && (
                            <span className="text-[10px] text-stone-400 self-center">
                              +{wBalances.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#121316]">Recent Operations</h3>
              <p className="text-xs text-stone-500">Latest credit ledger entries</p>
            </div>
            <button
              onClick={() => onNavigateToTab('activity')}
              className="text-xs font-semibold text-stone-700 hover:text-black flex items-center gap-1 group"
            >
              <span>View activity ({transactions.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="my-auto py-10 text-center border border-dashed border-stone-200 rounded-xl">
              <Layers className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs text-stone-600 font-medium">No transactions recorded yet</p>
              <p className="text-[11px] text-stone-400 max-w-xs mx-auto mt-1 mb-4">
                Use Issue Credits to add fictional balances to any created wallet.
              </p>
              <button
                onClick={() => onNavigateToTab('issue')}
                disabled={wallets.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Issue First Credits</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 overflow-hidden">
              {recentTransactions.map((tx) => {
                const isIssue = tx.type === 'ISSUE';
                const isRedeem = tx.type === 'REDEEM';
                const isTransfer = tx.type === 'TRANSFER';

                let usernameDisplay: React.ReactNode;
                if (isTransfer) {
                  const sender = walletMap.get(tx.senderWalletId || tx.walletId);
                  const recipient = walletMap.get(tx.recipientWalletId || '');
                  usernameDisplay = (
                    <span className="text-stone-700">
                      {sender ? `@${sender.username}` : 'Sender'} → {recipient ? `@${recipient.username}` : 'Recipient'}
                    </span>
                  );
                } else {
                  const wallet = walletMap.get(tx.walletId);
                  usernameDisplay = (
                    <span className="text-stone-700">{wallet ? `@${wallet.username}` : tx.walletId.slice(0, 8)}</span>
                  );
                }

                return (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between hover:bg-stone-50/70 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isIssue
                            ? 'bg-emerald-100 text-emerald-800'
                            : isRedeem
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {isIssue ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : isRedeem ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-stone-900 flex items-center gap-1.5">
                          <span
                            className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                              isIssue
                                ? 'bg-emerald-100 text-emerald-800'
                                : isRedeem
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {tx.type}
                          </span>
                          {tx.isFlagged && (
                            <span
                              className="px-1 py-0.2 rounded-xs text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300"
                              title="Flagged by fraud engine"
                            >
                              ⚠️
                            </span>
                          )}
                          {usernameDisplay}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          {new Date(tx.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-mono font-bold text-xs ${
                          isIssue
                            ? 'text-emerald-700'
                            : isRedeem
                            ? 'text-stone-900'
                            : 'text-indigo-700'
                        }`}
                      >
                        {isTransfer && tx.destinationCurrency && tx.destinationCurrency !== (tx.sourceCurrency ?? tx.currency) ? (
                          <span>
                            {formatMinorUnits(tx.sourceAmountMinor ?? tx.amountMinor, tx.sourceCurrency ?? tx.currency)} → {formatMinorUnits(tx.destinationAmountMinor ?? tx.amountMinor, tx.destinationCurrency)}
                          </span>
                        ) : (
                          <span>
                            {isIssue ? '+' : isRedeem ? '-' : '↔'} {formatMinorUnits(tx.amountMinor, tx.currency)}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        bal: {formatMinorUnits(tx.balanceAfterMinor, tx.currency)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
