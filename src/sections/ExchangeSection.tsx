import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { CURRENCIES } from '../data/mockData';
import type { CurrencyCode } from '../types';

export const ExchangeSection: React.FC = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const currencyList = Object.values(CURRENCIES);

  const baseRate = CURRENCIES[selectedCurrency].rateToUSD;

  return (
    <section id="exchange" className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#faf8f5]">
      {/* Background World Map Vector Motif */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <svg width="900" height="450" viewBox="0 0 1000 500" fill="currentColor" className="text-stone-900">
          <circle cx="200" cy="180" r="140" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="600" cy="220" r="180" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
          <path d="M 200 180 Q 400 100 600 220" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 600 220 Q 750 350 850 200" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      </div>

      <SectionHeading
        eyebrow="GLOBAL EXCHANGE MATRIX"
        title="Different currencies."
        italicWord="One connected experience."
        description="Explore how fictional credits translate across currencies using real-world exchange-rate data powered by the Frankfurter API."
      />

      <div className="max-w-6xl mx-auto mt-16 space-y-12 relative">
        {/* API Attribution Banner */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 paper-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 text-sm">
                  Frankfurter Currency API Integration
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                  PUBLIC API
                </span>
              </div>
              <p className="text-xs text-stone-500 font-mono mt-0.5">
                Reference exchange rates tracked against official European Central Bank reference feeds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-stone-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live or Cached Offline</span>
          </div>
        </div>

        {/* Currency Node Selector Bar */}
        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-4 overflow-x-auto pb-4 pt-2">
          {currencyList.map((curr) => {
            const isSelected = selectedCurrency === curr.code;
            return (
              <button
                key={curr.code}
                onClick={() => setSelectedCurrency(curr.code)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all duration-200 shrink-0 select-none ${
                  isSelected
                    ? 'bg-[#121316] text-white border-stone-900 shadow-md scale-105'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200 paper-shadow'
                }`}
              >
                <span className="text-lg">{curr.flag}</span>
                <div className="text-left font-mono">
                  <div className="font-bold text-xs">{curr.code}</div>
                  <div className={`text-[10px] ${isSelected ? 'text-amber-300' : 'text-stone-400'}`}>
                    {curr.symbol}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Rate Conversion Cards Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currencyList
            .filter((c) => c.code !== selectedCurrency)
            .map((target) => {
              const pairRate = target.rateToUSD / baseRate;
              const sampleConvertedCredits = Math.round(1000 * pairRate);

              return (
                <div
                  key={target.code}
                  className="bg-white border border-stone-200/90 rounded-2xl p-5 paper-shadow hover:paper-shadow-lift transition-all duration-200 relative group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{target.flag}</span>
                        <span className="font-bold text-stone-900 font-mono text-sm">
                          {target.code}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                        {target.symbol}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">
                        Exchange Formula
                      </div>
                      <div className="text-base font-extrabold text-stone-900 font-mono mt-0.5">
                        1 {selectedCurrency} = {pairRate.toFixed(4)} {target.code}
                      </div>
                    </div>

                    <div className="mt-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                      <div className="text-[10px] font-mono text-stone-500">
                        Example Credit Value:
                      </div>
                      <div className="text-sm font-bold font-mono text-emerald-700">
                        1,000 {selectedCurrency} ≈ {sampleConvertedCredits.toLocaleString()} {target.code}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-dashed border-stone-100 flex items-center justify-between text-[10px] font-mono text-stone-400">
                    <span>Source: Frankfurter</span>
                    <span className="text-stone-600 font-semibold">{target.name}</span>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Disclaimer Note */}
        <div className="text-center text-xs font-mono text-stone-500 max-w-2xl mx-auto pt-2">
          Notice: Exchange rates serve as mathematical conversion multipliers for fictional credits.
          TimeWallet holds zero real foreign exchange currency or bank reserves.
        </div>
      </div>
    </section>
  );
};
