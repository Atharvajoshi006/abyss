# TIMEWALLET — Multi-Currency Time-Credit Wallet Simulator

A browser-based fictional financial wallet simulator. Create fictional time-credits, transfer across currencies, and monitor suspicious transactions — completely client-side using IndexedDB without a backend or real-money payments.

---

## ⚡ Key Highlights

- **Pure Client-Side Architecture**: Zero backend, zero external databases, zero real-money transactions. All wallets, transactions, and preferences reside directly inside the user's browser via **IndexedDB**.
- **Multi-Currency Parity Engine**: Issue credits in and transfer between USD, EUR, INR, GBP, JPY, CAD, AUD, and CHF with real-world parity data referenced against the public **Frankfurter Currency API**.
- **Deterministic Rule-Based Fraud Detection**:
  - *High-Value Threshold Rule*: Flags transfers exceeding 5,000 units.
  - *Velocity Anomaly Rule*: Flags accounts exceeding 3 transfers within a rolling 24-hour window.
  - *No Black-Box ML Claims*: Fully auditable, transparent rule engine evaluated before state mutation.
- **Offline-First Resilience**: Continue managing accounts, queuing transfers, and reviewing balances offline with cached exchange rates.
- **Interactive Simulator Sandbox**: Launch the interactive modal directly from the landing page to test wallet creation, credit minting (faucet), live transfers, rule triggers, and CSV ledger downloads.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Custom Design Tokens (Tactile paper shadows, desk stationery, cutting mat grid patterns)
- **Icons**: Lucide React
- **Confetti & Micro-interactions**: Canvas Confetti
- **Storage**: Browser IndexedDB (Local-First)
- **Exchange Rates**: Frankfurter Currency API

---

## 📂 Project Structure

```
src/
  components/
    Navbar.tsx                    # Minimalist header with smooth scroll & launch CTAs
    Footer.tsx                    # Branding, architecture links, mandatory disclaimer
    FloatingElements.tsx          # Tactile stationery: Paperclip, StickyNote, RubberStamp, CurrencyToken, PaperReceipt
    SectionHeading.tsx            # Editorial typography headings with theme support
    InteractiveSimulatorModal.tsx # Full interactive test bench (faucet, transfer, rules, CSV)
  sections/
    Hero.tsx                      # SECTION 01: Hero with floating desk objects
    CurrencySection.tsx           # SECTION 02: Multi-Currency experience (Overlapping Alice/Bob cards)
    HowItWorks.tsx                # SECTION 03: 3 distinct visual steps
    ExchangeSection.tsx           # SECTION 04: Frankfurter currency matrix & live rate cards
    FraudSection.tsx              # SECTION 05: Contrasting Deep Navy rule visualizer & test bench
    OfflineSection.tsx            # SECTION 06: IndexedDB devtools inspector & offline highlights
    FeaturesSection.tsx           # SECTION 07: Product capabilities editorial bento panels
    FinalCTA.tsx                  # SECTION 08: Deep Forest-Green cutting mat with metric rulers
  data/
    mockData.ts                   # Currencies, initial transactions, and fraud rules
  types/
    index.ts                      # Shared TypeScript definitions
  App.tsx                         # Section assembly & modal state
  main.tsx                        # Application mount
  index.css                       # Design system CSS tokens, textures, and keyframes
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## ⚠️ Mandatory Disclaimer
**TIMEWALLET is a fictional credit simulation. No real money is stored, transferred or processed.**
