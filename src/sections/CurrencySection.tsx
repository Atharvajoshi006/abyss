import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, Info } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { StickyNote, RubberStamp } from '../components/FloatingElements';
import type { CurrencyCode } from '../types';
import { CURRENCIES } from '../data/mockData';

export const CurrencySection: React.FC = () => {
  const [sourceAmount, setSourceAmount] = useState<number>(10000);
  const [fromCurr, setFromCurr] = useState<CurrencyCode>('USD');
  const [toCurr, setToCurr] = useState<CurrencyCode>('INR');

  const fromRate = CURRENCIES[fromCurr].rateToUSD;
  const toRate = CURRENCIES[toCurr].rateToUSD;
  const rate = toRate / fromRate;
  const convertedCredits = Math.round(sourceAmount * rate);

  return (
    <section id="currencies" className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#faf8f5]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Heading */}
      <SectionHeading
        eyebrow="MULTI-CURRENCY LEDGER"
        title="One wallet. Multiple currencies."
        italicWord="Endless possibilities."
        description="Manage fictional credits across different currencies and understand their equivalent value using up-to-date exchange rates."
      />

      {/* Main Interactive Visual Composition */}
      <div className="max-w-6xl mx-auto mt-16 relative">
        {/* Floating Decorative Elements around Section */}
        <div className="hidden lg:block absolute -top-8 -left-6 z-20 pointer-events-none">
          <StickyNote
            title="RATE REFERENCE"
            text="Illustrative values referenced against Frankfurter Currency API."
            author="exchange_engine"
            rotation="rotate-[-6deg]"
          />
        </div>

        <div className="hidden lg:block absolute -bottom-6 -right-4 z-20 pointer-events-none">
          <RubberStamp text="CROSS-CURRENCY RESOLVED" variant="blue" rotation="rotate-[8deg]" />
        </div>

        {/* Currency Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Card 1: FROM (Alice - USD Wallet) */}
          <div className="lg:col-span-5 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-stone-200 to-amber-100 rounded-3xl blur-xs opacity-70 group-hover:opacity-100 transition duration-300" />
            <div className="relative bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 paper-shadow-lg transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <span className="text-[11px] font-mono uppercase font-bold text-stone-500 tracking-wider">
                  ORIGIN WALLET • [FROM]
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200">
                  Active Origin
                </span>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#121316] text-white flex items-center justify-center font-bold font-mono text-xl shadow-md">
                  A
                </div>
                <div>
                  <div className="text-xl font-extrabold text-stone-900">Alice Vance</div>
                  <div className="text-xs font-mono text-stone-500">@alice.time</div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="flex justify-between items-center text-xs text-stone-500 font-mono mb-1">
                  <span>CURRENCY & CREDITS</span>
                  <select
                    value={fromCurr}
                    onChange={(e) => setFromCurr(e.target.value as CurrencyCode)}
                    className="bg-white border border-stone-300 rounded px-2 py-0.5 font-bold text-stone-900 text-xs"
                  >
                    {Object.keys(CURRENCIES).map((c) => (
                      <option key={c} value={c}>
                        {c} ({CURRENCIES[c as CurrencyCode].symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-2">
                  <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">
                    Send Credits
                  </label>
                  <input
                    type="number"
                    value={sourceAmount}
                    onChange={(e) => setSourceAmount(Math.max(1, Number(e.target.value)))}
                    className="w-full text-2xl sm:text-3xl font-extrabold text-stone-900 bg-transparent border-b border-stone-300 focus:outline-hidden focus:border-stone-900 font-mono"
                  />
                  <div className="mt-1 text-[11px] font-mono text-stone-500">
                    {CURRENCIES[fromCurr].name} Wallet
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between text-xs font-mono text-stone-500 pt-2 border-t border-dashed border-stone-200">
                <span>Account ID: TW-ACC-4029</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Balance Sufficient
                </span>
              </div>
            </div>
          </div>

          {/* Center: Floating Exchange Panel & Connecting Animated Path */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center my-4 lg:my-0 relative z-30">
            {/* SVG Connecting Path */}
            <div className="hidden lg:block absolute w-full -top-12 -bottom-12 pointer-events-none">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d="M -40 50 C 20 20, 80 80, 140 50"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="2.5"
                  className="animate-dash"
                />
              </svg>
            </div>

            {/* Exchange Panel Bubble */}
            <div className="relative bg-[#121316] text-[#faf8f5] p-5 rounded-2xl shadow-xl border border-stone-800 text-center w-full max-w-[260px] transform hover:scale-105 transition-transform duration-200">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-stone-800 text-amber-300 font-mono text-[9px] uppercase tracking-wider mb-2 border border-stone-700">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Exchange Panel</span>
              </div>

              <div className="text-xs font-mono text-stone-400">Illustrative Conversion Rate</div>
              <div className="text-base font-extrabold text-white mt-1 font-mono">
                1 {fromCurr} = {rate.toFixed(4)} {toCurr}
              </div>

              <div className="mt-3 pt-3 border-t border-stone-800 text-[10px] text-stone-400 font-mono flex items-center justify-center gap-1">
                <Info className="w-3 h-3 text-amber-400" />
                <span>Frankfurter Reference</span>
              </div>
            </div>
          </div>

          {/* Card 2: TO (Bob - Converted Wallet) */}
          <div className="lg:col-span-5 relative group">
            <div className="absolute -inset-1 bg-gradient-to-l from-emerald-100 to-stone-200 rounded-3xl blur-xs opacity-70 group-hover:opacity-100 transition duration-300" />
            <div className="relative bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 paper-shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <span className="text-[11px] font-mono uppercase font-bold text-stone-500 tracking-wider">
                  DESTINATION WALLET • [TO]
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono font-bold border border-blue-200">
                  Target Recipient
                </span>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-950 text-emerald-300 flex items-center justify-center font-bold font-mono text-xl shadow-md">
                  B
                </div>
                <div>
                  <div className="text-xl font-extrabold text-stone-900">Bob Thorne</div>
                  <div className="text-xs font-mono text-stone-500">@bob.vault</div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="flex justify-between items-center text-xs text-stone-500 font-mono mb-1">
                  <span>RECEIVING CURRENCY</span>
                  <select
                    value={toCurr}
                    onChange={(e) => setToCurr(e.target.value as CurrencyCode)}
                    className="bg-white border border-stone-300 rounded px-2 py-0.5 font-bold text-stone-900 text-xs"
                  >
                    {Object.keys(CURRENCIES).map((c) => (
                      <option key={c} value={c}>
                        {c} ({CURRENCIES[c as CurrencyCode].symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-2">
                  <div className="text-[10px] font-mono uppercase text-stone-400">
                    Converted Credit Amount
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
                    ≈ {convertedCredits.toLocaleString()} {toCurr}
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-stone-500">
                    {CURRENCIES[toCurr].name} Wallet
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between text-xs font-mono text-stone-500 pt-2 border-t border-dashed border-stone-200">
                <span>Account ID: TW-ACC-9811</span>
                <span className="text-stone-700 font-semibold">Zero Gas • Pure Simulator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Note below cards */}
        <div className="mt-8 text-center text-xs font-mono text-stone-500 max-w-xl mx-auto">
          Exchange rates are referenced from the public Frankfurter Currency API for realistic simulation
          benchmarking. All time-credits remain strictly fictional.
        </div>
      </div>
    </section>
  );
};
