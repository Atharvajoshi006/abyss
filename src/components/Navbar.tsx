import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, ShieldCheck, HardDrive, Sparkles } from 'lucide-react';

interface NavbarProps {
  onLaunchSimulator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLaunchSimulator }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Multi-Currency', href: '#currencies' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Exchange', href: '#exchange' },
    { name: 'Fraud Engine', href: '#fraud' },
    { name: 'Offline First', href: '#offline' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#faf8f5]/85 backdrop-blur-md border-b border-stone-200/80 shadow-xs py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#"
            className="flex items-center gap-2.5 group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-900 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-[#121316] text-[#faf8f5] flex items-center justify-center font-mono font-bold text-base shadow-sm group-hover:scale-105 transition-transform duration-200">
              <span className="text-amber-400">T</span>W
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-lg text-[#121316] flex items-center gap-1.5">
                TIMEWALLET
                <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-sm bg-stone-200 text-stone-700 uppercase tracking-wider">
                  SIMULATOR
                </span>
              </span>
              <span className="text-[10px] text-stone-500 font-mono tracking-tight -mt-0.5">
                Client-Side • IndexedDB
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100/70 border border-stone-200/80 rounded-full px-4 py-1.5 backdrop-blur-xs">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3 py-1 text-sm font-medium text-stone-600 hover:text-stone-950 hover:bg-stone-200/50 rounded-full transition-colors duration-150"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Frankfurter API Ready</span>
            </div>

            <button
              onClick={onLaunchSimulator}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#121316] hover:bg-stone-800 text-[#faf8f5] text-sm font-semibold shadow-md transition-all duration-200 hover:shadow-lg active:scale-95"
            >
              <span>Launch Simulator</span>
              <ArrowUpRight className="w-4 h-4 text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={onLaunchSimulator}
              className="px-3 py-1.5 rounded-full bg-[#121316] text-[#faf8f5] text-xs font-semibold shadow-xs"
            >
              Launch
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:text-stone-950 hover:bg-stone-100 focus:outline-hidden"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-stone-200 bg-[#faf8f5]/95 backdrop-blur-md px-6 py-5 shadow-lg">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-base font-semibold text-stone-800 hover:text-black border-b border-stone-200/50"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLaunchSimulator();
                }}
                className="w-full py-3 rounded-xl bg-[#121316] text-white font-semibold text-center flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Launch Interactive Simulator</span>
              </button>
              <div className="flex items-center justify-center gap-3 text-xs text-stone-500 font-mono pt-1">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5" /> 100% IndexedDB
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> No Real Money
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
