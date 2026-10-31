import React from 'react';
import { ArrowUp } from 'lucide-react';
import { RubberStamp } from './FloatingElements';

interface FooterProps {
  onLaunchSimulator: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC<FooterProps> = ({ onLaunchSimulator }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#121316] text-[#faf8f5] border-t border-stone-800 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white text-stone-950 flex items-center justify-center font-mono font-bold text-sm">
                <span className="text-amber-500">T</span>W
              </div>
              <span className="font-extrabold tracking-tight text-xl text-white">
                TIMEWALLET
              </span>
            </div>

            <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
              A browser-powered multi-currency wallet simulator. Create fictional credits, transfer
              across currencies, and monitor suspicious transactions — all without a bank, backend, or
              real money.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <RubberStamp text="CLIENT-SIDE ONLY" variant="green" rotation="rotate-0" />
              <RubberStamp text="INDEXEDDB" variant="blue" rotation="rotate-0" />
            </div>
          </div>

          {/* Quick Links Column 1: Product */}
          <div className="md:col-span-2 space-y-3 font-mono text-xs">
            <h5 className="font-bold uppercase tracking-wider text-stone-300">Product</h5>
            <ul className="space-y-2 text-stone-400">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#currencies" className="hover:text-white transition-colors">
                  Multi-Currency
                </a>
              </li>
              <li>
                <a href="#exchange" className="hover:text-white transition-colors">
                  Frankfurter Rates
                </a>
              </li>
              <li>
                <button
                  onClick={onLaunchSimulator}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Interactive Sandbox
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links Column 2: Architecture & Security */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs">
            <h5 className="font-bold uppercase tracking-wider text-stone-300">Security & Storage</h5>
            <ul className="space-y-2 text-stone-400">
              <li>
                <a href="#fraud" className="hover:text-white transition-colors">
                  Rule-Based Engine (&gt;5k Limit)
                </a>
              </li>
              <li>
                <a href="#fraud" className="hover:text-white transition-colors">
                  Velocity Guard (&gt;3 Tx/24h)
                </a>
              </li>
              <li>
                <a href="#offline" className="hover:text-white transition-colors">
                  IndexedDB Local Persistence
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  CSV Ledger Export
                </a>
              </li>
            </ul>
          </div>

          {/* Scroll to Top */}
          <div className="md:col-span-2 flex flex-col justify-between items-start md:items-end">
            <button
              onClick={scrollToTop}
              className="p-3 rounded-full bg-stone-900 border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-white transition-colors shadow-sm"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div className="text-[11px] font-mono text-stone-500 mt-6 md:mt-0 md:text-right">
              Task 01 Foundation • Built with React & Vite
            </div>
          </div>
        </div>

        {/* Mandatory Legal & Simulator Disclaimer Banner */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-500">
          <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800 text-stone-400 max-w-2xl text-center sm:text-left">
            <strong className="text-amber-300 block mb-0.5">MANDATORY DISCLAIMER:</strong>
            TIMEWALLET is a fictional credit simulation. No real money is stored, transferred or
            processed.
          </div>

          <div className="text-[11px] text-stone-400">
            © {CURRENT_YEAR} TIMEWALLET Project. Purely client-side educational simulation.
          </div>
        </div>
      </div>
    </footer>
  );
};
