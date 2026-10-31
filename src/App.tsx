import React, { useState, useEffect } from 'react';
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
import { SimulatorPage } from './pages/SimulatorPage';

const getNormalizedPath = (): string => {
  if (typeof window === 'undefined') return '/';
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return path;
};

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(getNormalizedPath());
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  // Sync state with browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getNormalizedPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(getNormalizedPath());
    window.scrollTo(0, 0);
  };

  const handleLaunchSimulator = () => {
    navigateTo('/app');
  };

  const handleCloseModal = () => {
    setSimulatorOpen(false);
  };

  // Route to the functional wallet simulator at /app
  if (currentPath === '/app' || currentPath.startsWith('/app/')) {
    return <SimulatorPage onNavigateHome={() => navigateTo('/')} />;
  }

  // Route to marketing landing page at /
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#121316] flex flex-col selection:bg-stone-900 selection:text-white">
      {/* Top Navbar */}
      <Navbar onLaunchSimulator={handleLaunchSimulator} />

      {/* Main Sections in Explicit Order */}
      <main className="flex-1">
        {/* SECTION 01 — HERO */}
        <Hero onExplore={handleLaunchSimulator} />

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
        <FinalCTA onLaunch={handleLaunchSimulator} />
      </main>

      {/* SECTION 09 — FOOTER */}
      <Footer onLaunchSimulator={handleLaunchSimulator} />

      {/* Interactive Simulator Sandbox Modal (Preserved for compatibility) */}
      <InteractiveSimulatorModal isOpen={simulatorOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default App;
