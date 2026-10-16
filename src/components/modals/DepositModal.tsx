import React, { useState } from 'react';
import { X, Check, ArrowUp, QrCode } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { FamPayQrCode } from '../FamPayQrCode';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: (amount: number, channel: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDepositSuccess,
}) => {
  const [amount, setAmount] = useState<number>(500);
  const [channel, setChannel] = useState<'FamPay QR' | 'Paytm' | 'Freecharge' | 'UPI' | 'USDT'>('FamPay QR');
  const [showQrExpanded, setShowQrExpanded] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const presets = [100, 300, 500, 1000, 2000, 5000, 10000];

  const handleDeposit = () => {
    if (amount <= 0) return;
    sounds.playTap();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      sounds.playCoinChime();
      setTimeout(() => {
        onDepositSuccess(amount, channel);
        setDone(false);
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0FA968] flex items-center justify-center">
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Top-up Deposit</h2>
        </div>

        {done ? (
          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#0FA968] flex items-center justify-center mx-auto mb-3">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-base font-bold text-gray-800">Deposit Successful!</h3>
            <p className="text-xs text-gray-500 mt-1">₹{amount} has been added to your account via {channel}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Amount input */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Top-up Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-base font-bold text-gray-500">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={10}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-lg font-extrabold text-gray-800 focus:border-[#0FA968] focus:outline-none"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2">
              {presets.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    amount === val
                      ? 'bg-[#0FA968] text-white border-[#0FA968]'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>

            {/* Channels */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Payment Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['FamPay QR', 'Paytm', 'Freecharge', 'UPI', 'USDT'] as const).map((ch) => (
                  <button
                    type="button"
                    key={ch}
                    onClick={() => {
                      setChannel(ch);
                      if (ch === 'FamPay QR') setShowQrExpanded(true);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                      channel === ch
                        ? ch === 'FamPay QR'
                          ? 'border-[#111827] bg-[#111827] text-[#FFC727]'
                          : 'border-[#0FA968] bg-emerald-50 text-[#0FA968]'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {ch === 'FamPay QR' && (
                      <span className="w-3.5 h-3.5 rounded bg-[#FFC727] text-[#111827] flex items-center justify-center text-[8px] font-black">
                        f
                      </span>
                    )}
                    <span>{ch}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FamPay QR Code Display */}
            {channel === 'FamPay QR' ? (
              <div className="pt-1">
                <FamPayQrCode
                  amount={amount}
                  upiId="sagarmaster@fam"
                  payeeName="Sagar Master"
                  orderNo={`DEP-${Date.now().toString().slice(-6)}`}
                  compact={true}
                />
              </div>
            ) : (
              /* Option to scan FamPay QR for instant verification */
              <div
                onClick={() => {
                  setChannel('FamPay QR');
                  setShowQrExpanded(true);
                }}
                className="p-3 bg-[#111827] text-white rounded-2xl flex items-center justify-between border border-gray-900 cursor-pointer hover:bg-black transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FFC727] text-[#111827] flex items-center justify-center font-black text-xs">
                    fam
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-[#FFC727]">
                      FamPay QR Instant Gateway
                    </div>
                    <div className="text-[10px] text-gray-300">
                      Scan with FamPay, GPay, PhonePe
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-[#FFC727] text-[#111827] font-black px-2 py-0.5 rounded-full">
                  Scan QR
                </span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="button"
              disabled={submitting}
              onClick={handleDeposit}
              className="w-full py-3.5 bg-[#0FA968] hover:bg-[#0c8e57] text-white font-bold rounded-full shadow-md active:scale-95 transition-all cursor-pointer text-sm"
            >
              {submitting ? 'Verifying Gateway...' : `Proceed to Pay ₹${amount}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
