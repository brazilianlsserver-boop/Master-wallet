import React from 'react';
import { Gift, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WelcomeBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  bonusAmount: number;
}

export const WelcomeBonusModal: React.FC<WelcomeBonusModalProps> = ({
  isOpen,
  onClose,
  bonusAmount = 30,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 },
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl relative text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Animated Gift Icon */}
        <div className="relative mx-auto w-20 h-20 mb-3">
          <div className="absolute inset-0 bg-amber-400/20 rounded-full animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-lg">
            <Gift className="w-10 h-10 text-white stroke-[2.2]" />
          </div>
        </div>

        <div className="flex items-center justify-center space-x-1 text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New User Reward</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        <h3 className="text-xl font-black text-gray-900 tracking-tight">
          Welcome to OK PAY!
        </h3>

        <div className="my-3 py-3 px-4 bg-emerald-50 rounded-2xl border border-emerald-200">
          <span className="text-xs text-emerald-800 font-semibold block">
            Login Gift Credited
          </span>
          <div className="text-3xl font-black text-[#0FA968] tracking-tight mt-0.5">
            +₹{bonusAmount}
          </div>
          <span className="text-[11px] text-emerald-700/80 font-medium">
            Added to your Available Balance
          </span>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed mb-4">
          Start claiming orders in the Payment tab and earn 4.2% cashback on every transaction!
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-[#0FA968] hover:bg-[#0c8e57] text-white font-bold rounded-full shadow-[0_6px_20px_rgba(15,169,104,0.35)] active:scale-95 transition-all cursor-pointer text-sm flex items-center justify-center space-x-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Claim & Start Earning</span>
        </button>
      </div>
    </div>
  );
};
