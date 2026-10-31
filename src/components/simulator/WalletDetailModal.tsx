import React, { useState } from 'react';
import {
  X,
  Wallet as WalletIcon,
  Copy,
  Check,
  Calendar,
  PlusCircle,
  MinusCircle,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import type { Wallet, Balance } from '../../types/wallet';
import type { Transaction } from '../../types/transaction';
import { SUPPORTED_CURRENCIES, CURRENCY_CONFIGS, formatMinorUnits } from '../../utils/currency';

interface WalletDetailModalProps {
  isOpen: boolean;
  wallet: Wallet | null;
  balances: Balance[];
  transactions: Transaction[];
  onClose: () => void;
  onNavigateToIssue: (walletId: string) => void;
  onNavigateToRedeem: (walletId: string) => void;
}

export const WalletDetailModal: React.FC<WalletDetailModalProps> = ({
  isOpen,
  wallet,
  balances,
  transactions,
  onClose,
  onNavigateToIssue,
  onNavigateToRedeem,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !wallet) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(wallet.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const balanceMap = new Map<string, number>();
  balances.forEach((b) => balanceMap.set(b.currency, b.amountMinor));

  const walletTransactions = transactions.filter((t) => t.walletId === wallet.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#faf8f5] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#121316] text-amber-400 flex items-center justify-center font-mono font-bold text-lg shadow-xs">
              {wallet.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#121316]">
                  {wallet.displayName || `@${wallet.username}`}
                </h2>
                {wallet.displayName && (
                  <span className="text-xs font-mono text-stone-500">@{wallet.username}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono text-stone-400">ID: {wallet.id.slice(0, 16)}...</span>
                <button
                  onClick={handleCopyId}
                  className="text-stone-400 hover:text-stone-700 transition-colors p-0.5"
                  title="Copy full wallet ID"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Metadata bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200/70">
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <Calendar className="w-4 h-4 text-stone-400" />
              <span>Created on: {new Date(wallet.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onNavigateToIssue(wallet.id);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Issue Credits</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToRedeem(wallet.id);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121316] hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                <MinusCircle className="w-3.5 h-3.5" />
                <span>Redeem Credits</span>
              </button>
            </div>
          </div>

          {/* Currency Balances Grid */}
          <div>
            <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <WalletIcon className="w-3.5 h-3.5" />
              <span>Currency Balances</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {SUPPORTED_CURRENCIES.map((curr) => {
                const config = CURRENCY_CONFIGS[curr];
                const minor = balanceMap.get(curr) || 0;
                const hasBalance = minor > 0;

                return (
                  <div
                    key={curr}
                    className={`p-3 rounded-xl border transition-all ${
                      hasBalance
                        ? 'bg-amber-50/40 border-amber-200/80 shadow-2xs'
                        : 'bg-white border-stone-200/70 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{config.flag}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-stone-100 text-stone-700">
                        {curr}
                      </span>
                    </div>
                    <div className="font-mono font-bold text-sm text-stone-900 truncate">
                      {formatMinorUnits(minor, curr)}
                    </div>
                    <div className="text-[10px] text-stone-500 truncate">{config.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity / Transactions for this wallet */}
          <div>
            <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-3">
              Wallet History ({walletTransactions.length} operations)
            </h3>
            {walletTransactions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-stone-200 rounded-xl text-stone-500 text-xs">
                No credit issuance or redemption operations recorded for this wallet yet.
              </div>
            ) : (
              <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 max-h-52 overflow-y-auto">
                {walletTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 flex items-center justify-between text-xs hover:bg-stone-50/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          tx.type === 'ISSUE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tx.type === 'ISSUE' ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-stone-800">
                          {tx.type === 'ISSUE' ? 'Credits Issued' : 'Credits Redeemed'}
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
                        className={`font-mono font-bold ${
                          tx.type === 'ISSUE' ? 'text-emerald-700' : 'text-stone-900'
                        }`}
                      >
                        {tx.type === 'ISSUE' ? '+' : '-'} {formatMinorUnits(tx.amountMinor, tx.currency)}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        Balance after: {formatMinorUnits(tx.balanceAfterMinor, tx.currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
