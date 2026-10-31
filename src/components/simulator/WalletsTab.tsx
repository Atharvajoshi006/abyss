import React, { useState } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  Copy,
  Check,
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
} from 'lucide-react';
import type { Wallet, Balance } from '../../types/wallet';
import { formatMinorUnits, SUPPORTED_CURRENCIES } from '../../utils/currency';

interface WalletsTabProps {
  wallets: Wallet[];
  balances: Balance[];
  onOpenCreateWallet: () => void;
  onSelectWallet: (wallet: Wallet) => void;
  onNavigateToIssue: (walletId: string) => void;
  onNavigateToRedeem: (walletId: string) => void;
  onNavigateToTransfer?: (walletId: string) => void;
}

export const WalletsTab: React.FC<WalletsTabProps> = ({
  wallets,
  balances,
  onOpenCreateWallet,
  onSelectWallet,
  onNavigateToIssue,
  onNavigateToRedeem,
  onNavigateToTransfer,
}) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredWallets = wallets.filter((w) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      w.username.toLowerCase().includes(q) ||
      (w.displayName && w.displayName.toLowerCase().includes(q)) ||
      w.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, display name, or wallet ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 bg-stone-50/70 text-xs text-stone-900 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-stone-900 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-stone-500 font-mono hidden md:block">
            {wallets.length} wallet{wallets.length === 1 ? '' : 's'} registered
          </div>
          <button
            onClick={onOpenCreateWallet}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#121316] text-[#faf8f5] text-xs font-semibold hover:bg-stone-800 shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>Create Wallet</span>
          </button>
        </div>
      </div>

      {/* Wallets Grid */}
      {filteredWallets.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-stone-200 rounded-2xl bg-white p-6">
          <Users className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">
            {wallets.length === 0 ? 'No Wallets Found' : 'No matching wallets'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-5">
            {wallets.length === 0
              ? 'Get started by creating your first client-side wallet in IndexedDB.'
              : `No wallets matched your search query "${search}".`}
          </p>
          {wallets.length === 0 && (
            <button
              onClick={onOpenCreateWallet}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#121316] text-white text-xs font-semibold hover:bg-stone-800 shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>Create Alice's Wallet</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWallets.map((wallet) => {
            const walletBalances = balances.filter(
              (b) => b.walletId === wallet.id && b.amountMinor > 0
            );

            return (
              <div
                key={wallet.id}
                onClick={() => onSelectWallet(wallet)}
                className="group relative p-5 rounded-2xl bg-white border border-stone-200 hover:border-stone-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top user row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#121316] text-amber-400 font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        {wallet.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#121316] leading-tight flex items-center gap-1.5">
                          <span>{wallet.displayName || `@${wallet.username}`}</span>
                        </h4>
                        <div className="text-xs text-stone-500 font-mono">
                          @{wallet.username}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                      IndexedDB
                    </span>
                  </div>

                  {/* Wallet ID & Created date */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-100 text-[11px] font-mono text-stone-500 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">ID:</span>
                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-[150px]">{wallet.id}</span>
                        <button
                          onClick={(e) => handleCopy(wallet.id, e)}
                          className="text-stone-400 hover:text-stone-800 transition-colors p-0.5"
                          title="Copy ID"
                        >
                          {copiedId === wallet.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Created:</span>
                      <span>{new Date(wallet.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Balances Section */}
                  <div className="mb-4">
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Currencies Held</span>
                      <span>{walletBalances.length} / {SUPPORTED_CURRENCIES.length}</span>
                    </div>

                    {walletBalances.length === 0 ? (
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-[11px] text-stone-400 italic text-center">
                        Zero credits. Ready for issuance.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {walletBalances.map((b) => (
                          <div
                            key={b.currency}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-200/80 text-stone-900 font-mono text-xs font-bold"
                          >
                            <span className="text-[10px] text-stone-500">{b.currency}</span>
                            <span>{formatMinorUnits(b.amountMinor, b.currency)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToIssue(wallet.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200/60 flex items-center gap-1 transition-colors"
                      title="Issue credits to this wallet"
                    >
                      <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                      <span>Issue</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToRedeem(wallet.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold border border-stone-200/70 flex items-center gap-1 transition-colors"
                      title="Redeem credits from this wallet"
                    >
                      <ArrowUpRight className="w-3 h-3 text-stone-600" />
                      <span>Redeem</span>
                    </button>
                    {onNavigateToTransfer && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToTransfer(wallet.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] font-semibold border border-indigo-200/60 flex items-center gap-1 transition-colors"
                        title="Transfer credits from this wallet"
                      >
                        <ArrowLeftRight className="w-3 h-3 text-indigo-600" />
                        <span>Transfer</span>
                      </button>
                    )}
                  </div>

                  <span className="text-[11px] font-semibold text-stone-400 group-hover:text-stone-900 flex items-center gap-1 transition-colors">
                    <span>Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
