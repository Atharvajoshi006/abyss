import type { SupportedCurrency } from './wallet';

export type FraudRuleType = 'LARGE_TRANSFER' | 'HIGH_FREQUENCY';
export type FraudSeverity = 'medium' | 'high';
export type FraudAlertStatus = 'FLAGGED' | 'REVIEWED' | 'DISMISSED';

export interface FraudAlert {
  id: string;
  transactionId: string;
  senderWalletId: string;
  ruleType: FraudRuleType;
  severity: FraudSeverity;
  amountMinor: number;
  currency: SupportedCurrency;
  title: string;
  explanation: string;
  detectedAt: string;
  status: FraudAlertStatus;
}
