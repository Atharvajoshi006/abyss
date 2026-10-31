import React from 'react';
import {
  Wallet,
  Coins,
  ArrowRightLeft,
  RefreshCw,
  ShieldAlert,
  FileSpreadsheet,
  WifiOff,
  CheckCircle2,
} from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#f7f5f0]">
      <SectionHeading
        eyebrow="PRODUCT ARCHITECTURE"
        title="Everything your wallet needs."
        italicWord="Nothing it doesn't."
        description="Engineered strictly for client-side multi-currency time-credit simulation. No complex backend bloat, no invasive tracking, and no financial risk."
      />

      <div className="max-w-6xl mx-auto mt-20">
        {/* Editorial Bento Showcase with varied hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Capability 1: Wallet Management (Span 7) */}
          <div className="md:col-span-7 bg-white p-7 sm:p-8 rounded-3xl border border-stone-200/90 paper-shadow hover:paper-shadow-lift transition-all relative overflow-hidden group">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold">
                <Wallet className="w-5 h-5 text-amber-300" />
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-bold uppercase">
                CAPABILITY #01
              </span>
            </div>

            <h4 className="text-2xl font-extrabold text-stone-900 mt-4 tracking-tight">
              Client-Side Wallet Management
            </h4>
            <p className="text-stone-600 text-sm mt-2 leading-relaxed max-w-lg">
              Generate self-contained wallet profiles with custom human-readable usernames. Private
              cryptographic handles reside entirely within your browser storage without ever touching a
              remote database.
            </p>

            {/* Mini Visual Preview */}
            <div className="mt-6 p-4 rounded-xl bg-stone-50 border border-stone-200/80 font-mono text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-[10px]">
                  TW
                </div>
                <span className="font-bold text-stone-900">alice.time</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% Local-First
              </span>
            </div>
          </div>

          {/* Capability 2: Credit Issuance (Span 5) */}
          <div className="md:col-span-5 bg-white p-7 sm:p-8 rounded-3xl border border-stone-200/90 paper-shadow hover:paper-shadow-lift transition-all relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Coins className="w-5 h-5 text-amber-700" />
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold uppercase">
                CAPABILITY #02
              </span>
            </div>

            <h4 className="text-2xl font-extrabold text-stone-900 mt-4 tracking-tight">
              Fictional Credit Issuance
            </h4>
            <p className="text-stone-600 text-sm mt-2 leading-relaxed">
              Mint simulated time-credits on demand with a frictionless one-click faucet. Ideal for
              prototyping, economic modeling, and testing exchange mechanisms.
            </p>

            <div className="mt-6 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs font-mono text-amber-900 flex justify-between items-center">
              <span>Faucet Protocol:</span>
              <span className="font-bold">+5,000 Credits / Tap</span>
            </div>
          </div>

          {/* Capability 3: Multi-Currency Transfers (Span 4) */}
          <div className="md:col-span-4 bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/90 paper-shadow hover:paper-shadow-lift transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <ArrowRightLeft className="w-5 h-5 text-blue-700" />
            </div>
            <h4 className="text-xl font-bold text-stone-900">Multi-Currency Transfers</h4>
            <p className="text-stone-600 text-xs leading-relaxed">
              Send credits denominated in USD, EUR, INR, GBP, and more with instant automatic currency
              parity calculations.
            </p>
            <div className="text-[11px] font-mono text-blue-800 bg-blue-50 p-2 rounded-lg border border-blue-200">
              USD • EUR • INR • GBP • JPY
            </div>
          </div>

          {/* Capability 4: Exchange Rate Conversion (Span 4) */}
          <div className="md:col-span-4 bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/90 paper-shadow hover:paper-shadow-lift transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <RefreshCw className="w-5 h-5 text-emerald-700" />
            </div>
            <h4 className="text-xl font-bold text-stone-900">Exchange Rate Conversion</h4>
            <p className="text-stone-600 text-xs leading-relaxed">
              Powered by real-world market reference feeds from the public Frankfurter Currency API.
              Transparent mathematical conversions.
            </p>
            <div className="text-[11px] font-mono text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
              Source: Frankfurter / ECB
            </div>
          </div>

          {/* Capability 5: Fraud Monitoring (Span 4) */}
          <div className="md:col-span-4 bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/90 paper-shadow hover:paper-shadow-lift transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5 text-rose-700" />
            </div>
            <h4 className="text-xl font-bold text-stone-900">Rule-Based Fraud Guard</h4>
            <p className="text-stone-600 text-xs leading-relaxed">
              Flags transfers exceeding 5,000 units and velocity anomalies greater than 3 transfers
              within a rolling 24-hour period.
            </p>
            <div className="text-[11px] font-mono text-rose-800 bg-rose-50 p-2 rounded-lg border border-rose-200">
              Deterministic Rule Execution
            </div>
          </div>

          {/* Capability 6: Transaction History & CSV Export (Span 6) */}
          <div className="md:col-span-6 bg-white p-7 sm:p-8 rounded-3xl border border-stone-200/90 paper-shadow hover:paper-shadow-lift transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5 text-purple-700" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-bold">
                  RFC 4180
                </span>
              </div>
              <h4 className="text-xl font-extrabold text-stone-900 mt-4 tracking-tight">
                Audited Ledger & CSV Export
              </h4>
              <p className="text-stone-600 text-xs mt-2 leading-relaxed">
                Full chronological record of all credit movements, exchange multipliers, timestamps, and
                fraud flag classifications. Download standard CSV files with a single click.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-dashed border-stone-200 text-xs font-mono text-stone-500 flex items-center justify-between">
              <span>Standard Spreadsheet Ready</span>
              <span className="text-stone-900 font-bold">1-Click Local Download</span>
            </div>
          </div>

          {/* Capability 7: Offline Access & Zero Cloud Reliance (Span 6) */}
          <div className="md:col-span-6 bg-white p-7 sm:p-8 rounded-3xl border border-stone-200/90 paper-shadow hover:paper-shadow-lift transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <WifiOff className="w-5 h-5 text-teal-700" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold">
                  INDEXEDDB POWERED
                </span>
              </div>
              <h4 className="text-xl font-extrabold text-stone-900 mt-4 tracking-tight">
                True Offline Resilience
              </h4>
              <p className="text-stone-600 text-xs mt-2 leading-relaxed">
                Zero network requests required after initial page load. Your entire database lives in
                browser IndexedDB, operating continuously even during total network outages.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-dashed border-stone-200 text-xs font-mono text-stone-500 flex items-center justify-between">
              <span>No Cloud Accounts Required</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Client-Side
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
