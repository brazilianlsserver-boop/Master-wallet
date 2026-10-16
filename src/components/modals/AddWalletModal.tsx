import React, { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { Wallet } from '../../types';
import { sounds } from '../../utils/audio';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWallet: (wallet: Omit<Wallet, 'id' | 'createdAt'>) => void;
}

export const AddWalletModal: React.FC<AddWalletModalProps> = ({
  isOpen,
  onClose,
  onAddWallet,
}) => {
  const [walletType, setWalletType] = useState<Wallet['type']>('Paytm');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDemoFill = () => {
    sounds.playTap();
    setAccountName('Rahul Sharma');
    if (walletType === 'FamPay') {
      setAccountNumber('rahul.okpay@fam');
    } else if (walletType === 'Paytm' || walletType === 'Freecharge' || walletType === 'MoneyView') {
      setAccountNumber('9876543210');
    } else if (walletType === 'UPI') {
      setAccountNumber('rahul@paytm');
    } else if (walletType === 'USDT-TRC20') {
      setAccountNumber('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t');
    } else {
      setAccountNumber('918237461928');
      setIfsc('PYTM0123456');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) {
      setError('Please enter Account Holder Name');
      return;
    }
    if (!accountNumber.trim()) {
      setError('Please enter Account / Wallet Number');
      return;
    }
    setError('');
    sounds.playSuccess();
    onAddWallet({
      type: walletType,
      accountName,
      accountNumber,
      ifsc: walletType === 'Bank Card' ? ifsc : undefined,
      isDefault,
    });
    onClose();
  };

  const walletOptions: Array<Wallet['type']> = [
    'FamPay',
    'Paytm',
    'Freecharge',
    'MoneyView',
    'UPI',
    'USDT-TRC20',
    'Bank Card',
  ];

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

        <h2 className="text-lg font-bold text-gray-900 mb-1">Add Wallet</h2>
        <p className="text-xs text-emerald-700 font-medium mb-4">
          Recommended: Freecharge, Paytm, or MoneyView
        </p>

        {error && (
          <div className="p-2.5 mb-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Wallet Type selection */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Wallet Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {walletOptions.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setWalletType(type)}
                  className={`py-2 px-1 text-xs rounded-xl font-semibold border transition-all cursor-pointer truncate ${
                    walletType === type
                      ? 'bg-[#0FA968] text-white border-[#0FA968] shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Account Name / Holder
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#0FA968] focus:outline-none"
            />
          </div>

          {/* Account / Phone / VPA */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              {walletType === 'USDT-TRC20'
                ? 'TRC20 Wallet Address'
                : walletType === 'UPI'
                ? 'UPI VPA (e.g. name@paytm)'
                : 'Phone / Account Number'}
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder={
                walletType === 'USDT-TRC20'
                  ? 'T...'
                  : walletType === 'UPI'
                  ? 'name@upi'
                  : 'Enter 10-digit number'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#0FA968] focus:outline-none"
            />
          </div>

          {walletType === 'Bank Card' && (
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                IFSC Code
              </label>
              <input
                type="text"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                placeholder="e.g. SBIN0001234"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm uppercase focus:border-[#0FA968] focus:outline-none"
              />
            </div>
          )}

          {/* Set as Default & Quick Demo */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded accent-[#0FA968] cursor-pointer"
              />
              <span className="text-xs text-gray-600 font-medium">Default</span>
            </label>

            <button
              type="button"
              onClick={handleDemoFill}
              className="text-[11px] font-bold text-[#0FA968] bg-emerald-50 px-2.5 py-1 rounded-full hover:bg-emerald-100 flex items-center space-x-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Auto-Fill Demo</span>
            </button>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-[#0FA968] hover:bg-[#0c8e57] text-white font-bold rounded-full shadow-md active:scale-95 transition-all cursor-pointer text-sm"
            >
              Confirm & Bind
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
