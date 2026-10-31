import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Users,
  Copy,
  Check,
  RotateCcw,
  RefreshCw,
  Globe,
} from 'lucide-react';
import type { Wallet, Balance, SupportedCurrency } from '../../types/wallet';
import type { Transaction } from '../../types/transaction';
import type { ExchangeRateResult } from '../../types/exchange';
import {
  SUPPORTED_CURRENCIES,
  CURRENCY_CONFIGS,
  parseAmountToMinor,
  formatMinorUnits,
  minorToDecimalString,
} from '../../utils/currency';
import { transferCredits } from '../../services/transferService';
import { getExchangeRate, convertCurrencyAmount } from '../../services/exchangeService';

interface TransferTabProps {
  wallets: Wallet[];
  balances: Balance[];
  preselectedSenderId?: string;
  onOpenCreateWallet: () => void;
  onTransactionSuccess: (tx: Transaction) => void;
}

export const TransferTab: React.FC<TransferTabProps> = ({
  wallets,
  balances,
  preselectedSenderId,
  onOpenCreateWallet,
  onTransactionSuccess,
}) => {
  // State for sender & recipient
  const [overrideSenderId, setOverrideSenderId] = useState<string | null>(null);
  const senderWalletId =
    overrideSenderId ?? preselectedSenderId ?? (wallets.length > 0 ? wallets[0].id : '');

  const availableRecipients = wallets.filter((w) => w.id !== senderWalletId);
  const [overrideRecipientId, setOverrideRecipientId] = useState<string | null>(null);
  const recipientWalletId =
    overrideRecipientId ?? (availableRecipients.length > 0 ? availableRecipients[0].id : '');

  // Cross-Currency selectors
  const [sourceCurrency, setSourceCurrency] = useState<SupportedCurrency>('USD');
  const [destinationCurrency, setDestinationCurrency] = useState<SupportedCurrency>('INR');

  // Exchange rate state
  const [rateInfo, setRateInfo] = useState<ExchangeRateResult | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

  const [amountStr, setAmountStr] = useState<string>('100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Persistent operation idempotency key in state
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => `idem_${crypto.randomUUID()}`);

  const senderWallet = wallets.find((w) => w.id === senderWalletId);
  const recipientWallet = wallets.find((w) => w.id === recipientWalletId);

  // Balances
  const senderBalanceRecord = balances.find(
    (b) => b.walletId === senderWalletId && b.currency === sourceCurrency
  );
  const senderCurrentMinor = senderBalanceRecord ? senderBalanceRecord.amountMinor : 0;

  const recipientBalanceRecord = balances.find(
    (b) => b.walletId === recipientWalletId && b.currency === destinationCurrency
  );
  const recipientCurrentMinor = recipientBalanceRecord ? recipientBalanceRecord.amountMinor : 0;

  // Rate Fetching
  const fetchRate = useCallback(async (src: SupportedCurrency, dst: SupportedCurrency) => {
    setRateLoading(true);
    setRateError(null);
    try {
      const res = await getExchangeRate(src, dst);
      setRateInfo(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setRateError(err.message);
      } else {
        setRateError('Failed to fetch reference rate.');
      }
      setRateInfo(null);
    } finally {
      setRateLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRate(sourceCurrency, destinationCurrency);
  }, [sourceCurrency, destinationCurrency, fetchRate]);

  // Amount parsing
  const parseResult = parseAmountToMinor(amountStr, sourceCurrency);
  const isSelfTransfer = senderWalletId && recipientWalletId && senderWalletId === recipientWalletId;
  const isInsufficient =
    parseResult.success &&
    parseResult.amountMinor !== undefined &&
    parseResult.amountMinor > senderCurrentMinor;

  // Converted amount calculation
  let destAmountMinor = 0;
  if (parseResult.success && parseResult.amountMinor !== undefined && rateInfo) {
    try {
      destAmountMinor = convertCurrencyAmount(
        parseResult.amountMinor,
        sourceCurrency,
        destinationCurrency,
        rateInfo.rate
      );
    } catch (convErr) {
      console.error('Conversion arithmetic error:', convErr);
    }
  }

  const previewSenderRemaining =
    parseResult.success && parseResult.amountMinor !== undefined && !isInsufficient
      ? senderCurrentMinor - parseResult.amountMinor
      : null;

  const previewRecipientNew =
    parseResult.success && parseResult.amountMinor !== undefined && !isInsufficient
      ? recipientCurrentMinor + destAmountMinor
      : null;

  // Real-time fraud detection heuristic
  const sourceConfig = CURRENCY_CONFIGS[sourceCurrency];
  const sourceMajorUnits =
    parseResult.success && parseResult.amountMinor !== undefined
      ? parseResult.amountMinor / 10 ** sourceConfig.fractionDigits
      : 0;
  const willTriggerLargeTransfer = sourceMajorUnits > 5000;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSenderChange = (id: string) => {
    setOverrideSenderId(id);
    setIdempotencyKey(`idem_${crypto.randomUUID()}`);
    setError(null);
    setLastTx(null);
    if (recipientWalletId === id) {
      const other = wallets.find((w) => w.id !== id);
      if (other) {
        setOverrideRecipientId(other.id);
      }
    }
  };

  const handleRecipientChange = (id: string) => {
    setOverrideRecipientId(id);
    setIdempotencyKey(`idem_${crypto.randomUUID()}`);
    setError(null);
    setLastTx(null);
  };

  const handleSourceCurrencyChange = (newCurr: SupportedCurrency) => {
    setSourceCurrency(newCurr);
    setIdempotencyKey(`idem_${crypto.randomUUID()}`);
    setError(null);
    setLastTx(null);
    if (CURRENCY_CONFIGS[newCurr].fractionDigits === 0 && amountStr.includes('.')) {
      setAmountStr(amountStr.split('.')[0]);
    }
  };

  const handleDestinationCurrencyChange = (newCurr: SupportedCurrency) => {
    setDestinationCurrency(newCurr);
    setIdempotencyKey(`idem_${crypto.randomUUID()}`);
    setError(null);
    setLastTx(null);
  };

  const handleAmountChange = (val: string) => {
    setAmountStr(val);
    setIdempotencyKey(`idem_${crypto.randomUUID()}`);
    setError(null);
  };

  const handlePercentageClick = (pct: number) => {
    if (senderCurrentMinor <= 0) return;
    const targetMinor = Math.floor((senderCurrentMinor * pct) / 100);
    const decimal = minorToDecimalString(targetMinor, sourceCurrency);
    setAmountStr(decimal);
    setIdempotencyKey(`idem_${crypto.randomUUID()}`);
    setError(null);
  };

  const handleCancel = () => {
    setAmountStr('');
    setError(null);
    setLastTx(null);
    setIdempotencyKey(`idem_${crypto.randomUUID()}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!senderWalletId || !recipientWalletId) {
      setError('Please select both a sender and recipient wallet.');
      return;
    }

    if (senderWalletId === recipientWalletId) {
      setError('Sender and recipient must be different wallets.');
      return;
    }

    if (!rateInfo) {
      setError('Exchange rate is unavailable. Cannot proceed with transfer.');
      return;
    }

    const validation = parseAmountToMinor(amountStr, sourceCurrency);
    if (!validation.success || validation.amountMinor === undefined) {
      setError(validation.error || 'Please enter a valid amount.');
      return;
    }

    if (validation.amountMinor > senderCurrentMinor) {
      setError(
        `Insufficient balance: @${senderWallet?.username} has ${formatMinorUnits(
          senderCurrentMinor,
          sourceCurrency
        )}, attempted to transfer ${formatMinorUnits(validation.amountMinor, sourceCurrency)}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Execute atomic cross-currency transfer with snapshot rate
      const tx = await transferCredits({
        senderWalletId,
        recipientWalletId,
        sourceCurrency,
        destinationCurrency,
        amountMinor: validation.amountMinor,
        exchangeRate: rateInfo.rate,
        exchangeRateDate: rateInfo.date,
        exchangeRateFetchedAt: rateInfo.fetchedAt,
        exchangeRateSource: rateInfo.source,
        idempotencyKey,
      });

      setLastTx(tx);
      setIdempotencyKey(`idem_${crypto.randomUUID()}`);
      onTransactionSuccess(tx);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Transfer failed during database commit.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (wallets.length < 2) {
    return (
      <div className="p-8 text-center bg-white border border-dashed border-stone-200 rounded-2xl max-w-xl mx-auto my-8">
        <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center mx-auto mb-3">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900">
          {wallets.length === 0 ? 'Wallets Required' : 'Second Wallet Required'}
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-5">
          Wallet transfers require at least two distinct wallets in IndexedDB.
          {wallets.length === 1 && ` Currently you have 1 wallet (@${wallets[0].username}).`}
        </p>
        <button
          onClick={onOpenCreateWallet}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#121316] text-[#faf8f5] text-xs font-semibold hover:bg-stone-800 shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4 text-amber-300" />
          <span>{wallets.length === 0 ? 'Create First Wallet' : 'Create Second Wallet'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* SECTION 8: TRANSFER RECEIPT (Shown on successful commit) */}
      {lastTx && (
        <div className="p-6 rounded-2xl bg-white border border-emerald-300 shadow-md animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-emerald-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Transfer Receipt</h3>
                <p className="text-[11px] text-stone-500 font-mono">
                  IndexedDB Atomic Commit Confirmed
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              STATUS: COMPLETED
            </span>
          </div>

          {/* Fraud Flag Notice if triggered */}
          {lastTx.isFlagged && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-mono space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Flagged by Fraud Detection Engine</span>
              </div>
              <ul className="list-disc list-inside text-amber-800 text-[11px] pl-1">
                {lastTx.flagReasons?.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono mb-4">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                Transaction Details
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Tx ID:</span>
                <div className="flex items-center gap-1 font-bold text-stone-900">
                  <span className="truncate max-w-[140px]">{lastTx.id}</span>
                  <button
                    onClick={() => handleCopy(lastTx.id)}
                    className="text-stone-400 hover:text-stone-800 p-0.5"
                    title="Copy Tx ID"
                  >
                    {copiedId === lastTx.id ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Timestamp:</span>
                <span className="text-stone-800">{new Date(lastTx.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                <span className="text-stone-500">Amount Sent:</span>
                <span className="font-bold text-stone-900">
                  {formatMinorUnits(lastTx.sourceAmountMinor ?? lastTx.amountMinor, lastTx.sourceCurrency ?? lastTx.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Amount Received:</span>
                <span className="font-bold text-emerald-700">
                  {formatMinorUnits(
                    lastTx.destinationAmountMinor ?? lastTx.amountMinor,
                    lastTx.destinationCurrency ?? lastTx.currency
                  )}
                </span>
              </div>
              {lastTx.exchangeRate && (
                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                  <span>Exchange Rate:</span>
                  <span>
                    1 {lastTx.sourceCurrency ?? lastTx.currency} = {lastTx.exchangeRate} {lastTx.destinationCurrency ?? lastTx.currency}
                  </span>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                Parties & Resulting Balances
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Sender:</span>
                <span className="font-bold text-stone-900">@{senderWallet?.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Sender Balance After:</span>
                <span className="font-bold text-stone-800">
                  {lastTx.senderBalanceAfterMinor !== undefined
                    ? formatMinorUnits(lastTx.senderBalanceAfterMinor, lastTx.sourceCurrency ?? lastTx.currency)
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                <span className="text-stone-500">Recipient:</span>
                <span className="font-bold text-stone-900">@{recipientWallet?.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Recipient Balance After:</span>
                <span className="font-bold text-emerald-700">
                  {lastTx.recipientBalanceAfterMinor !== undefined
                    ? formatMinorUnits(
                        lastTx.recipientBalanceAfterMinor,
                        lastTx.destinationCurrency ?? lastTx.currency
                      )
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setLastTx(null);
                setAmountStr('');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Make Another Transfer</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Transfer Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#121316]">Multi-Currency Transfer</h2>
              <p className="text-xs text-stone-500 font-mono">
                Atomic peer-to-peer exchange with deterministic conversion
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fraud Monitored</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Sender & Recipient Wallet Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sender */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                From (Sender) <span className="text-rose-500">*</span>
              </label>
              <select
                value={senderWalletId}
                onChange={(e) => handleSenderChange(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    @{w.username} {w.displayName ? `(${w.displayName})` : ''}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 pt-1">
                <span>Available ({sourceCurrency}):</span>
                <span className="font-bold text-stone-900">
                  {formatMinorUnits(senderCurrentMinor, sourceCurrency)}
                </span>
              </div>
            </div>

            {/* Recipient */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                To (Recipient) <span className="text-rose-500">*</span>
              </label>
              <select
                value={recipientWalletId}
                onChange={(e) => handleRecipientChange(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id} disabled={w.id === senderWalletId}>
                    @{w.username} {w.displayName ? `(${w.displayName})` : ''}
                    {w.id === senderWalletId ? ' (Sender)' : ''}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 pt-1">
                <span>Current ({destinationCurrency}):</span>
                <span className="font-bold text-stone-900">
                  {formatMinorUnits(recipientCurrentMinor, destinationCurrency)}
                </span>
              </div>
            </div>
          </div>

          {/* Self-transfer warning */}
          {isSelfTransfer && (
            <p className="text-xs text-rose-600 flex items-center gap-1 font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Sender and recipient cannot be the same wallet.</span>
            </p>
          )}

          {/* 2. Currency Selectors (Source & Destination) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Source Currency (Sender Debited)
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {SUPPORTED_CURRENCIES.map((curr) => {
                  const conf = CURRENCY_CONFIGS[curr];
                  const isSelected = curr === sourceCurrency;
                  return (
                    <button
                      type="button"
                      key={curr}
                      onClick={() => handleSourceCurrencyChange(curr)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-[#121316] text-[#faf8f5] border-[#121316] shadow-2xs'
                          : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                      }`}
                    >
                      <div className="text-sm">{conf.flag}</div>
                      <div className="font-mono font-bold text-[11px]">{curr}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Destination Currency (Recipient Credited)
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {SUPPORTED_CURRENCIES.map((curr) => {
                  const conf = CURRENCY_CONFIGS[curr];
                  const isSelected = curr === destinationCurrency;
                  return (
                    <button
                      type="button"
                      key={curr}
                      onClick={() => handleDestinationCurrencyChange(curr)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-[#121316] text-[#faf8f5] border-[#121316] shadow-2xs'
                          : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                      }`}
                    >
                      <div className="text-sm">{conf.flag}</div>
                      <div className="font-mono font-bold text-[11px]">{curr}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Exchange Rate Information Banner */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/90 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-stone-500 shrink-0" />
              <div>
                {rateLoading ? (
                  <span className="text-stone-500 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                    Fetching latest reference rate...
                  </span>
                ) : rateError ? (
                  <span className="text-rose-600 font-bold">{rateError}</span>
                ) : rateInfo ? (
                  <span className="text-stone-900 font-bold">
                    1 {sourceCurrency} = {rateInfo.rate} {destinationCurrency}
                  </span>
                ) : null}
                {rateInfo && (
                  <span className="text-stone-400 block text-[10px]">
                    Reference Date: {rateInfo.date} • Fetched: {new Date(rateInfo.fetchedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              {rateInfo && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    rateInfo.source === 'api'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : rateInfo.source === 'identity'
                      ? 'bg-stone-100 text-stone-700 border-stone-300'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {rateInfo.source === 'api'
                    ? 'Frankfurter V2 Live'
                    : rateInfo.source === 'identity'
                    ? 'Same Currency (1:1)'
                    : 'IndexedDB Cached Rate'}
                </span>
              )}
              {sourceCurrency !== destinationCurrency && (
                <button
                  type="button"
                  onClick={() => fetchRate(sourceCurrency, destinationCurrency)}
                  disabled={rateLoading}
                  className="p-1 rounded-lg hover:bg-stone-200 text-stone-500 transition-colors"
                  title="Refresh rate"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${rateLoading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* 4. Transfer Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Send Amount ({sourceCurrency}) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-stone-400 font-mono">
                {sourceConfig.fractionDigits === 0
                  ? 'Precision: Whole numbers only'
                  : `Precision: Max ${sourceConfig.fractionDigits} decimals`}
              </span>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-500 font-mono text-base font-bold pointer-events-none">
                {sourceConfig.symbol}
              </span>
              <input
                type="text"
                value={amountStr}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder={sourceConfig.fractionDigits === 0 ? '100' : '100.00'}
                disabled={isSubmitting}
                className={`w-full pl-9 pr-4 py-3 rounded-xl border bg-white text-stone-900 text-base font-mono font-bold focus:outline-hidden transition-all ${
                  isInsufficient
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-500'
                    : 'border-stone-300 focus:ring-2 focus:ring-stone-900 focus:border-stone-900'
                }`}
              />
            </div>

            {/* Warning if insufficient */}
            {isInsufficient && (
              <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-mono">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>
                  Amount exceeds @{senderWallet?.username}'s available balance (
                  {formatMinorUnits(senderCurrentMinor, sourceCurrency)}).
                </span>
              </p>
            )}

            {/* Quick Presets */}
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-[10px] text-stone-400 uppercase font-mono">Quick:</span>
              {[25, 50, 75, 100].map((pct) => (
                <button
                  type="button"
                  key={pct}
                  onClick={() => handlePercentageClick(pct)}
                  disabled={senderCurrentMinor <= 0}
                  className="px-2.5 py-0.5 text-[11px] font-mono font-semibold rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {pct === 100 ? 'All (100%)' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Transaction Summary Card & Converted Amount Preview */}
          {previewSenderRemaining !== null && previewRecipientNew !== null && rateInfo && (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono space-y-2">
              <div className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">
                Conversion &amp; Transaction Summary
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Sender Debited:</span>
                <span className="font-bold text-stone-900">
                  {formatMinorUnits(parseResult.amountMinor!, sourceCurrency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Recipient Credited:</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {formatMinorUnits(destAmountMinor, destinationCurrency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-500 text-[11px]">
                <span>Snapshot Reference Rate:</span>
                <span>
                  1 {sourceCurrency} = {rateInfo.rate} {destinationCurrency}
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-600 pt-1 border-t border-stone-200">
                <span>@{senderWallet?.username} Remaining:</span>
                <span>{formatMinorUnits(previewSenderRemaining, sourceCurrency)}</span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>@{recipientWallet?.username} New Balance:</span>
                <span className="font-semibold text-emerald-700">
                  {formatMinorUnits(previewRecipientNew, destinationCurrency)}
                </span>
              </div>

              {/* Fraud rule pre-warning */}
              {willTriggerLargeTransfer && (
                <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    Notice: This transfer strictly exceeds 5,000 {sourceCurrency} and will be flagged by the fraud detection engine.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 6. Confirmation & Cancel Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !parseResult.success ||
                isInsufficient ||
                isSelfTransfer ||
                senderCurrentMinor === 0 ||
                !rateInfo ||
                rateLoading
              }
              className="px-6 py-2.5 rounded-xl bg-[#121316] text-[#faf8f5] text-xs font-bold hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Executing Atomic Transfer...</span>
                </>
              ) : (
                <>
                  <span>Confirm &amp; Transfer</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
