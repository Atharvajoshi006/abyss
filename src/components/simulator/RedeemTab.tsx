import React, { useState } from 'react';
import {
  ArrowUpRight,
  Coins,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  UserPlus,
  MinusCircle,
} from 'lucide-react';
import type { Wallet, Balance, SupportedCurrency } from '../../types/wallet';
import type { Transaction } from '../../types/transaction';
import {
  SUPPORTED_CURRENCIES,
  CURRENCY_CONFIGS,
  parseAmountToMinor,
  formatMinorUnits,
  minorToDecimalString,
} from '../../utils/currency';
import { redeemCredits } from '../../services/creditService';

interface RedeemTabProps {
  wallets: Wallet[];
  balances: Balance[];
  preselectedWalletId?: string;
  onOpenCreateWallet: () => void;
  onTransactionSuccess: (tx: Transaction) => void;
}

export const RedeemTab: React.FC<RedeemTabProps> = ({
  wallets,
  balances,
  preselectedWalletId,
  onOpenCreateWallet,
  onTransactionSuccess,
}) => {
  const [overrideWalletId, setOverrideWalletId] = useState<string | null>(null);
  const selectedWalletId = overrideWalletId ?? preselectedWalletId ?? (wallets.length > 0 ? wallets[0].id : '');
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [amountStr, setAmountStr] = useState<string>('1000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<Transaction | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => `idem_${crypto.randomUUID()}`);

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
  const currentBalanceRecord = balances.find(
    (b) => b.walletId === selectedWalletId && b.currency === currency
  );
  const currentMinor = currentBalanceRecord ? currentBalanceRecord.amountMinor : 0;

  // Real-time parse
  const parseResult = parseAmountToMinor(amountStr, currency);
  const isInsufficient =
    parseResult.success &&
    parseResult.amountMinor !== undefined &&
    parseResult.amountMinor > currentMinor;

  const previewRemainingMinor =
    parseResult.success && parseResult.amountMinor !== undefined && !isInsufficient
      ? currentMinor - parseResult.amountMinor
      : null;

  const currencyConfig = CURRENCY_CONFIGS[currency];

  const handlePercentageClick = (percent: number) => {
    if (currentMinor <= 0) return;
    const targetMinor = Math.floor((currentMinor * percent) / 100);
    const decimal = minorToDecimalString(targetMinor, currency);
    setAmountStr(decimal);
    setIdempotencyKey(`idem_${crypto.randomUUID()}`);
    setError(null);
  };

  const handleCurrencyChange = (newCurr: SupportedCurrency) => {
    setCurrency(newCurr);
    setIdempotencyKey(`idem_${crypto.randomUUID()}`);
    setError(null);
    if (CURRENCY_CONFIGS[newCurr].fractionDigits === 0 && amountStr.includes('.')) {
      setAmountStr(amountStr.split('.')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLastTx(null);

    if (!selectedWalletId) {
      setError('Please select or create a wallet first.');
      return;
    }

    const validation = parseAmountToMinor(amountStr, currency);
    if (!validation.success || validation.amountMinor === undefined) {
      setError(validation.error || 'Please enter a valid amount.');
      return;
    }

    if (validation.amountMinor > currentMinor) {
      setError(
        `Insufficient funds: Available balance is ${formatMinorUnits(
          currentMinor,
          currency
        )}, attempted to redeem ${formatMinorUnits(validation.amountMinor, currency)}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Use stable operation idempotency key to prevent double submissions
      const tx = await redeemCredits({
        walletId: selectedWalletId,
        currency,
        amountMinor: validation.amountMinor,
        idempotencyKey,
      });

      setLastTx(tx);
      // Rotate idempotency key for subsequent operations
      setIdempotencyKey(`idem_${crypto.randomUUID()}`);
      onTransactionSuccess(tx);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Redemption failed during database commit.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (wallets.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-dashed border-stone-200 rounded-2xl max-w-xl mx-auto my-8">
        <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center mx-auto mb-3">
          <Coins className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900">Wallet Required</h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-5">
          You must create a client wallet before redeeming credits.
        </p>
        <button
          onClick={onOpenCreateWallet}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#121316] text-[#faf8f5] text-xs font-semibold hover:bg-stone-800 shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4 text-amber-300" />
          <span>Create Wallet</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Success Notification */}
      {lastTx && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-emerald-900">Credits Redeemed Successfully!</h4>
            <div className="mt-1 space-y-0.5 text-xs text-emerald-800 font-mono">
              <p>
                Debited: <span className="font-bold">{formatMinorUnits(lastTx.amountMinor, lastTx.currency)}</span> from @{selectedWallet?.username}
              </p>
              <p>
                Remaining Balance: <span className="font-bold">{formatMinorUnits(lastTx.balanceAfterMinor, lastTx.currency)}</span>
              </p>
              <p className="text-[10px] text-emerald-700 truncate">
                TxID: {lastTx.id} • Atomic rollback protection verified
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Redemption Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#121316]">Redeem Time Credits</h2>
              <p className="text-xs text-stone-500 font-mono">
                Atomic debit with negative balance prevention
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strict Invariant Guard</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Wallet Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Select Wallet <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedWalletId}
              onChange={(e) => setOverrideWalletId(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  @{w.username} {w.displayName ? `(${w.displayName})` : ''} — {w.id.slice(0, 12)}...
                </option>
              ))}
            </select>
          </div>

          {/* 2. Currency Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Select Currency <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {SUPPORTED_CURRENCIES.map((curr) => {
                const conf = CURRENCY_CONFIGS[curr];
                const isSelected = curr === currency;

                return (
                  <button
                    type="button"
                    key={curr}
                    onClick={() => handleCurrencyChange(curr)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-[#121316] text-[#faf8f5] border-[#121316] shadow-2xs'
                        : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className="text-base">{conf.flag}</div>
                    <div className="font-mono font-bold text-xs mt-0.5">{curr}</div>
                    <div
                      className={`text-[9px] ${
                        isSelected ? 'text-stone-300' : 'text-stone-400'
                      }`}
                    >
                      {conf.symbol}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Available Balance Notice */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono transition-colors ${
              currentMinor > 0
                ? 'bg-amber-50/50 border-amber-200 text-stone-900'
                : 'bg-stone-50 border-stone-200 text-stone-500'
            }`}
          >
            <div>
              <span className="text-stone-500 block text-[11px]">Available to Redeem:</span>
              <span className="font-bold text-base text-stone-900">
                {formatMinorUnits(currentMinor, currency)}
              </span>
            </div>
            {currentMinor === 0 && (
              <span className="text-[11px] text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md font-sans">
                Zero balance in this currency
              </span>
            )}
          </div>

          {/* 3. Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Redemption Amount <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-stone-400 font-mono">
                {currencyConfig.fractionDigits === 0
                  ? 'Precision: Whole numbers only'
                  : `Precision: Max ${currencyConfig.fractionDigits} decimals`}
              </span>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-500 font-mono text-base font-bold pointer-events-none">
                {currencyConfig.symbol}
              </span>
              <input
                type="text"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setError(null);
                }}
                placeholder={currencyConfig.fractionDigits === 0 ? '1000' : '1000.00'}
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
              <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Amount exceeds available balance of {formatMinorUnits(currentMinor, currency)}.</span>
              </p>
            )}

            {/* Quick Percentage Presets */}
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-[10px] text-stone-400 uppercase font-mono">Quick:</span>
              {[25, 50, 75, 100].map((pct) => (
                <button
                  type="button"
                  key={pct}
                  onClick={() => handlePercentageClick(pct)}
                  disabled={currentMinor <= 0}
                  className="px-2.5 py-0.5 text-[11px] font-mono font-semibold rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {pct === 100 ? 'All (100%)' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Calculated Preview */}
          {previewRemainingMinor !== null && (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono space-y-1">
              <div className="flex items-center justify-between text-stone-600">
                <span>Deduction:</span>
                <span className="text-rose-700 font-bold">
                  -{formatMinorUnits(parseResult.amountMinor!, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-900 font-bold pt-1 border-t border-stone-200">
                <span>Remaining Balance:</span>
                <span>{formatMinorUnits(previewRemainingMinor, currency)}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !parseResult.success ||
              isInsufficient ||
              currentMinor === 0
            }
            className="w-full py-3.5 px-4 rounded-xl bg-[#121316] text-[#faf8f5] text-sm font-bold hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>Processing Atomic Redemption...</span>
              </>
            ) : (
              <>
                <MinusCircle className="w-4 h-4 text-amber-300" />
                <span>Redeem {amountStr ? `${amountStr} ${currency}` : 'Credits'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
