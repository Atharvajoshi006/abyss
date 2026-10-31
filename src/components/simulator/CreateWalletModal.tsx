import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { createWallet } from '../../services/walletService';
import type { Wallet } from '../../types/wallet';

interface CreateWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletCreated: (wallet: Wallet) => void;
}

export const CreateWalletModal: React.FC<CreateWalletModalProps> = ({
  isOpen,
  onClose,
  onWalletCreated,
}) => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('Please provide a username.');
      return;
    }

    setLoading(true);
    try {
      const wallet = await createWallet({
        username: trimmedUsername,
        displayName: displayName.trim() || undefined,
      });

      setSuccess(`Wallet for @${wallet.username} created successfully!`);
      setTimeout(() => {
        onWalletCreated(wallet);
        setUsername('');
        setDisplayName('');
        setSuccess(null);
        onClose();
      }, 700);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create wallet. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#faf8f5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#121316] text-amber-400 flex items-center justify-center shadow-xs">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#121316]">Create New Wallet</h2>
              <p className="text-xs text-stone-500 font-mono">Case-insensitive unique username</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Username <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 font-mono text-sm pointer-events-none">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="alice"
                autoFocus
                disabled={loading}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-stone-900 transition-all font-mono"
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Must be 2-30 characters (letters, numbers, dots, dashes).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Display Name <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alice Johnson"
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-stone-900 transition-all"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#121316] text-[#faf8f5] text-sm font-semibold hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Create Wallet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
