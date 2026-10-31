import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ShieldAlert,
  Download,
  PlusCircle,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CurrencyCode, TransactionRecord } from '../types';
import { CURRENCIES, FRAUD_RULES, INITIAL_TRANSACTIONS } from '../data/mockData';
import { RubberStamp } from './FloatingElements';

interface InteractiveSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveSimulatorModal: React.FC<InteractiveSimulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Simulator State
  const [activeTab, setActiveTab] = useState<'transfer' | 'ledger' | 'rules'>('transfer');
  const [senderUser] = useState('alice.time');
  const [recipientUser, setRecipientUser] = useState('bob.vault');
  const [amount, setAmount] = useState<number>(1200);
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('INR');
  const [balance, setBalance] = useState<number>(14500);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [transferHistoryCount, setTransferHistoryCount] = useState<number>(2);
  const [lastAlert, setLastAlert] = useState<{ type: 'warn' | 'success'; message: string } | null>(
    null
  );

  if (!isOpen) return null;

  // Rate calculation
  const fromRateUSD = CURRENCIES[fromCurrency].rateToUSD;
  const toRateUSD = CURRENCIES[toCurrency].rateToUSD;
  const exchangeRate = toRateUSD / fromRateUSD;
  const convertedAmount = Math.round(amount * exchangeRate * 100) / 100;

  // Execute Simulated Transfer
  const handleTransfer = () => {
    if (amount <= 0) {
      setLastAlert({ type: 'warn', message: 'Please enter a valid credit amount.' });
      return;
    }
    if (amount > balance) {
      setLastAlert({ type: 'warn', message: 'Insufficient fictional credit balance.' });
      return;
    }

    const newTransferCount = transferHistoryCount + 1;
    setTransferHistoryCount(newTransferCount);

    // Rule 1: High Value Threshold > 5,000 USD equivalent
    const amountInUSD = amount / fromRateUSD;
    const isHighValue = amountInUSD > 5000;

    // Rule 2: Velocity Alert > 3 transfers
    const isRapidVelocity = newTransferCount > 3;

    const isFlagged = isHighValue || isRapidVelocity;
    let flagReason = '';
    if (isHighValue && isRapidVelocity) {
      flagReason = 'Flagged: Exceeds 5,000 USD limit & Velocity > 3/24h';
    } else if (isHighValue) {
      flagReason = 'Flagged: Exceeds 5,000-unit threshold';
    } else if (isRapidVelocity) {
      flagReason = 'Flagged: Velocity limit exceeded (>3 transfers in 24h)';
    }

    const newTx: TransactionRecord = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      sender: senderUser,
      receiver: recipientUser,
      sendAmount: amount,
      sendCurrency: fromCurrency,
      receiveAmount: convertedAmount,
      receiveCurrency: toCurrency,
      exchangeRate: Math.round(exchangeRate * 10000) / 10000,
      timestamp: 'Just now',
      status: isFlagged ? 'flagged' : 'completed',
      flagReason: isFlagged ? flagReason : undefined,
    };

    setBalance((prev) => prev - amount);
    setTransactions([newTx, ...transactions]);

    if (isFlagged) {
      setLastAlert({
        type: 'warn',
        message: `Fraud Rule Triggered! ${flagReason}. Transaction logged to audit table.`,
      });
    } else {
      setLastAlert({
        type: 'success',
        message: `Successfully transferred ${amount.toLocaleString()} ${fromCurrency} credits to ${recipientUser}!`,
      });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  // Faucet
  const handleFaucet = () => {
    setBalance((prev) => prev + 5000);
    setLastAlert({
      type: 'success',
      message: 'Minted +5,000 fictional time-credits to your local wallet!',
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'ID,Sender,Receiver,SendAmount,SendCurrency,ReceiveAmount,ReceiveCurrency,ExchangeRate,Status,FlagReason,Timestamp\n';
    const rows = transactions
      .map(
        (t) =>
          `"${t.id}","${t.sender}","${t.receiver}",${t.sendAmount},"${t.sendCurrency}",${t.receiveAmount},"${t.receiveCurrency}",${t.exchangeRate},"${t.status}","${t.flagReason || ''}","${t.timestamp}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `timewallet_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-[#faf8f5] rounded-2xl shadow-2xl border border-stone-300 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#121316] text-[#faf8f5] px-6 py-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 font-mono font-bold flex items-center justify-center text-sm shadow-xs">
              TW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight text-white">
                  TIMEWALLET Simulator Sandbox
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Client-Side Only
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono">
                Pure browser environment • IndexedDB persisted • Zero real funds
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-stone-200/70 border-b border-stone-300 px-6 py-2 flex items-center justify-between text-xs font-semibold">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('transfer')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'transfer'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Transfer Simulator
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'ledger'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Ledger & CSV ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'rules'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Fraud Rules Engine
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-stone-600 font-mono text-[11px]">
            <HardDrive className="w-3.5 h-3.5 text-stone-500" />
            <span>IndexedDB:</span>
            <span className="text-emerald-700 font-bold">READY</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Alert */}
          {lastAlert && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                lastAlert.type === 'warn'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              {lastAlert.type === 'warn' ? (
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              )}
              <span className="font-medium flex-1">{lastAlert.message}</span>
              <button
                onClick={() => setLastAlert(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>
          )}

          {activeTab === 'transfer' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Wallet Balance & Faucet */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
                    <span>ACTIVE WALLET</span>
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-bold">
                      LOCAL
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold font-mono">
                      A
                    </div>
                    <div>
                      <div className="font-bold text-stone-900">{senderUser}</div>
                      <div className="text-xs text-stone-500 font-mono">ID: TW-LOCAL-001</div>
                    </div>
                  </div>

                  <div className="mt-5 p-4 rounded-lg bg-stone-50 border border-stone-200/80">
                    <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                      Available Balance
                    </span>
                    <div className="text-2xl font-extrabold text-stone-950 mt-0.5">
                      {balance.toLocaleString()}{' '}
                      <span className="text-sm font-normal text-stone-500">Credits ({fromCurrency})</span>
                    </div>
                  </div>

                  <button
                    onClick={handleFaucet}
                    className="w-full mt-4 py-2.5 px-4 rounded-xl border border-dashed border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    <span>Mint +5,000 Fictional Credits (Faucet)</span>
                  </button>
                </div>

                {/* Fraud Rule Tips */}
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Simulator Rules Active:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800">
                    <li>Single transfer &gt; 5,000 USD credits triggers high-value alert.</li>
                    <li>&gt; 3 transfers within 24h triggers velocity alert.</li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Transfer Form */}
              <div className="md:col-span-7 bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 text-sm">Send Multi-Currency Credits</h4>
                  <RubberStamp text="FRANKFURTER DATA" variant="blue" rotation="rotate-0" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Recipient Username
                    </label>
                    <input
                      type="text"
                      value={recipientUser}
                      onChange={(e) => setRecipientUser(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 font-mono focus:outline-hidden focus:border-stone-900"
                      placeholder="e.g. bob.vault"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Amount ({fromCurrency})
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 font-mono font-bold focus:outline-hidden focus:border-stone-900"
                    />
                  </div>
                </div>

                {/* Currency Switcher */}
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-stone-500 font-mono uppercase">You Send</div>
                    <select
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
                      className="mt-1 bg-white font-bold text-sm text-stone-900 border border-stone-300 rounded px-2 py-1"
                    >
                      {Object.keys(CURRENCIES).map((c) => (
                        <option key={c} value={c}>
                          {c} ({CURRENCIES[c as CurrencyCode].symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-center px-3">
                    <ArrowRight className="w-5 h-5 text-stone-400 mx-auto" />
                    <span className="text-[10px] font-mono text-stone-500">
                      1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-stone-500 font-mono uppercase">
                      Recipient Gets
                    </div>
                    <select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
                      className="mt-1 bg-white font-bold text-sm text-stone-900 border border-stone-300 rounded px-2 py-1"
                    >
                      {Object.keys(CURRENCIES).map((c) => (
                        <option key={c} value={c}>
                          {c} ({CURRENCIES[c as CurrencyCode].symbol})
                        </option>
                      ))}
                    </select>
                    <div className="text-xs font-mono font-bold text-stone-900 mt-1">
                      ≈ {convertedAmount.toLocaleString()} {toCurrency}
                    </div>
                  </div>
                </div>

                {/* Transfer Action */}
                <button
                  onClick={handleTransfer}
                  className="w-full py-3 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98"
                >
                  <span>Execute Simulated Transfer</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>

                <p className="text-[11px] text-center text-stone-500 font-mono">
                  All state changes are stored locally in IndexedDB memory. No external servers.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Client-Side Transaction Ledger</h4>
                  <p className="text-xs text-stone-500 font-mono">
                    Inspecting IndexedDB objectStore: `transactions`
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>Export Transactions (CSV)</span>
                </button>
              </div>

              <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100/80 border-b border-stone-200 text-stone-600 font-mono text-[11px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Tx ID</th>
                      <th className="py-2.5 px-3">Participants</th>
                      <th className="py-2.5 px-3">Sent</th>
                      <th className="py-2.5 px-3">Received</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-stone-50">
                        <td className="py-2.5 px-3 font-bold text-stone-900">{tx.id}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-stone-800 font-medium">{tx.sender}</span>
                          <span className="text-stone-400 mx-1">→</span>
                          <span className="text-stone-800 font-medium">{tx.receiver}</span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-stone-900">
                          {tx.sendAmount.toLocaleString()} {tx.sendCurrency}
                        </td>
                        <td className="py-2.5 px-3 text-stone-600">
                          {tx.receiveAmount.toLocaleString()} {tx.receiveCurrency}
                        </td>
                        <td className="py-2.5 px-3">
                          {tx.status === 'flagged' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                              <ShieldAlert className="w-3 h-3" /> FLAGGED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3" /> VERIFIED
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-stone-400 text-[11px]">{tx.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Configured Fraud Detection Rules</h4>
                <p className="text-xs text-stone-500 font-mono">
                  Client-side rule-engine evaluated synchronously before state mutation
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FRAUD_RULES.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-bold uppercase">
                        {rule.type}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          rule.severity === 'high'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {rule.severity.toUpperCase()} SEVERITY
                      </span>
                    </div>

                    <h5 className="font-bold text-stone-900 text-sm">{rule.name}</h5>
                    <p className="text-xs text-stone-600 leading-relaxed">{rule.description}</p>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-mono">
                      <span className="text-stone-400">Trigger Threshold:</span>
                      <span className="font-bold text-stone-800">{rule.threshold}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 font-mono">
          <span>Client-Side Simulator v1.0.0</span>
          <span>No Real Money • Pure Educational Sandbox</span>
        </div>
      </div>
    </div>
  );
};
