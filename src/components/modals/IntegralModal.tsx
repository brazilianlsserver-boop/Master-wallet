import React from 'react';
import { X, Coins, Gift } from 'lucide-react';

interface IntegralModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
  onRedeem: (pointsUsed: number, cashReward: number) => void;
}

export const IntegralModal: React.FC<IntegralModalProps> = ({
  isOpen,
  onClose,
  points,
  onRedeem,
}) => {
  if (!isOpen) return null;

  const rewards = [
    { points: 500, cash: 50 },
    { points: 1000, cash: 120 },
    { points: 2500, cash: 320 },
    { points: 5000, cash: 700 },
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

        <div className="flex items-center space-x-2 mb-3">
          <Coins className="w-6 h-6 text-amber-500" />
          <h2 className="text-lg font-bold text-gray-900">Integral Points Center</h2>
        </div>

        {/* Current points card */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 text-white text-center mb-4 shadow-sm">
          <span className="text-xs text-amber-100 font-medium">Available Integral</span>
          <div className="text-3xl font-black mt-0.5">{points} pts</div>
          <p className="text-[10px] text-amber-100/90 mt-1">Earn 10 points for every claim</p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="text-xs font-bold text-gray-700">Redeem for Cash Balance</div>
          {rewards.map((r) => (
            <div
              key={r.points}
              className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-gray-800">
                  {r.points} pts → ₹{r.cash}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRedeem(r.points, r.cash)}
                disabled={points < r.points}
                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                  points >= r.points
                    ? 'bg-[#0FA968] text-white hover:bg-[#0c8e57]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Exchange
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
