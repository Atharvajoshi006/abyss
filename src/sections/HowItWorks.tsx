import React, { useState } from 'react';
import {
  Activity,
  Coins,
  FileSpreadsheet,
  Check,
  Copy,
} from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { RubberStamp } from '../components/FloatingElements';

export const HowItWorks: React.FC = () => {
  const [testUsername, setTestUsername] = useState('chrono.pilot');
  const [issuedCredits, setIssuedCredits] = useState(2500);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyUsername = async () => {
    const textToCopy = testUsername.startsWith('@') ? testUsername : `@${testUsername}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <section id="how-it-works" className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#f7f5f0]">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 dot-pattern-light opacity-50 pointer-events-none" />

      <SectionHeading
        eyebrow="SIMPLE 3-STEP ARCHITECTURE"
        title="From creating credits to"
        italicWord="moving them around."
        description="A completely autonomous client-side system. No registration friction, zero third-party dependencies, and zero real money risk."
      />

      <div className="max-w-6xl mx-auto mt-20 space-y-16">
        {/* STEP 01 — Unique Identity Passport */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-8 sm:p-10 rounded-3xl border border-stone-200/90 paper-shadow-lg relative overflow-hidden">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-mono font-bold border border-stone-200">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">
                01
              </span>
              <span>STEP ONE • ONBOARDING</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#121316] tracking-tight">
              Create Your Wallet
            </h3>

            <p className="text-stone-600 text-base leading-relaxed">
              Set up a wallet with your own unique username. Your wallet address and metadata are
              instantly initialized inside your browser's IndexedDB partition without sending personal
              identifiable information across the wire.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <RubberStamp text="100% PRIVATE" variant="green" rotation="rotate-[-2deg]" />
              <RubberStamp text="INDEXEDDB SEED" variant="blue" rotation="rotate-[2deg]" />
            </div>
          </div>

          {/* Step 1 Visual: Digital Passport & Username Generator */}
          <div className="lg:col-span-6 relative">
            <div className="bg-[#121316] text-[#faf8f5] p-6 rounded-2xl border border-stone-800 shadow-xl font-mono text-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                  WALLET INITIALIZATION CONSOLE
                </span>
                <span className="text-stone-400 text-[10px]">STATUS: LOCAL_READY</span>
              </div>

              <div>
                <label className="text-[10px] text-stone-400 uppercase block mb-1">
                  Choose Custom Username:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-stone-500">@</span>
                    <input
                      type="text"
                      value={testUsername}
                      onChange={(e) => setTestUsername(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono font-bold focus:outline-hidden focus:border-amber-400 text-xs"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const names = ['solaris.vault', 'chronos.99', 'quantum.time', 'luna.node'];
                      setTestUsername(names[Math.floor(Math.random() * names.length)]);
                    }}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs"
                  >
                    Random
                  </button>
                  <button
                    onClick={handleCopyUsername}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    title="Copy wallet username"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-stone-900/90 rounded-xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-stone-400 text-[10px]">
                  <span>Local Key Derivation:</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> SHA-256 Client Digest
                  </span>
                </div>
                <div className="text-[11px] text-stone-300 truncate">
                  tw_key_9f82c04...e18b82a
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                <span>Stored in browser memory</span>
                <span className="text-amber-300">Zero backend network ping</span>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 02 — Issue & Transfer Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-8 sm:p-10 rounded-3xl border border-stone-200/90 paper-shadow-lg relative overflow-hidden">
          <div className="lg:col-span-6 lg:order-2 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-mono font-bold border border-stone-200">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">
                02
              </span>
              <span>STEP TWO • SIMULATION FLOW</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#121316] tracking-tight">
              Issue & Transfer
            </h3>

            <p className="text-stone-600 text-base leading-relaxed">
              Generate fictional credits and transfer them between wallets. Tap the built-in time-credit
              faucet, pick any recipient username, and test real-time conversions using realistic
              exchange curves.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <RubberStamp text="MULTI-CURRENCY READY" variant="amber" rotation="rotate-[3deg]" />
              <RubberStamp text="FAUCET ENABLED" variant="green" rotation="rotate-[-2deg]" />
            </div>
          </div>

          {/* Step 2 Visual: Interactive Credit Minting Slip */}
          <div className="lg:col-span-6 lg:order-1 relative">
            <div className="bg-[#fef9c3] text-[#713f12] p-6 rounded-2xl border border-amber-300 shadow-md font-sans space-y-4 transform -rotate-1 hover:rotate-0 transition-transform">
              <div className="flex items-center justify-between border-b border-amber-300/80 pb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-700" />
                  TIME-CREDIT MINTING SLIP
                </span>
                <span className="font-mono text-[10px] bg-amber-200/80 px-2 py-0.5 rounded text-amber-900 font-bold">
                  FAUCET v1
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-amber-800">Minted Credit Value</div>
                  <div className="text-3xl font-extrabold text-amber-950 font-mono mt-0.5">
                    +{issuedCredits.toLocaleString()}{' '}
                    <span className="text-sm font-semibold">Credits</span>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  {[1000, 2500, 5000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setIssuedCredits(amt)}
                      className={`px-2.5 py-1 text-xs rounded-md font-mono font-bold transition-all ${
                        issuedCredits === amt
                          ? 'bg-amber-950 text-amber-100 shadow-xs'
                          : 'bg-amber-200/70 text-amber-900 hover:bg-amber-300'
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs font-mono text-stone-800 flex items-center justify-between">
                <span>Receiver: <strong>@elena.orbit</strong></span>
                <span className="text-emerald-700 font-bold">Auto-Exchange: EUR</span>
              </div>

              <div className="text-[11px] font-mono text-amber-900/80 italic">
                * Simulated credits carry no financial value and are generated purely for architectural
                testing.
              </div>
            </div>
          </div>
        </div>

        {/* STEP 03 — Audit Ledger & Rule Watch */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-8 sm:p-10 rounded-3xl border border-stone-200/90 paper-shadow-lg relative overflow-hidden">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-mono font-bold border border-stone-200">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">
                03
              </span>
              <span>STEP THREE • AUDIT & EXPORT</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#121316] tracking-tight">
              Track Every Move
            </h3>

            <p className="text-stone-600 text-base leading-relaxed">
              Monitor balances, transaction history and suspicious activity. Every transaction is
              evaluated against deterministic fraud rules, logged into an immutable in-browser audit
              trail, and exportable as CSV records anytime.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <RubberStamp text="CSV EXPORTABLE" variant="blue" rotation="rotate-[2deg]" />
              <RubberStamp text="FRAUD ENGINE" variant="red" rotation="rotate-[-3deg]" />
            </div>
          </div>

          {/* Step 3 Visual: Paper Receipt Ledger Preview */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-md bg-stone-50 border border-stone-300 rounded-2xl p-5 font-mono text-xs space-y-3 paper-shadow">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="font-bold text-stone-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-stone-700" />
                  REAL-TIME AUDIT STREAM
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  LOCAL STREAM
                </span>
              </div>

              {/* Sample Log Rows */}
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-white border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-900">TXN-7731</span>
                    <span className="text-stone-500 ml-2">alice → bob (1,200 USD)</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">CLEARED</span>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-900">
                  <div>
                    <span className="font-bold text-rose-950">TXN-7732</span>
                    <span className="ml-2 font-medium">alice → bob (6,000 USD)</span>
                  </div>
                  <span className="text-[10px] bg-rose-200 px-1.5 py-0.5 rounded font-bold">
                    FLAGGED: THRESHOLD
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500 border-t border-dashed border-stone-200">
                <span>Format: RFC 4180 CSV Compliant</span>
                <span className="text-stone-900 font-bold flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> 1-Click Export
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
