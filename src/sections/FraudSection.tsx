import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  Sliders,
  CheckCircle2,
  BellRing,
} from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { RubberStamp } from '../components/FloatingElements';

export const FraudSection: React.FC = () => {
  // Interactive test bench state
  const [testAmount, setTestAmount] = useState<number>(6000);
  const [velocityCount, setVelocityCount] = useState<number>(4);

  const isThresholdFlagged = testAmount > 5000;
  const isVelocityFlagged = velocityCount > 3;

  return (
    <section id="fraud" className="py-28 px-4 sm:px-6 lg:px-8 relative bg-[#09111e] text-white overflow-hidden">
      {/* Dark Ambient Gradients and Lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 dot-pattern-dark opacity-30 pointer-events-none" />

      {/* Heading with Navy Theme */}
      <SectionHeading
        theme="navy"
        eyebrow="RULE-BASED AUDIT ENGINE"
        title="Every transaction tells a story."
        italicWord="Watch for the unusual."
        description="Our deterministic, client-side monitoring engine flags unusually large transfers and suspicious transaction frequency before balances ever settle."
      />

      <div className="max-w-6xl mx-auto mt-20 space-y-16 relative z-10">
        {/* Core Showcase: The Alice -> Bob High-Value Flag Example */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#101b2f] border border-blue-900/40 rounded-3xl p-6 sm:p-10 navy-card-shadow relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Left: The Visual Storytelling Diagram */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/50">
              <span className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                TRANSACTION AUDIT TRACE #TX-6000
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold animate-pulse">
                ACTION REQUIRED
              </span>
            </div>

            {/* Connected Node Visualizer */}
            <div className="relative p-6 rounded-2xl bg-[#09111e]/90 border border-blue-900/60 font-mono">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative">
                {/* Alice Node */}
                <div className="flex items-center gap-3 bg-[#13223d] p-3.5 rounded-xl border border-blue-800/60 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                    A
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">alice.time</div>
                    <div className="text-[10px] text-blue-300/70">Origin Account</div>
                  </div>
                </div>

                {/* Arrow / Transfer Beam */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider bg-rose-950/70 px-2 py-0.5 rounded border border-rose-800/80 mb-1">
                    6,000 USD Credits
                  </span>
                  <div className="flex items-center gap-1 text-rose-400">
                    <span className="w-8 sm:w-16 h-0.5 bg-rose-500/80 dashed"></span>
                    <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                    <span className="w-8 sm:w-16 h-0.5 bg-rose-500/80 dashed"></span>
                  </div>
                  <span className="text-[9px] text-stone-400 mt-1">Evaluated by Engine</span>
                </div>

                {/* Bob Node */}
                <div className="flex items-center gap-3 bg-[#13223d] p-3.5 rounded-xl border border-blue-800/60 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                    B
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">bob.vault</div>
                    <div className="text-[10px] text-emerald-300/70">Target Recipient</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Label Card */}
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/40 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-rose-200 tracking-wide uppercase font-mono">
                  ALERT: Large Transaction Detected
                </div>
                <p className="text-xs text-rose-300/90 leading-relaxed">
                  Rule Triggered:{' '}
                  <strong className="text-white">Transfer exceeds the 5,000-unit threshold.</strong>{' '}
                  The transaction was executed for 6,000 USD credits. Marked for compliance inspection
                  in IndexedDB audit logs.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Dual Core Predefined Rules Breakdown */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Predefined Rule Specifications</span>
            </h4>

            {/* Rule 1 Card */}
            <div className="p-4 rounded-xl bg-[#0b1526] border border-blue-900/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-rose-400">RULE 01 • THRESHOLD CHECK</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">
                  &gt; 5,000 Units
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Flags any transfer where the converted volume exceeds 5,000 USD credits. Prevents
                unmonitored liquidation of fictional credit accounts.
              </p>
            </div>

            {/* Rule 2 Card */}
            <div className="p-4 rounded-xl bg-[#0b1526] border border-blue-900/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-amber-400">RULE 02 • VELOCITY CHECK</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                  &gt; 3 Tx / 24h
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Flags wallets issuing more than three transfers within any 24-hour window, mitigating
                automated bot-draining or rapid looping behavior.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/40 text-[11px] font-mono text-blue-300/80">
              💡 Zero Black-Box ML: Every rule is deterministic, transparent, and auditable client-side.
            </div>
          </div>
        </div>

        {/* Live Interactive Rule Testing Sandbox */}
        <div className="bg-[#0b1526] border border-blue-900/40 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-amber-400" />
                <span>Test the Rule Engine in Real-Time</span>
              </h4>
              <p className="text-xs text-stone-400 font-mono mt-0.5">
                Adjust values to trigger or clear deterministic fraud rules
              </p>
            </div>
            <div className="flex gap-2">
              <RubberStamp text="DETERMINISTIC" variant="blue" rotation="rotate-0" />
              <RubberStamp text="CLIENT-SIDE" variant="green" rotation="rotate-0" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Control 1: Amount Slider */}
            <div className="p-4 rounded-xl bg-[#0e1a30] border border-blue-900/60 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-stone-300">Transfer Amount:</span>
                <span className="text-base font-bold text-white">{testAmount.toLocaleString()} USD</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="250"
                value={testAmount}
                onChange={(e) => setTestAmount(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-stone-500">Threshold: 5,000 USD</span>
                {isThresholdFlagged ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> FLAGGED: Exceeds 5,000
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> PASS: Normal Transfer
                  </span>
                )}
              </div>
            </div>

            {/* Control 2: Velocity Counter */}
            <div className="p-4 rounded-xl bg-[#0e1a30] border border-blue-900/60 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-stone-300">Transfers in 24 Hours:</span>
                <span className="text-base font-bold text-white">{velocityCount} Transfers</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => setVelocityCount(cnt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      velocityCount === cnt
                        ? 'bg-amber-400 text-stone-950 shadow-sm'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-stone-500">Threshold: 3 Transfers / 24h</span>
                {isVelocityFlagged ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> FLAGGED: Rapid Velocity
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PASS: Under Velocity Limit
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
