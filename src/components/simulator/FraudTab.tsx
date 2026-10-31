import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Filter,
  Check,
  Copy,
  ShieldCheck,
} from 'lucide-react';
import type { FraudAlert } from '../../types/fraud';
import type { Wallet } from '../../types/wallet';
import type { Transaction } from '../../types/transaction';
import { formatMinorUnits } from '../../utils/currency';

interface FraudTabProps {
  alerts: FraudAlert[];
  wallets: Wallet[];
  transactions: Transaction[];
}

export const FraudTab: React.FC<FraudTabProps> = ({
  alerts,
  wallets,
  transactions,
}) => {
  const [filterRule, setFilterRule] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const walletMap = new Map<string, Wallet>();
  wallets.forEach((w) => walletMap.set(w.id, w));

  const txMap = new Map<string, Transaction>();
  transactions.forEach((t) => txMap.set(t.id, t));

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const largeTransferCount = alerts.filter((a) => a.ruleType === 'LARGE_TRANSFER').length;
  const highFrequencyCount = alerts.filter((a) => a.ruleType === 'HIGH_FREQUENCY').length;

  const filteredAlerts = alerts.filter((a) => {
    if (filterRule !== 'ALL' && a.ruleType !== filterRule) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Flagged Alerts */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Flagged Alerts
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900 font-mono">
              {alerts.length}
            </span>
            <span className="text-xs text-stone-400">detections</span>
          </div>
          <div className="mt-2 text-[11px] text-stone-500 font-mono">
            Rule-based client monitor
          </div>
        </div>

        {/* Large Transfer Alerts */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Large Transfers (&gt; 5,000)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700 font-mono">
              {largeTransferCount}
            </span>
            <span className="text-xs text-stone-400">alerts</span>
          </div>
          <div className="mt-2 text-[11px] text-stone-500 font-mono">
            Threshold: strictly &gt; 5,000 units
          </div>
        </div>

        {/* High Frequency Alerts */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              High Frequency (&gt; 3 / 24h)
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-700 font-mono">
              {highFrequencyCount}
            </span>
            <span className="text-xs text-stone-400">alerts</span>
          </div>
          <div className="mt-2 text-[11px] text-stone-500 font-mono">
            Velocity: rolling 24-hour window
          </div>
        </div>
      </div>

      {/* Rules Notice Banner */}
      <div className="p-4 rounded-xl bg-[#09111e] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Rule-Based Detection Active</span>
          </div>
          <p className="text-stone-300 text-[11px] font-mono">
            Rule 1: Flag single transfers &gt; 5,000 units • Rule 2: Flag &gt; 3 outgoing transfers in rolling 24h.
            Flagged transactions complete atomically; alerts are persisted in IndexedDB.
          </p>
        </div>
        <div className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-stone-800 text-stone-300 border border-stone-700 self-start sm:self-auto shrink-0">
          Non-Blocking Surveillance
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600">
            <Filter className="w-3.5 h-3.5" />
            <span>Rule Filter:</span>
          </div>
          <select
            value={filterRule}
            onChange={(e) => setFilterRule(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 font-mono focus:outline-hidden focus:bg-white"
          >
            <option value="ALL">All Rules ({alerts.length})</option>
            <option value="LARGE_TRANSFER">Large Transfer ({largeTransferCount})</option>
            <option value="HIGH_FREQUENCY">High Frequency ({highFrequencyCount})</option>
          </select>
        </div>
        <div className="text-xs text-stone-500 font-mono">
          Showing {filteredAlerts.length} of {alerts.length} alerts
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-stone-200 rounded-2xl bg-white p-6">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">No Fraud Alerts Detected</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            {alerts.length === 0
              ? 'No transactions have triggered the 5,000-unit threshold or the 24-hour high-frequency velocity limit.'
              : 'No alerts match the selected filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const sender = walletMap.get(alert.senderWalletId);
            const tx = txMap.get(alert.transactionId);
            const recipient = tx ? walletMap.get(tx.recipientWalletId || '') : undefined;
            const isLarge = alert.ruleType === 'LARGE_TRANSFER';

            return (
              <div
                key={alert.id}
                className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 shadow-2xs transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        isLarge
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-purple-100 text-purple-900 border border-purple-200'
                      }`}
                    >
                      {isLarge ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{alert.title}</span>
                    </span>

                    <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      SEVERITY: {alert.severity.toUpperCase()}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-stone-500">
                    {new Date(alert.detectedAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Sender:</span>
                    <span className="font-bold text-stone-900">
                      {sender ? `@${sender.username}` : alert.senderWalletId.slice(0, 10)}
                    </span>
                  </div>

                  {recipient && (
                    <div>
                      <span className="text-stone-400 block text-[10px]">Recipient:</span>
                      <span className="font-bold text-stone-900">@{recipient.username}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-stone-400 block text-[10px]">Source Amount:</span>
                    <span className="font-bold text-stone-900">
                      {formatMinorUnits(alert.amountMinor, alert.currency)}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 block text-[10px]">Transaction ID:</span>
                    <div className="flex items-center gap-1 text-stone-800">
                      <span className="truncate max-w-[120px]">{alert.transactionId}</span>
                      <button
                        onClick={() => handleCopy(alert.transactionId)}
                        className="text-stone-400 hover:text-stone-700 p-0.5"
                        title="Copy Tx ID"
                      >
                        {copiedId === alert.transactionId ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700 font-mono">
                  <span className="font-bold text-stone-900">Evaluation: </span>
                  <span>{alert.explanation}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
