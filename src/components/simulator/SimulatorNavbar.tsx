import React from 'react';
import {
  ArrowLeft,
  LayoutDashboard,
  Users,
  Coins,
  ArrowLeftRight,
  History,
  PlusCircle,
  Database,
  ShieldAlert,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useConnectivity } from '../../utils/connectivity';

export type SimulatorTab =
  | 'overview'
  | 'wallets'
  | 'operations'
  | 'transfer'
  | 'activity'
  | 'fraud';

interface SimulatorNavbarProps {
  activeTab: SimulatorTab;
  onTabChange: (tab: SimulatorTab) => void;
  onNavigateHome: () => void;
  onOpenCreateWallet: () => void;
  walletCount: number;
  alertCount?: number;
}

export const SimulatorNavbar: React.FC<SimulatorNavbarProps> = ({
  activeTab,
  onTabChange,
  onNavigateHome,
  onOpenCreateWallet,
  walletCount,
  alertCount = 0,
}) => {
  const connectivity = useConnectivity();

  const tabs: { id: SimulatorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview & Analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'wallets', label: `My Wallets (${walletCount})`, icon: <Users className="w-4 h-4" /> },
    { id: 'operations', label: 'Credit Operations', icon: <Coins className="w-4 h-4" /> },
    { id: 'transfer', label: 'Transfers & Exchange', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity & Export', icon: <History className="w-4 h-4" /> },
    {
      id: 'fraud',
      label: alertCount > 0 ? `Fraud Monitoring (${alertCount})` : 'Fraud Monitoring',
      icon: <ShieldAlert className={`w-4 h-4 ${alertCount > 0 ? 'text-amber-400' : ''}`} />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top brand line */}
        <div className="flex items-center justify-between py-3 border-b border-stone-200/60">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200 shadow-2xs transition-colors"
              title="Return to Marketing Landing Page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Landing Page</span>
            </button>

            <div className="h-4 w-px bg-stone-300 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#121316] text-[#faf8f5] flex items-center justify-center font-mono font-bold text-xs">
                <span className="text-amber-400">T</span>W
              </div>
              <span className="font-extrabold text-sm tracking-tight text-[#121316] flex items-center gap-1.5">
                TIMEWALLET
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-stone-900 text-amber-400 uppercase tracking-wider">
                  SIMULATOR
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Connectivity Status Indicator */}
            <div
              className={`flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full border shadow-2xs ${connectivity.colorClass}`}
              title={`Network & Cache: ${connectivity.label}`}
            >
              {connectivity.isOnline ? (
                <Wifi className="w-3 h-3 text-emerald-600" />
              ) : (
                <WifiOff className="w-3 h-3 text-rose-600" />
              )}
              <span className="font-semibold">{connectivity.label}</span>
            </div>

            {/* IndexedDB status badge */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
              <Database className="w-3 h-3 text-stone-600" />
              <span>IndexedDB Active</span>
            </div>

            <button
              onClick={onOpenCreateWallet}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#121316] hover:bg-stone-800 text-[#faf8f5] text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>New Wallet</span>
            </button>
          </div>
        </div>

        {/* Tab navigation row */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#121316] text-[#faf8f5] shadow-2xs'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
