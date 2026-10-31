import React from 'react';
import {
  Users,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import type { Wallet, Balance } from '../../types/wallet';
import type { Transaction } from '../../types/transaction';
import { SUPPORTED_CURRENCIES, CURRENCY_CONFIGS, formatMinorUnits } from '../../utils/currency';
import { CanvasConversionChart } from './CanvasConversionChart';

interface OverviewTabProps {
  wallets: Wallet[];
  balances: Balance[];
  transactions: Transaction[];
  onOpenCreateWallet: () => void;
  onNavigateToTab: (tab: 'overview' | 'wallets' | 'operations' | 'transfer' | 'fraud' | 'activity') => void;
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
  // Aggregate current balances by currency (Never mixing currencies!)
  const currencyTotals: Record<string, number> = {};
  const issuedByCurrency: Record<string, number> = {};
  const redeemedByCurrency: Record<string, number> = {};

  SUPPORTED_CURRENCIES.forEach((c) => {
    currencyTotals[c] = 0;
    issuedByCurrency[c] = 0;
    redeemedByCurrency[c] = 0;
  });

  balances.forEach((b) => {
    if (currencyTotals[b.currency] !== undefined) {
      currencyTotals[b.currency] += b.amountMinor;
    }
  });

  // Calculate issue, redeem, transfer and fraud counts
  const issueCount = transactions.filter((t) => t.type === 'ISSUE').length;
  const redeemCount = transactions.filter((t) => t.type === 'REDEEM').length;
  const transferCount = transactions.filter((t) => t.type === 'TRANSFER').length;
  const flaggedCount = transactions.filter((t) => t.isFlagged).length;

  transactions.forEach((tx) => {
    if (tx.type === 'ISSUE') {
      const curr = tx.sourceCurrency ?? tx.currency;
      if (issuedByCurrency[curr] !== undefined) {
        issuedByCurrency[curr] += tx.sourceAmountMinor ?? tx.amountMinor;
      }
    } else if (tx.type === 'REDEEM') {
      const curr = tx.sourceCurrency ?? tx.currency;
      if (redeemedByCurrency[curr] !== undefined) {
        redeemedByCurrency[curr] += tx.sourceAmountMinor ?? tx.amountMinor;
      }
    }
  });

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

        {/* Total Transactions Card */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Operations
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-700 font-mono">
              {transactions.length}
            </span>
            <span className="text-xs text-stone-400">ledger records</span>
          </div>
          <div className="mt-3 text-[11px] text-stone-500 font-mono flex items-center gap-2">
            <span>+{issueCount} Issued</span>
            <span>•</span>
            <span>-{redeemCount} Redeemed</span>
          </div>
        </div>

        {/* Transfers & Exchange Card */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              P2P & Cross-Currency
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700 font-mono">
              {transferCount}
            </span>
            <span className="text-xs text-stone-400">transfers executed</span>
          </div>
          <div className="mt-3 text-xs text-stone-600">
            <button
              onClick={() => onNavigateToTab('transfer')}
              className="font-medium text-stone-900 hover:underline flex items-center gap-1"
            >
              <span>Go to Transfers →</span>
            </button>
          </div>
        </div>

        {/* Flagged Transactions Card */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Fraud Alerts
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              flaggedCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
            }`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-mono ${
              flaggedCount > 0 ? 'text-amber-700' : 'text-stone-800'
            }`}>
              {flaggedCount}
            </span>
            <span className="text-xs text-stone-400">flagged transactions</span>
          </div>
          <div className="mt-3 text-xs text-stone-600">
            <button
              onClick={() => onNavigateToTab('fraud')}
              className="font-medium text-stone-900 hover:underline flex items-center gap-1"
            >
              <span>View Fraud Monitor →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Total Fictional Credits Grouped By Currency (Strictly Isolated) */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#121316] flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Current Balances Grouped by Currency</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Currency isolation invariant: Distinct currencies represent independent credit pools and are never summed together.
            </p>
          </div>
          <div className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200/80 shrink-0 self-start sm:self-auto">
            7 Supported Currencies
          </div>
        </div>

        {/* Currency Balance Grid */}
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
                  <span className="text-xs font-bold text-stone-900 font-mono flex items-center gap-1">
                    <span className="text-stone-400">{config.symbol}</span>
                    <span>{curr}</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {config.fractionDigits} dec
                  </span>
                </div>
                <div className="font-mono font-bold text-sm text-[#121316] truncate">
                  {formatMinorUnits(minor, curr)}
                </div>
                <div className="mt-1 text-[10px] text-stone-400 font-mono">
                  {config.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cumulative Issued vs Redeemed Breakdown by Currency */}
        <div className="pt-3 border-t border-stone-100">
          <h3 className="text-xs font-bold text-stone-700 mb-2">Historical Volume by Currency (Issued vs Redeemed)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[11px] font-mono">
            {SUPPORTED_CURRENCIES.map((curr) => {
              const issued = issuedByCurrency[curr] || 0;
              const redeemed = redeemedByCurrency[curr] || 0;
              if (issued === 0 && redeemed === 0) return null;

              return (
                <div key={curr} className="p-2 rounded-lg bg-stone-50 border border-stone-200/60">
                  <span className="font-bold text-stone-800 block text-[10px]">{curr}</span>
                  <span className="text-emerald-700 block">+{formatMinorUnits(issued, curr)}</span>
                  <span className="text-stone-600 block">-{formatMinorUnits(redeemed, curr)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* HTML Canvas Conversion Chart */}
      <CanvasConversionChart />

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
                Use Credit Operations to add fictional balances to any created wallet.
              </p>
              <button
                onClick={() => onNavigateToTab('operations')}
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
