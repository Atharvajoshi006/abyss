import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { IssueTab } from './IssueTab';
import { RedeemTab } from './RedeemTab';
import type { Wallet, Balance } from '../../types/wallet';
import type { Transaction } from '../../types/transaction';

export type CreditOperationMode = 'issue' | 'redeem';

interface CreditOperationsTabProps {
  wallets: Wallet[];
  balances: Balance[];
  preselectedWalletId?: string;
  initialMode?: CreditOperationMode;
  onOpenCreateWallet: () => void;
  onTransactionSuccess: (tx: Transaction) => void;
}

export const CreditOperationsTab: React.FC<CreditOperationsTabProps> = ({
  wallets,
  balances,
  preselectedWalletId,
  initialMode = 'issue',
  onOpenCreateWallet,
  onTransactionSuccess,
}) => {
  const [mode, setMode] = useState<CreditOperationMode>(initialMode);

  // Synchronize when initialMode changes via external navigation
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Consolidated Segmented Controller */}
      <div className="max-w-md mx-auto p-1.5 rounded-2xl bg-stone-200/70 border border-stone-200 flex items-center shadow-inner">
        <button
          type="button"
          onClick={() => setMode('issue')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            mode === 'issue'
              ? 'bg-white text-emerald-800 shadow-xs border border-stone-200/80'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <ArrowDownLeft className={`w-4 h-4 ${mode === 'issue' ? 'text-emerald-600' : 'text-stone-400'}`} />
          <span>Issue Credits</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('redeem')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            mode === 'redeem'
              ? 'bg-white text-amber-900 shadow-xs border border-stone-200/80'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <ArrowUpRight className={`w-4 h-4 ${mode === 'redeem' ? 'text-amber-600' : 'text-stone-400'}`} />
          <span>Redeem Credits</span>
        </button>
      </div>

      {/* Render selected mode without unmounting/breaking validation */}
      {mode === 'issue' ? (
        <IssueTab
          wallets={wallets}
          balances={balances}
          preselectedWalletId={preselectedWalletId}
          onOpenCreateWallet={onOpenCreateWallet}
          onTransactionSuccess={onTransactionSuccess}
        />
      ) : (
        <RedeemTab
          wallets={wallets}
          balances={balances}
          preselectedWalletId={preselectedWalletId}
          onOpenCreateWallet={onOpenCreateWallet}
          onTransactionSuccess={onTransactionSuccess}
        />
      )}
    </div>
  );
};
