import React from 'react';
import { X, BookOpen, CheckCircle } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: '1',
      title: 'Bind Payment Wallet',
      desc: 'Go to "Tool" and click "Add" to bind your Paytm, Freecharge, or MoneyView wallet.',
    },
    {
      num: '2',
      title: 'Activate Selling or Claim Orders',
      desc: 'In the "Payment" tab, browse available orders and click "Claim". In "Statistics", turn on "Start Selling".',
    },
    {
      num: '3',
      title: 'Receive Instant Cashback (4.2%)',
      desc: 'Every matched transaction pays you a 4.2% commission directly to your balance.',
    },
    {
      num: '4',
      title: 'Instant Withdrawal',
      desc: 'Withdraw your earnings anytime to your bound wallet using your 6-digit transaction PIN.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm max-h-[80vh] bg-white rounded-3xl p-6 shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-3">
          <BookOpen className="w-6 h-6 text-[#0FA968]" />
          <h2 className="text-lg font-bold text-gray-900">Beginner Tutorial</h2>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Master the OK PAY platform in 4 quick steps:
        </p>

        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {steps.map((st) => (
            <div
              key={st.num}
              className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start space-x-3"
            >
              <div className="w-7 h-7 rounded-full bg-[#0FA968] text-white flex items-center justify-center font-black text-xs shrink-0">
                {st.num}
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">{st.title}</h4>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-3 bg-[#0FA968] text-white font-bold rounded-full shadow-md text-xs cursor-pointer"
        >
          Got It, Start Earning!
        </button>
      </div>
    </div>
  );
};
