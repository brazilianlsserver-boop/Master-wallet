import React, { useEffect } from 'react';
import { CheckCircle2, Sparkles, ArrowRight, Wallet, ShieldCheck, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClaimOrder } from '../../types';

interface OrderApprovalSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ClaimOrder | null;
  userBalance: number;
  onViewWallet?: () => void;
}

export const OrderApprovalSuccessModal: React.FC<OrderApprovalSuccessModalProps> = ({
  isOpen,
  onClose,
  order,
  userBalance,
  onViewWallet,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Trigger celebratory confetti and chime upon opening
  useEffect(() => {
    if (isOpen && order) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0FA968', '#10B981', '#34D399', '#FBBF24', '#60A5FA'],
        });
      } catch (err) {
        console.log('Confetti effect ignored:', err);
      }

      // Play melodic success chime via Web Audio API
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
            gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.12);
            osc.stop(ctx.currentTime + idx * 0.12 + 0.35);
          });
        }
      } catch {
        // audio optional
      }
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const totalCredit = (order.amount || 0) + (order.income || 0);

  const handleCopyUtr = () => {
    if (order.utr) {
      navigator.clipboard.writeText(order.utr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 animate-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-br from-[#0FA968] via-emerald-600 to-teal-700 text-white p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white/10 blur-lg pointer-events-none" />

          {/* Icon Badge */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-white text-[#0FA968] flex items-center justify-center shadow-xl mb-3 animate-bounce">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-amber-900 flex items-center justify-center text-[10px] font-black shadow-sm">
              <Sparkles className="w-3 h-3 fill-amber-900" />
            </div>
          </div>

          <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs mb-1.5 border border-white/25">
            Admin Approved &amp; Settled
          </span>

          <h3 className="text-xl font-extrabold tracking-tight">Order Approved!</h3>
          <p className="text-xs text-emerald-100 font-medium mt-1">
            Admin Sagar Master verified your UTR and confirmed your claim!
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Main Total Credit Pill */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 p-4 rounded-2xl border border-emerald-200/90 text-center shadow-xs">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
              Credited to Your OK PAY Balance
            </span>
            <div className="text-3xl font-black text-[#0FA968] mt-0.5 tracking-tight flex items-center justify-center space-x-1">
              <span>+₹{totalCredit.toFixed(2)}</span>
            </div>
            <div className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full mt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0FA968]" />
              <span>Full Return + Cashback Added</span>
            </div>
          </div>

          {/* Order Settlement Details Card */}
          <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Order Number:</span>
              <span className="font-mono font-bold text-gray-800">{order.id}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Original Order:</span>
              <span className="font-semibold text-gray-700">₹{order.amount.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Cashback Rebate:</span>
              <span className="font-bold text-[#0FA968]">+₹{order.income.toFixed(2)}</span>
            </div>

            {order.utr && (
              <div className="flex items-center justify-between pt-1 border-t border-gray-200/80">
                <span className="text-gray-500 font-medium">Verified UTR:</span>
                <button
                  type="button"
                  onClick={handleCopyUtr}
                  className="flex items-center space-x-1 font-mono font-semibold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 hover:border-emerald-400"
                >
                  <span>{order.utr}</span>
                  {copied ? (
                    <Check className="w-3 h-3 text-[#0FA968]" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-400" />
                  )}
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-gray-200/80">
              <span className="text-gray-600 font-bold">New Total Balance:</span>
              <span className="font-extrabold text-sm text-gray-900">
                ₹{userBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onViewWallet) onViewWallet();
              }}
              className="w-full py-3.5 px-4 bg-[#0FA968] hover:bg-[#0c8e57] active:scale-[0.98] text-white font-bold rounded-2xl shadow-[0_4px_16px_rgba(15,169,104,0.35)] transition-all flex items-center justify-center space-x-2 cursor-pointer text-sm"
            >
              <Wallet className="w-4 h-4" />
              <span>Great! View Wallet Balance</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-center text-xs text-gray-500 hover:text-gray-800 font-semibold cursor-pointer"
            >
              Close &amp; Continue Earning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
