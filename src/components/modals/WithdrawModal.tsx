import React, { useState } from 'react';
import { X, Check, ArrowDown, Shield } from 'lucide-react';
import { Wallet } from '../../types';
import { sounds } from '../../utils/audio';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  wallets: Wallet[];
  userPin: string;
  onWithdrawSuccess: (amount: number, wallet: Wallet) => void;
  onOpenAddWallet: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  balance,
  wallets,
  userPin,
  onWithdrawSuccess,
  onOpenAddWallet,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    wallets[0]?.id || ''
  );
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  React.useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets, selectedWalletId]);

  if (!isOpen) return null;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) {
      setError('Please enter a valid withdrawal amount');
      return;
    }
    if (num > balance) {
      setError(`Insufficient balance. Current balance: ₹${balance.toFixed(2)}`);
      return;
    }
    if (wallets.length === 0) {
      setError('Please add a payment wallet first');
      return;
    }
    if (!enteredPin || (userPin && enteredPin !== userPin)) {
      setError('Incorrect transaction PIN (Default PIN: 123456)');
      return;
    }

    setError('');
    sounds.playTap();
    setSubmitting(true);
    const chosenWallet = wallets.find((w) => w.id === selectedWalletId) || wallets[0];

    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      sounds.playSuccess();
      setTimeout(() => {
        onWithdrawSuccess(num, chosenWallet);
        setDone(false);
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
            <ArrowDown className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Withdraw Funds</h2>
        </div>

        {done ? (
          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#0FA968] flex items-center justify-center mx-auto mb-3">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-base font-bold text-gray-800">Withdrawal Submitted!</h3>
            <p className="text-xs text-gray-500 mt-1">
              ₹{amount} is being processed to your selected wallet.
            </p>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-3.5">
            {error && (
              <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">
                {error}
              </div>
            )}

            {/* Wallet Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-600">
                  Select Bound Wallet
                </label>
                <button
                  type="button"
                  onClick={onOpenAddWallet}
                  className="text-xs text-[#0FA968] font-bold hover:underline cursor-pointer"
                >
                  + Add New
                </button>
              </div>

              {wallets.length === 0 ? (
                <div
                  onClick={onOpenAddWallet}
                  className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-700 font-medium cursor-pointer"
                >
                  No wallet bound yet. Tap here to bind a wallet.
                </div>
              ) : (
                <select
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:border-[#0FA968] focus:outline-none bg-white font-medium"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.type} - {w.accountNumber} ({w.accountName})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-600">
                  Withdrawal Amount (₹)
                </label>
                <span className="text-[11px] text-gray-400">
                  Available: <b className="text-gray-800">₹{balance.toFixed(2)}</b>
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-base font-bold text-gray-500">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-16 py-2.5 rounded-xl border border-gray-200 text-base font-bold text-gray-800 focus:border-[#0FA968] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setAmount(balance.toString())}
                  className="absolute right-3 top-3 text-[11px] font-bold text-[#0FA968] cursor-pointer"
                >
                  All
                </button>
              </div>
            </div>

            {/* Transaction PIN */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-gray-400" />
                <span>Security PIN (Default: 123456)</span>
              </label>
              <input
                type="password"
                maxLength={6}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="Enter 6-digit PIN"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm tracking-widest text-center focus:border-[#0FA968] focus:outline-none font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#0FA968] hover:bg-[#0c8e57] text-white font-bold rounded-full shadow-md active:scale-95 transition-all cursor-pointer text-sm"
            >
              {submitting ? 'Processing Withdrawal...' : 'Confirm Withdrawal'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
