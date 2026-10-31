import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './sections/Hero';
import { CurrencySection } from './sections/CurrencySection';
import { HowItWorks } from './sections/HowItWorks';
import { ExchangeSection } from './sections/ExchangeSection';
import { FraudSection } from './sections/FraudSection';
import { OfflineSection } from './sections/OfflineSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { FinalCTA } from './sections/FinalCTA';
import { Footer } from './components/Footer';
import { InteractiveSimulatorModal } from './components/InteractiveSimulatorModal';

export const App: React.FC = () => {
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  const handleOpenSimulator = () => {
    setSimulatorOpen(true);
  };

  const handleCloseSimulator = () => {
    setSimulatorOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#121316] flex flex-col selection:bg-stone-900 selection:text-white">
      {/* Top Navbar */}
      <Navbar onLaunchSimulator={handleOpenSimulator} />

      {/* Main Sections in Explicit Order */}
      <main className="flex-1">
        {/* SECTION 01 — HERO */}
        <Hero onExplore={handleOpenSimulator} />

        {/* SECTION 02 — MULTI-CURRENCY EXPERIENCE */}
        <CurrencySection />

        {/* SECTION 03 — HOW IT WORKS */}
        <HowItWorks />

        {/* SECTION 04 — CURRENCY EXCHANGE */}
        <ExchangeSection />

        {/* SECTION 05 — FRAUD DETECTION (Contrasting Deep Navy) */}
        <FraudSection />

        {/* SECTION 06 — OFFLINE FIRST */}
        <OfflineSection />

        {/* SECTION 07 — PRODUCT CAPABILITIES */}
        <FeaturesSection />

        {/* SECTION 08 — FINAL CTA (Deep Forest-Green Cutting Mat) */}
        <FinalCTA onLaunch={handleOpenSimulator} />
      </main>

      {/* SECTION 09 — FOOTER */}
      <Footer onLaunchSimulator={handleOpenSimulator} />

      {/* Interactive Simulator Sandbox Modal */}
      <InteractiveSimulatorModal isOpen={simulatorOpen} onClose={handleCloseSimulator} />
    </div>
  );
};

export default App;
