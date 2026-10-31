import { db } from '../db/database';
import type { SupportedCurrency } from '../types/wallet';
import type { FraudAlert } from '../types/fraud';
import { CURRENCY_CONFIGS, formatMinorUnits } from '../utils/currency';

export interface FraudEvaluationContext {
  transactionId: string;
  senderWalletId: string;
  sourceAmountMinor: number;
  sourceCurrency: SupportedCurrency;
  createdAt: string;
}

export const LARGE_TRANSFER_THRESHOLD_UNITS = 5000;
export const HIGH_FREQUENCY_THRESHOLD_COUNT = 3;
export const ROLLING_WINDOW_HOURS = 24;

/**
 * Pure rule checker for Rule 1: Large Transfer.
 * Flags transfers strictly exceeding 5,000 major units of the source currency.
 */
export function isLargeTransfer(sourceAmountMinor: number, sourceCurrency: SupportedCurrency): boolean {
  const sourceConfig = CURRENCY_CONFIGS[sourceCurrency];
  const sourceFractionDigits = sourceConfig ? sourceConfig.fractionDigits : 2;
  const majorUnits = sourceAmountMinor / 10 ** sourceFractionDigits;
  return majorUnits > LARGE_TRANSFER_THRESHOLD_UNITS;
}

/**
 * Pure rule checker for Rule 2: High Transaction Frequency.
 * Flags if total outgoing transfers in the rolling 24-hour window (including the current one) exceeds 3.
 */
export function isHighFrequency(
  pastOutgoingTimestampsMs: number[],
  currentTimestampMs: number
): { triggered: boolean; totalInWindow: number } {
  const windowStartMs = currentTimestampMs - ROLLING_WINDOW_HOURS * 60 * 60 * 1000;
  const inWindow = pastOutgoingTimestampsMs.filter((t) => t >= windowStartMs && t <= currentTimestampMs);
  const totalInWindow = inWindow.length + 1;
  return {
    triggered: totalInWindow > HIGH_FREQUENCY_THRESHOLD_COUNT,
    totalInWindow,
  };
}

/**
 * Evaluates rule-based fraud detection rules against the current transfer.
 * Returns an array of FraudAlert entities to be committed atomically with the transaction.
 */
export async function evaluateFraudRules(
  context: FraudEvaluationContext
): Promise<FraudAlert[]> {
  const alerts: FraudAlert[] = [];
  const { transactionId, senderWalletId, sourceAmountMinor, sourceCurrency, createdAt } = context;

  // RULE 1: LARGE TRANSFER
  // Flag transfers strictly exceeding 5,000 major units of the source currency
  if (isLargeTransfer(sourceAmountMinor, sourceCurrency)) {
    alerts.push({
      id: `alert_${crypto.randomUUID()}`,
      transactionId,
      senderWalletId,
      ruleType: 'LARGE_TRANSFER',
      severity: 'high',
      amountMinor: sourceAmountMinor,
      currency: sourceCurrency,
      title: 'LARGE TRANSFER DETECTED',
      explanation: `Transfer of ${formatMinorUnits(
        sourceAmountMinor,
        sourceCurrency
      )} strictly exceeds the ${LARGE_TRANSFER_THRESHOLD_UNITS.toLocaleString()} unit threshold.`,
      detectedAt: createdAt,
      status: 'FLAGGED',
    });
  }

  // RULE 2: HIGH TRANSACTION FREQUENCY
  // Flag users making more than three successful outgoing transfers within a rolling 24-hour period.
  // Query previous successful outgoing transfers for this sender
  const candidateTxs = await db.transactions
    .where('senderWalletId')
    .equals(senderWalletId)
    .toArray();

  // Also include fallback for Phase 2 records where walletId is senderWalletId
  const legacyTxs = await db.transactions
    .where('walletId')
    .equals(senderWalletId)
    .toArray();

  const allSenderTxs = Array.from(
    new Map([...candidateTxs, ...legacyTxs].map((tx) => [tx.id, tx])).values()
  );

  const pastTimestamps = allSenderTxs
    .filter((tx) => tx.type === 'TRANSFER' && tx.id !== transactionId)
    .map((tx) => new Date(tx.createdAt).getTime());

  const currentMs = new Date(createdAt).getTime();
  const freqCheck = isHighFrequency(pastTimestamps, currentMs);

  if (freqCheck.triggered) {
    alerts.push({
      id: `alert_${crypto.randomUUID()}`,
      transactionId,
      senderWalletId,
      ruleType: 'HIGH_FREQUENCY',
      severity: 'medium',
      amountMinor: sourceAmountMinor,
      currency: sourceCurrency,
      title: 'HIGH TRANSACTION FREQUENCY',
      explanation: `User initiated ${freqCheck.totalInWindow} outgoing transfers within a rolling 24-hour window (threshold: ${HIGH_FREQUENCY_THRESHOLD_COUNT}).`,
      detectedAt: createdAt,
      status: 'FLAGGED',
    });
  }

  return alerts;
}

/**
 * Returns all fraud alerts from IndexedDB, optionally filtered by wallet ID.
 */
export async function getFraudAlerts(walletId?: string): Promise<FraudAlert[]> {
  if (walletId) {
    const list = await db.fraudAlerts.where('senderWalletId').equals(walletId).toArray();
    return list.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  }

  const list = await db.fraudAlerts.toArray();
  return list.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
}
