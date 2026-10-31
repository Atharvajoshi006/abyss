import React from 'react';
import { ArrowUpRight, Sparkles, ShieldCheck, Database } from 'lucide-react';
import {
  CurrencyToken,
  PaperClip,
  StickyNote,
  RubberStamp,
  PaperReceipt,
} from '../components/FloatingElements';

interface FinalCTAProps {
  onLaunch: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onLaunch }) => {
  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 cutting-mat-grid text-white overflow-hidden">
      {/* Decorative Metric Ruler Marks on the cutting mat top/bottom edges */}
      <div className="absolute top-0 left-0 right-0 h-4 border-b border-white/10 flex justify-between px-2 text-[8px] font-mono text-emerald-400/40 select-none pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="flex flex-col items-center">
            <span className="h-2 w-px bg-white/20"></span>
            <span>{i * 5}cm</span>
          </span>
        ))}
      </div>

      {/* Floating Decorative Objects scattered across the Green Cutting Mat */}

      {/* Top Left: Post-It Note */}
      <div className="hidden lg:block absolute top-16 left-12 animate-float-subtle pointer-events-none z-10">
        <StickyNote
          title="CUTTING MAT NOTE"
          text="Zero API keys required. Pure open-source client simulation."
          author="timewallet.eng"
          rotation="rotate-[-6deg]"
        />
      </div>

      {/* Top Right: USD Currency Token + Verified Rubber Stamp */}
      <div className="hidden lg:flex flex-col items-center absolute top-16 right-16 animate-float-reverse pointer-events-none z-10">
        <CurrencyToken symbol="$" code="USD" color="#10b981" size="lg" className="rotate-[14deg]" />
        <div className="mt-3">
          <RubberStamp text="NO REAL MONEY" variant="amber" rotation="rotate-[4deg]" />
        </div>
      </div>

      {/* Bottom Left: EUR Token + Silver Paperclip */}
      <div className="hidden xl:block absolute bottom-16 left-20 animate-float-bob pointer-events-none z-10">
        <PaperClip className="rotate-[35deg] -mb-2 ml-4" />
        <CurrencyToken symbol="€" code="EUR" color="#3b82f6" size="md" className="rotate-[-12deg]" />
      </div>

      {/* Bottom Right: Miniature Receipt */}
      <div className="hidden xl:block absolute bottom-14 right-20 animate-float-subtle pointer-events-none z-10">
        <PaperReceipt
          id="TXN-FINAL"
          title="Session Status"
          amount="100,000"
          currency="Credits"
          status="IndexedDB Stored"
          rotation="rotate-[6deg]"
        />
      </div>

      {/* Central Prominent CTA Box */}
      <div className="relative z-20 max-w-3xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold tracking-wider uppercase shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>READY WHEN YOU ARE</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
          Ready to move your credits?
        </h2>

        <p className="max-w-xl mx-auto text-base sm:text-lg text-emerald-200/80 leading-relaxed font-normal">
          Explore a different way to manage fictional credits across currencies. Completely client-side,
          offline-first, and 100% risk-free.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onLaunch}
            className="w-full sm:w-auto px-10 py-4 rounded-full bg-white text-[#121316] hover:bg-stone-100 font-extrabold text-base shadow-2xl transition-all duration-200 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 group"
          >
            <Sparkles className="w-5 h-5 text-amber-500 group-hover:rotate-12 transition-transform" />
            <span>Launch TimeWallet</span>
            <ArrowUpRight className="w-4 h-4 text-stone-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-mono text-emerald-300/70">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" /> IndexedDB Local Cache
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Rule-Based Fraud Guard
          </span>
          <span>•</span>
          <span>Frankfurter API Rate Multipliers</span>
        </div>
      </div>
    </section>
  );
};
