import React, { useState } from 'react';
import {
  X,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { ClaimOrder, User } from '../../types';
import { sounds } from '../../utils/audio';

interface ActiveOrderPopupModalProps {
  isOpen: boolean;
  order: ClaimOrder | null;
  user: User;
  onClose: () => void;
  onOpenOrderDetail: (order: ClaimOrder) => void;
  onCancelOrder: (order: ClaimOrder) => void;
}

export const ActiveOrderPopupModal: React.FC<ActiveOrderPopupModalProps> = ({
  isOpen,
  order,
  user,
  onClose,
  onOpenOrderDetail,
  onCancelOrder,
}) => {
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  if (!isOpen || !order) return null;

  const isUtrSubmitted = Boolean(order.utr || order.status === 'processing');

  const handleConfirmCancel = () => {
    sounds.playTap();
    setIsConfirmingCancel(false);
    onCancelOrder(order);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative border border-emerald-100 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            setIsConfirmingCancel(false);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
          title="Close Popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge */}
        <div className="text-center pt-1 pb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0FA968] to-emerald-400 text-white flex items-center justify-center mx-auto mb-2.5 shadow-[0_8px_20px_rgba(15,169,104,0.3)]">
            {isUtrSubmitted ? (
              <Clock className="w-7 h-7 stroke-[2.2] animate-pulse" />
            ) : (
              <Sparkles className="w-7 h-7 stroke-[2.2]" />
            )}
          </div>
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
            {isUtrSubmitted ? 'Pending Payment Order' : 'Active Payment Order'}
          </h2>
          <div className="flex items-center justify-center space-x-1.5 mt-1">
            <span className="text-[11px] text-gray-500 font-medium">
              Saved in User ID:
            </span>
            <span className="text-[11px] font-mono font-bold text-[#0FA968] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {user?.id || 'User'}
            </span>
          </div>
        </div>

        {/* Highlight Card */}
        <div className="bg-gradient-to-br from-gray-50 to-[#F4F8F8] border border-gray-200/80 rounded-2xl p-4 my-2 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200/70">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block tracking-wider">
                Order ID
              </span>
              <span className="text-xs font-mono font-extrabold text-gray-800">
                {order?.id || 'ORD-ACTIVE'}
              </span>
            </div>
            <div className="text-right">
              <span className="bg-[#111827] text-[#FFC727] text-[10px] font-black px-2 py-0.5 rounded">
                FamPay QR
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center py-1">
            <div className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-2xs">
              <span className="text-[11px] text-gray-400 block font-medium">Order Amount</span>
              <span className="text-base font-black text-gray-900 mt-0.5 block">
                ₹{(order?.amount ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-emerald-50/70 rounded-xl p-2.5 border border-emerald-100 shadow-2xs">
              <span className="text-[11px] text-emerald-700 block font-bold">Cashback Rebate</span>
              <span className="text-base font-black text-[#0FA968] mt-0.5 block">
                +₹{order?.income ?? 0}
              </span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl p-2 text-center text-xs">
            <span className="text-[11px] text-emerald-800 font-medium">Total Return on Approval: </span>
            <strong className="text-emerald-700 font-black">₹{((order?.amount ?? 0) + (order?.income ?? 0)).toFixed(2)}</strong>
            <span className="text-[10px] text-gray-500 block">(₹{order?.amount ?? 0} Refund + ₹{order?.income ?? 0} Cashback)</span>
          </div>

          {/* Status notification */}
          <div className="bg-white/90 rounded-xl p-2.5 border border-gray-100 text-xs flex items-start space-x-2">
            {isUtrSubmitted ? (
              <>
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-800 block">
                    UTR Submitted: {order?.utr || 'Under Review'}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Awaiting admin confirmation to credit cashback.
                  </span>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-800 block">
                    Payment in Progress
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Pay ₹{order?.amount ?? 0} on FamPay QR and submit your 12-digit UTR.
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Confirmation prompt if user clicked cancel */}
        {isConfirmingCancel ? (
          <div className="mt-3 p-3.5 bg-red-50 border border-red-200 rounded-2xl animate-in fade-in space-y-2.5">
            <div className="flex items-center space-x-2 text-red-700 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Cancel this order? (ऑर्डर रद्द करें?)</span>
            </div>
            <p className="text-[11px] text-red-600 leading-relaxed">
              This order will be released so you can choose a different order from the list.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsConfirmingCancel(false)}
                className="py-2 px-3 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                No, Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="py-2 px-3 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 cursor-pointer shadow-sm"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        ) : (
          /* Main Action Buttons */
          <div className="mt-4 space-y-2.5">
            {/* Primary Button: Open Order Detail / Submit UTR */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onOpenOrderDetail(order);
              }}
              className="w-full py-3.5 px-4 bg-[#0FA968] hover:bg-[#0c8e57] active:scale-[0.98] text-white font-bold rounded-full text-xs tracking-wide shadow-[0_6px_20px_rgba(15,169,104,0.3)] flex items-center justify-center space-x-2 cursor-pointer transition-all"
            >
              <span>
                {isUtrSubmitted
                  ? 'View Order & Status (ऑर्डर स्टेटस देखें)'
                  : 'Submit UTR / Complete Payment (पेमेंट / UTR दर्ज करें)'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Cancel Button: User can cancel and choose another order */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setIsConfirmingCancel(true);
              }}
              className="w-full py-2.5 px-4 bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200 font-bold rounded-full text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Cancel Order &amp; Pick Another (ऑर्डर कैंसिल करें)</span>
            </button>
          </div>
        )}

        <div className="mt-3 text-center">
          <span className="text-[10px] text-gray-400">
            Device Storage Protected • Instant Auto-Save
          </span>
        </div>
      </div>
    </div>
  );
};
