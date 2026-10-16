import React from 'react';
import { X, Clock, Sparkles, Shield, ArrowRightLeft, Bell } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface UsdtModalProps {
  isOpen: boolean;
  onClose: () => void;
  rate: number;
}

export const UsdtModal: React.FC<UsdtModalProps> = ({ isOpen, onClose, rate }) => {
  if (!isOpen) return null;

  const handleClose = () => {
    sounds.playTap();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 border border-emerald-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Coming Soon Header */}
        <div className="flex flex-col items-center text-center pt-2 pb-1">
          {/* Glowing Icon Container */}
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 via-[#0FA968] to-teal-400 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(15,169,104,0.35)]">
              <span className="font-black text-2xl">₮</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-md animate-bounce">
              <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          {/* Prominent Coming Soon Pill */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-extrabold text-amber-700 uppercase tracking-wider mb-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Coming Soon</span>
          </div>

          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Coming Soon
          </h2>
          <p className="text-xs font-bold text-[#0FA968] mt-1">
            USDT Service is Coming Soon
          </p>
          <p className="text-xs text-gray-500 font-medium mt-1.5 px-2 leading-relaxed">
            The USDT TRC-20 / BEP-20 cryptocurrency deposit, withdrawal, and exchange interface is currently under active development and will be available in the upcoming update.
          </p>
        </div>

        {/* Feature Preview Card */}
        <div className="bg-[#F4FBF7] p-4 rounded-2xl border border-emerald-100/90 my-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 flex items-center space-x-1">
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#0FA968]" />
              <span>Real-Time Pegged Rate</span>
            </span>
            <span className="text-sm font-black text-[#0FA968]">
              1 USDT = ₹{rate} INR
            </span>
          </div>

          <div className="border-t border-emerald-100/80 pt-2 space-y-1.5 text-[11px] text-gray-600">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Instant Automated Liquidity Pools</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Zero Slippage Guaranteed Payouts</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bell className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Unlocking in the Next Version Release</span>
            </div>
          </div>
        </div>

        {/* Notice Info Box */}
        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 mb-5 text-center">
          <p className="text-[11px] text-gray-500 leading-normal">
            Please continue using our instant <strong className="text-gray-800">Bank IMPS / FamPay QR &amp; Wallets</strong> for seamless order claims and withdrawals.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleClose}
          className="w-full py-3.5 bg-[#0FA968] hover:bg-[#0c8e57] text-white font-bold rounded-full shadow-[0_6px_20px_rgba(15,169,104,0.3)] text-xs cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center space-x-1.5"
        >
          <span>Got It (Coming Soon)</span>
        </button>
      </div>
    </div>
  );
};
