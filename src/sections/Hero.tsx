import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Database, Layers, ArrowUpRight } from 'lucide-react';
import {
  CurrencyToken,
  PaperClip,
  StickyNote,
  RubberStamp,
  PaperReceipt,
} from '../components/FloatingElements';

interface HeroProps {
  onExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  return (
    <section className="relative min-h-[92vh] pt-32 pb-20 overflow-hidden flex flex-col justify-center items-center">
      {/* Background Subtle Dot Pattern */}
      <div className="absolute inset-0 dot-pattern-light opacity-60 pointer-events-none" />

      {/* Floating Stationery / Desk Objects around Hero (Inspired by Acctual reference) */}

      {/* Top Left: Silver Paperclip + Sticky Note */}
      <div className="hidden lg:block absolute top-28 left-8 xl:left-20 animate-float-subtle pointer-events-none z-10">
        <PaperClip className="rotate-[25deg] -mb-4 ml-6" />
        <StickyNote
          title="NOTE #01"
          text="Zero servers. Everything runs in-browser IndexedDB."
          author="timewallet.core"
          rotation="rotate-[-4deg]"
        />
      </div>

      {/* Top Right: USD Currency Token + Verified Rubber Stamp */}
      <div className="hidden lg:flex flex-col items-center absolute top-28 right-10 xl:right-24 animate-float-reverse pointer-events-none z-10">
        <CurrencyToken symbol="$" code="USD" color="#10b981" size="lg" className="rotate-[12deg]" />
        <div className="mt-3">
          <RubberStamp text="CLIENT-SIDE ONLY" variant="green" rotation="rotate-[-6deg]" />
        </div>
      </div>

      {/* Mid Left: Floating EUR Token */}
      <div className="hidden xl:block absolute top-[52%] left-6 animate-float-bob pointer-events-none z-10">
        <CurrencyToken symbol="€" code="EUR" color="#3b82f6" size="md" className="rotate-[-10deg]" />
      </div>

      {/* Mid Right: Floating INR Token + Paper Receipt */}
      <div className="hidden xl:block absolute top-[48%] right-8 animate-float-subtle pointer-events-none z-10">
        <PaperReceipt
          id="TXN-9021"
          title="Converted Credit"
          amount="83,450"
          currency="INR"
          status="IndexedDB Confirmed"
          rotation="rotate-[5deg]"
        />
      </div>

      {/* Bottom Left: GBP Token */}
      <div className="hidden lg:block absolute bottom-12 left-16 animate-float-reverse pointer-events-none z-10">
        <CurrencyToken symbol="£" code="GBP" color="#8b5cf6" size="sm" className="rotate-[8deg]" />
      </div>

      {/* Bottom Right: Sticky Note with Fraud rule reminder */}
      <div className="hidden lg:block absolute bottom-14 right-20 animate-float-bob pointer-events-none z-10">
        <StickyNote
          title="RULE ENGINE"
          text="Rule: Auto-flag transactions exceeding 5,000 credit limit."
          author="audit_daemon"
          rotation="rotate-[6deg]"
        />
      </div>

      {/* Central Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-200/70 border border-stone-300 text-stone-800 text-xs font-mono font-semibold tracking-wider uppercase mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>CLIENT-SIDE MULTI-CURRENCY WALLET</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#121316] leading-[1.08] mb-6">
          Your credits.{' '}
          <span className="font-serif italic font-normal text-stone-500 underline decoration-stone-300 decoration-wavy underline-offset-8">
            Your currencies.
          </span>{' '}
          Your control.
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[#5a5f6e] leading-relaxed mb-10 font-normal">
          Create fictional time-credits, move them across currencies and keep every transaction in
          check. No banks. No backend. Just your wallet.
        </p>

        {/* Primary and Secondary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <button
            onClick={onExplore}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#121316] hover:bg-stone-800 text-[#faf8f5] font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 active:scale-98 group"
          >
            <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span>Explore the Simulator</span>
            <ArrowRight className="w-4 h-4 text-stone-300 group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/90 hover:bg-white text-stone-800 font-semibold text-base border border-stone-300 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>See How It Works</span>
            <ArrowUpRight className="w-4 h-4 text-stone-500" />
          </a>
        </div>

        {/* Hero Interactive Preview Card: Overlapping Mini Wallet Cards */}
        <div className="relative max-w-xl mx-auto mt-4 pt-2">
          {/* Background tilted card */}
          <div className="absolute inset-x-4 -top-3 h-32 bg-stone-200/70 border border-stone-300 rounded-2xl transform -rotate-2 paper-shadow pointer-events-none" />

          {/* Foreground main card */}
          <div className="relative bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 paper-shadow-lg text-left">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="ml-2 text-xs font-mono font-bold text-stone-600">
                  sandbox.timewallet.local
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Database className="w-3 h-3" />
                <span>IndexedDB Connected</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                <div className="text-[10px] font-mono uppercase text-stone-500">Sender Account</div>
                <div className="font-bold text-stone-900 mt-0.5">alice.time</div>
                <div className="text-sm font-mono text-stone-600 mt-1">
                  Balance: <strong className="text-stone-950">10,000 USD</strong>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
                <div className="text-[10px] font-mono uppercase text-emerald-700">
                  Fictional Rate Reference
                </div>
                <div className="font-bold text-stone-900 mt-0.5">Frankfurter API Rate</div>
                <div className="text-sm font-mono text-emerald-900 mt-1">
                  1 USD = <strong className="text-emerald-950">83.45 INR</strong>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-dashed border-stone-200 flex flex-wrap items-center justify-between text-xs text-stone-500 font-mono gap-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-600" /> Predefined Rule Engine
              </span>
              <span className="text-stone-400">•</span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-stone-600" /> Multi-Currency Matrix
              </span>
              <span className="text-stone-400">•</span>
              <span className="text-stone-700 font-semibold">100% Offline Capable</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
