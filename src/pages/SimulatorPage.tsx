import React, { useState, useEffect, useCallback } from 'react';
import { SimulatorNavbar, type SimulatorTab } from '../components/simulator/SimulatorNavbar';
import { OverviewTab } from '../components/simulator/OverviewTab';
import { WalletsTab } from '../components/simulator/WalletsTab';
import { IssueTab } from '../components/simulator/IssueTab';
import { RedeemTab } from '../components/simulator/RedeemTab';
import { TransferTab } from '../components/simulator/TransferTab';
import { ActivityTab } from '../components/simulator/ActivityTab';
import { CreateWalletModal } from '../components/simulator/CreateWalletModal';
import { WalletDetailModal } from '../components/simulator/WalletDetailModal';
import { getWallets } from '../services/walletService';
import { getAllBalances, getTransactions } from '../services/creditService';
import type { Wallet, Balance } from '../types/wallet';
import type { Transaction } from '../types/transaction';
import { Loader2 } from 'lucide-react';

interface SimulatorPageProps {
  onNavigateHome: () => void;
}

export const SimulatorPage: React.FC<SimulatorPageProps> = ({ onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState<SimulatorTab>('overview');
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals & Contextual Selection
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedWalletForDetail, setSelectedWalletForDetail] = useState<Wallet | null>(null);
  const [preselectedWalletId, setPreselectedWalletId] = useState<string | undefined>(undefined);

  // Central refresh mechanism
  const refreshData = useCallback(async () => {
    try {
      const [fetchedWallets, fetchedBalances, fetchedTransactions] = await Promise.all([
        getWallets(),
        getAllBalances(),
        getTransactions(),
      ]);
      setWallets(fetchedWallets);
      setBalances(fetchedBalances);
      setTransactions(fetchedTransactions);
    } catch (err) {
      console.error('Error fetching data from IndexedDB:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    void (async () => {
      try {
        const [w, b, t] = await Promise.all([
          getWallets(),
          getAllBalances(),
          getTransactions(),
        ]);
        if (!ignore) {
          setWallets(w);
          setBalances(b);
          setTransactions(t);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching data from IndexedDB:', err);
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  // Handlers for switching tabs with contextual wallet selection
  const handleNavigateToIssue = (walletId?: string) => {
    if (walletId) setPreselectedWalletId(walletId);
    setActiveTab('issue');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToRedeem = (walletId?: string) => {
    if (walletId) setPreselectedWalletId(walletId);
    setActiveTab('redeem');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToTransfer = (walletId?: string) => {
    if (walletId) setPreselectedWalletId(walletId);
    setActiveTab('transfer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWalletCreated = (newWallet: Wallet) => {
    refreshData();
    // Default preselect newly created wallet for immediate operations
    setPreselectedWalletId(newWallet.id);
  };

  const handleTransactionSuccess = () => {
    refreshData();
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#121316] flex flex-col selection:bg-stone-900 selection:text-white">
      {/* Simulator Sticky Header & Tabs */}
      <SimulatorNavbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateHome={onNavigateHome}
        onOpenCreateWallet={() => setCreateModalOpen(true)}
        walletCount={wallets.length}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-stone-500">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
            <p className="text-xs font-mono">Connecting to local IndexedDB...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewTab
                wallets={wallets}
                balances={balances}
                transactions={transactions}
                onOpenCreateWallet={() => setCreateModalOpen(true)}
                onNavigateToTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectWallet={(wallet) => setSelectedWalletForDetail(wallet)}
              />
            )}

            {activeTab === 'wallets' && (
              <WalletsTab
                wallets={wallets}
                balances={balances}
                onOpenCreateWallet={() => setCreateModalOpen(true)}
                onSelectWallet={(wallet) => setSelectedWalletForDetail(wallet)}
                onNavigateToIssue={handleNavigateToIssue}
                onNavigateToRedeem={handleNavigateToRedeem}
                onNavigateToTransfer={handleNavigateToTransfer}
              />
            )}

            {activeTab === 'issue' && (
              <IssueTab
                wallets={wallets}
                balances={balances}
                preselectedWalletId={preselectedWalletId}
                onOpenCreateWallet={() => setCreateModalOpen(true)}
                onTransactionSuccess={handleTransactionSuccess}
              />
            )}

            {activeTab === 'redeem' && (
              <RedeemTab
                wallets={wallets}
                balances={balances}
                preselectedWalletId={preselectedWalletId}
                onOpenCreateWallet={() => setCreateModalOpen(true)}
                onTransactionSuccess={handleTransactionSuccess}
              />
            )}

            {activeTab === 'transfer' && (
              <TransferTab
                wallets={wallets}
                balances={balances}
                preselectedSenderId={preselectedWalletId}
                onOpenCreateWallet={() => setCreateModalOpen(true)}
                onTransactionSuccess={handleTransactionSuccess}
              />
            )}

            {activeTab === 'activity' && (
              <ActivityTab
                transactions={transactions}
                wallets={wallets}
                onNavigateToIssue={() => handleNavigateToIssue()}
              />
            )}
          </>
        )}
      </main>

      {/* Create Wallet Modal */}
      <CreateWalletModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onWalletCreated={handleWalletCreated}
      />

      {/* Wallet Detail Modal */}
      <WalletDetailModal
        isOpen={!!selectedWalletForDetail}
        wallet={selectedWalletForDetail}
        balances={balances}
        transactions={transactions}
        onClose={() => setSelectedWalletForDetail(null)}
        onNavigateToIssue={handleNavigateToIssue}
        onNavigateToRedeem={handleNavigateToRedeem}
        onNavigateToTransfer={handleNavigateToTransfer}
      />
    </div>
  );
};
