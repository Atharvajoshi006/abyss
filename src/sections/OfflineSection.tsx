import React, { useState } from 'react';
import {
  WifiOff,
  Wifi,
  HardDrive,
  Database,
  Clock,
  FileText,
} from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { RubberStamp } from '../components/FloatingElements';

export const OfflineSection: React.FC = () => {
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);

  return (
    <section id="offline" className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#faf8f5]">
      <SectionHeading
        eyebrow="RESILIENT ARCHITECTURE"
        title="Your wallet doesn't disappear"
        italicWord="when the internet does."
        description="Your wallets, balances and transaction records stay in your browser. Continue managing credits offline and use cached exchange rates whenever connectivity is unavailable."
      />

      <div className="max-w-6xl mx-auto mt-16 space-y-12">
        {/* Interactive Connectivity Simulation Toggle Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-stone-100 rounded-2xl border border-stone-200/90 gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors ${
                isSimulatedOffline
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isSimulatedOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span>Simulated Network State:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isSimulatedOffline
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-emerald-200 text-emerald-900'
                  }`}
                >
                  {isSimulatedOffline ? 'OFFLINE MODE' : 'ONLINE MODE'}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-mono">
                {isSimulatedOffline
                  ? 'Transactions committed to local IndexedDB. Rates frozen to local cache.'
                  : 'Frankfurter API live sync enabled. Exchange updates streaming.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-xs font-semibold text-stone-800 shadow-xs transition-all active:scale-95"
          >
            Toggle {isSimulatedOffline ? 'Online State' : 'Airplane Mode'}
          </button>
        </div>

        {/* Visual Direction: Browser Window Devtools & IndexedDB Stores */}
        <div className="bg-white border border-stone-200/90 rounded-3xl paper-shadow-lg overflow-hidden">
          {/* Browser Chrome Header */}
          <div className="bg-stone-100 px-5 py-3 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span className="ml-3 font-mono text-xs text-stone-600 font-semibold">
                Developer Tools • IndexedDB Inspector [timewallet_db]
              </span>
            </div>

            <div className="flex items-center gap-2">
              <RubberStamp text="CLIENT ONLY" variant="green" rotation="rotate-0" />
            </div>
          </div>

          {/* Devtools Storage Viewer */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            {/* Store 1: Wallets */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between text-stone-500 pb-2 border-b border-stone-200">
                <span className="font-bold flex items-center gap-1.5 text-stone-800">
                  <Database className="w-4 h-4 text-stone-600" />
                  objectStore: `wallets`
                </span>
                <span className="text-[10px] bg-stone-200 px-1.5 py-0.5 rounded text-stone-700">
                  2 records
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] text-stone-700">
                <div className="p-2 bg-white rounded border border-stone-200">
                  <span className="text-stone-400">key:</span> "alice.time"
                  <div className="text-stone-500 text-[10px]">balance: 10,000 USD | sync: true</div>
                </div>
                <div className="p-2 bg-white rounded border border-stone-200">
                  <span className="text-stone-400">key:</span> "bob.vault"
                  <div className="text-stone-500 text-[10px]">balance: 500,700 INR | sync: true</div>
                </div>
              </div>
            </div>

            {/* Store 2: Transactions */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between text-stone-500 pb-2 border-b border-stone-200">
                <span className="font-bold flex items-center gap-1.5 text-stone-800">
                  <FileText className="w-4 h-4 text-stone-600" />
                  objectStore: `ledger`
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  PERSISTENT
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] text-stone-700">
                <div className="p-2 bg-white rounded border border-stone-200">
                  <span className="text-stone-400">TXN-9842:</span> 6,000 USD → INR
                  <div className="text-rose-600 text-[10px] font-bold">FLAGGED [RULE_01]</div>
                </div>
                <div className="p-2 bg-white rounded border border-stone-200">
                  <span className="text-stone-400">TXN-9841:</span> 1,450 EUR → GBP
                  <div className="text-emerald-600 text-[10px]">COMPLETED (IndexedDB)</div>
                </div>
              </div>
            </div>

            {/* Store 3: Rates Cache */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between text-stone-500 pb-2 border-b border-stone-200">
                <span className="font-bold flex items-center gap-1.5 text-stone-800">
                  <Clock className="w-4 h-4 text-stone-600" />
                  objectStore: `rates_cache`
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                  CACHED
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] text-stone-700">
                <div className="p-2 bg-white rounded border border-stone-200">
                  <div className="flex justify-between">
                    <span>EUR/USD: 1.087</span>
                    <span className="text-stone-400 text-[10px]">Frankfurter</span>
                  </div>
                  <div className="text-[10px] text-stone-400">Cached: Today 10:00 UTC</div>
                </div>
                <div className="p-2 bg-white rounded border border-stone-200">
                  <div className="flex justify-between">
                    <span>USD/INR: 83.45</span>
                    <span className="text-stone-400 text-[10px]">Frankfurter</span>
                  </div>
                  <div className="text-[10px] text-stone-400">Cached: Today 10:00 UTC</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-stone-100/70 p-4 border-t border-stone-200 text-center text-xs font-mono text-stone-500">
            * Note: New live exchange-rate refreshes require internet connectivity. When offline,
            computations safely fall back to the most recent cached snapshot.
          </div>
        </div>

        {/* 3 Concise Highlights required by prompt */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-stone-200 paper-shadow space-y-2">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-900 font-bold mb-3">
              <HardDrive className="w-5 h-5 text-stone-800" />
            </div>
            <h4 className="font-bold text-stone-900 text-lg">Local-First Storage</h4>
            <p className="text-stone-600 text-sm leading-relaxed">
              All records exist directly in your browser's IndexedDB. Closing your tab or clearing
              external caches won't delete your offline ledger.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-stone-200 paper-shadow space-y-2">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-900 font-bold mb-3">
              <WifiOff className="w-5 h-5 text-stone-800" />
            </div>
            <h4 className="font-bold text-stone-900 text-lg">Offline Transactions</h4>
            <p className="text-stone-600 text-sm leading-relaxed">
              Issue credits and queue transfers between accounts on trains, airplanes, or low-signal
              locations without server disconnection errors.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-stone-200 paper-shadow space-y-2">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-900 font-bold mb-3">
              <Clock className="w-5 h-5 text-stone-800" />
            </div>
            <h4 className="font-bold text-stone-900 text-lg">Cached Exchange Rates</h4>
            <p className="text-stone-600 text-sm leading-relaxed">
              Conversion calculations seamlessly reference the latest cached snapshot when offline.
              Explicitly tagged as cached for full transparency.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
