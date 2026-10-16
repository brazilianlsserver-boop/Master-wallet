import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
          <ShieldCheck className="w-6 h-6 text-[#0FA968]" />
          <h2 className="text-base font-bold text-gray-900">User Privacy Agreement</h2>
        </div>

        <div className="flex-1 overflow-y-auto text-xs text-gray-600 space-y-3 pr-1 leading-relaxed">
          <p className="font-semibold text-gray-800">Welcome to OK PAY!</p>
          <p>
            We take user privacy and payment security very seriously. This agreement outlines how your personal information, wallet tokens, and earning metrics are processed.
          </p>
          <h4 className="font-bold text-gray-800 pt-1">1. Information Collection</h4>
          <p>
            We only collect basic mobile authentication credentials and encrypted wallet identifiers necessary for matching payment orders and executing cashback disbursements.
          </p>
          <h4 className="font-bold text-gray-800 pt-1">2. Transaction Safety</h4>
          <p>
            All wallet transactions on Freecharge, Paytm, MoneyView, UPI, and TRC20 are shielded by client-side security PIN authorization.
          </p>
          <h4 className="font-bold text-gray-800 pt-1">3. Earning & Commission Rules</h4>
          <p>
            Commission earnings (4.20%) are computed instantly based on matched payment orders and verified settlement cycles.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-3 bg-[#0FA968] hover:bg-[#0c8e57] text-white font-bold rounded-full shadow-md text-xs cursor-pointer"
        >
          I Understand & Agree
        </button>
      </div>
    </div>
  );
};
