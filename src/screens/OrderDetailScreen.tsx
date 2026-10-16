import React, { useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  FileText,
  X,
  Sparkles,
  ArrowRight,
  Hash,
  ReceiptText,
  ClipboardPaste,
  AlertCircle,
  Clock,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClaimOrder, Wallet } from '../types';
import { sounds } from '../utils/audio';
import { FamPayQrCode } from '../components/FamPayQrCode';

interface OrderDetailScreenProps {
  order: ClaimOrder;
  wallets: Wallet[];
  onBack: () => void;
  onConfirmPayment: (order: ClaimOrder) => void;
  onOpenAddWallet?: () => void;
  onCancelOrder?: (order: ClaimOrder) => void;
}

export const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({
  order,
  wallets,
  onBack,
  onConfirmPayment,
  onOpenAddWallet,
  onCancelOrder,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [isChangingWallet, setIsChangingWallet] = useState(false);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string>(
    order.payoutWallet || 'Mobikwik'
  );
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'Pending' | 'PendingApproval' | 'Completed'>(() => {
    if (order.status === 'completed') return 'Completed';
    if (order.utr && order.utr.trim().length > 0) return 'PendingApproval';
    return 'Pending';
  });

  // Keep in sync with order prop updates (e.g. When Admin approves or when user claims new order)
  React.useEffect(() => {
    if (order.status === 'completed') {
      setOrderStatus('Completed');
    } else if (order.utr && order.utr.trim().length > 0) {
      setOrderStatus('PendingApproval');
      setSubmittedUtr(order.utr);
    } else {
      setOrderStatus('Pending');
      setSubmittedUtr(null);
      setUtrNumber('');
      setUtrError(null);
    }
  }, [order.id, order.status, order.utr]);

  // UTR system state
  const [utrNumber, setUtrNumber] = useState<string>(order.utr || '');
  const [submittedUtr, setSubmittedUtr] = useState<string | null>(
    order.utr || null
  );
  const [utrError, setUtrError] = useState<string | null>(null);

  // FamPay constants
  const fampayUpi = 'sagarmaster@fam';
  const payeeName = 'Sagar Master';
  const payoutAccount = order.payoutAccount || '8949263502';
  const payoutUpi = order.payoutUpi || `${payoutAccount}@mbkns`;
  const orderNo = order.orderNo || `R2026101118241395424989`;

  const copyToClipboard = (text: string, fieldKey: string) => {
    sounds.playTap();
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handlePasteUtr = async () => {
    sounds.playTap();
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const cleaned = text.trim().replace(/[^a-zA-Z0-9]/g, '');
        setUtrNumber(cleaned);
        setUtrError(null);
      }
    } catch {
      // Clipboard permission denied fallback
      setUtrError('Could not read clipboard. Please type UTR manually.');
    }
  };

  const handleFillDemoUtr = () => {
    sounds.playTap();
    const demoUtr = `429${Math.floor(100000000 + Math.random() * 900000000)}`;
    setUtrNumber(demoUtr);
    setUtrError(null);
  };

  const handleSubmitUtr = () => {
    if (orderStatus === 'Completed' || orderStatus === 'PendingApproval') return;

    const trimmed = utrNumber.trim();
    if (!trimmed) {
      sounds.playError();
      setUtrError('Please enter the 12-digit UTR from your payment receipt.');
      return;
    }

    if (trimmed.length < 8) {
      sounds.playError();
      setUtrError('Invalid UTR. Standard UPI UTR numbers are 12 digits.');
      return;
    }

    setUtrError(null);
    sounds.playTap();
    setIsSubmittingReview(true);

    setTimeout(() => {
      setIsSubmittingReview(false);
      setOrderStatus('PendingApproval');
      setSubmittedUtr(trimmed);
      sounds.playTap();
      onConfirmPayment({
        ...order,
        status: 'processing',
        utr: trimmed,
        payoutWallet: selectedWallet,
      });
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#F4F8F8] max-w-md mx-auto flex flex-col justify-between pb-12 select-none">
      {/* Top Header */}
      <div className="pt-6 pb-2 px-4 flex items-center justify-between relative">
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onBack();
          }}
          className="p-1.5 text-[#0FA968] hover:bg-emerald-50 rounded-full cursor-pointer transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h1 className="text-xl font-bold text-[#0FA968] tracking-tight">
          Claim Order
        </h1>

        <div className="flex items-center space-x-1 bg-emerald-50 text-[#0FA968] px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0FA968] animate-pulse" />
          <span>FamPay QR</span>
        </div>
      </div>

      <div className="px-4 space-y-3.5 flex-1 overflow-y-auto">
        {/* Large Amount Display */}
        <div className="pt-2 pb-1 text-center">
          <div className="text-3xl font-black text-[#0FA968] tracking-tight">
            INR {(order?.amount ?? 0).toFixed(2)}
          </div>
          <span className="text-[11px] text-gray-500 font-semibold">
            Pay exact amount via FamPay UPI QR
          </span>
        </div>

        {/* Notice Banner */}
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3 text-center">
          <p className="text-xs text-[#C27838] leading-relaxed font-medium">
            Notice: Scan the FamPay QR code to pay, then enter your 12-digit UTR
            number below to claim your cashback rebate. Please do not cancel the
            order.
          </p>
        </div>

        {/* FamPay QR Code Component (Only FamPay QR System) */}
        <div className="space-y-3">
          <FamPayQrCode
            amount={order?.amount ?? 0}
            upiId={fampayUpi}
            payeeName={payeeName}
            orderNo={orderNo}
          />

          {/* Compact Order Reference & Voucher Card */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Status:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                  orderStatus === 'Completed'
                    ? 'bg-emerald-100 text-[#0FA968]'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {orderStatus === 'Completed' ? 'Claimed & Verified' : 'Awaiting Payment & UTR'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">FamPay UPI ID:</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-900 font-mono text-[11px] bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                  {fampayUpi}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(fampayUpi, 'fampayUpi')}
                  className="text-gray-400 hover:text-[#0FA968] cursor-pointer p-0.5"
                  title="Copy FamPay UPI ID"
                >
                  {copiedField === 'fampayUpi' ? (
                    <Check className="w-4 h-4 text-[#0FA968]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Order NO:</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-800 font-mono text-[11px] truncate max-w-[190px]">
                  {orderNo}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(orderNo, 'orderNo')}
                  className="text-gray-400 hover:text-[#0FA968] cursor-pointer p-0.5"
                  title="Copy Order NO"
                >
                  {copiedField === 'orderNo' ? (
                    <Check className="w-4 h-4 text-[#0FA968]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Payout Target:</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-800 text-[11px]">
                  {selectedWallet} ({payoutAccount})
                </span>
                <button
                  type="button"
                  onClick={() => setIsChangingWallet(true)}
                  className="text-[10px] text-[#0FA968] hover:underline font-bold"
                >
                  Change
                </button>
              </div>
            </div>

            <div className="pt-1.5 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  setIsVoucherOpen(true);
                }}
                className="w-full py-2 rounded-xl border border-gray-200 text-[#0FA968] hover:bg-emerald-50/50 text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Official Voucher</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Expected Earnings Banner */}
        <div className="bg-[#E6F4EE] rounded-2xl p-3 border border-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-[#0FA968] text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-emerald-900 font-semibold block">
                Cashback Rebate Reward
              </span>
              <span className="text-[11px] text-emerald-700">
                {orderStatus === 'Completed'
                  ? 'Rebate successfully credited to wallet'
                  : orderStatus === 'PendingApproval'
                  ? 'Awaiting Admin confirmation from Admin Panel'
                  : 'Submit 12-digit UTR after payment'}
              </span>
            </div>
          </div>
          <span className="text-base font-black text-[#0FA968]">
            +₹{order.income}
          </span>
        </div>

        {/* UTR System Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-200/80 space-y-3">
          {orderStatus === 'Completed' ? (
            /* Completed & Verified State */
            <div className="space-y-3">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <CheckCircle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="font-extrabold text-sm text-emerald-900">
                  Payment Claim Confirmed by Admin!
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Full Return of <strong className="font-bold text-emerald-900">+₹{(order.amount + order.income).toFixed(2)}</strong> (₹{order.amount} Refund + ₹{order.income} Cashback) credited to your account!
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Verified UTR:</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-gray-900 text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                      {submittedUtr || utrNumber || '429381749201'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          submittedUtr || utrNumber || '429381749201',
                          'submittedUtr'
                        )
                      }
                      className="text-gray-400 hover:text-[#0FA968] p-1"
                      title="Copy UTR"
                    >
                      {copiedField === 'submittedUtr' ? (
                        <Check className="w-3.5 h-3.5 text-[#0FA968]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">FamPay Gateway:</span>
                  <span className="font-semibold text-gray-800">
                    sagarmaster@fam
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Full Return Credited:</span>
                  <span className="font-bold text-[#0FA968] flex items-center space-x-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Settled (₹{(order.amount + order.income).toFixed(2)})</span>
                  </span>
                </div>
              </div>
            </div>
          ) : orderStatus === 'PendingApproval' ? (
            /* UTR Submitted - Pending Admin Confirmation State */
            <div className="space-y-3">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-2 shadow-sm animate-pulse">
                  <Clock className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h4 className="font-extrabold text-sm text-amber-900">
                  UTR Submitted • Pending Admin Approval
                </h4>
                <p className="text-xs text-amber-700 mt-1">
                  Your UTR has been submitted. On Admin confirmation, your full balance of <strong className="font-bold text-amber-900">₹{(order.amount + order.income).toFixed(2)}</strong> (₹{order.amount} Refund + ₹{order.income} Cashback) will be credited immediately.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Submitted UTR:</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-gray-900 text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                      {submittedUtr || utrNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          submittedUtr || utrNumber || '',
                          'submittedUtr'
                        )
                      }
                      className="text-gray-400 hover:text-[#0FA968] p-1"
                      title="Copy UTR"
                    >
                      {copiedField === 'submittedUtr' ? (
                        <Check className="w-3.5 h-3.5 text-[#0FA968]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Gateway:</span>
                  <span className="font-semibold text-gray-800">
                    sagarmaster@fam
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Approval Status:</span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping mr-1" />
                    <span>Waiting for Admin Approval</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Full Return on Confirmation:</span>
                  <span className="font-bold text-[#0FA968]">₹{(order.amount + order.income).toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/80 text-[11px] text-blue-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Admin is reviewing your transaction. As soon as Admin confirms from the Admin Panel, your cashback will be credited immediately.
                </span>
              </div>
            </div>
          ) : (
            /* UTR Input Form */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#0FA968] flex items-center justify-center">
                    <ReceiptText className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-gray-900">
                      Submit Payment UTR
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      Type 12-digit UPI reference number after paying
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#0FA968] border border-emerald-200">
                  12 Digits
                </span>
              </div>

              {/* UTR Input Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={16}
                  value={utrNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                    setUtrNumber(val);
                    if (utrError) setUtrError(null);
                  }}
                  placeholder="Enter 12-digit UTR (e.g. 429381749201)"
                  className="w-full pl-9 pr-24 py-3 bg-gray-50 border border-gray-200 focus:border-[#0FA968] focus:bg-white focus:ring-2 focus:ring-[#0FA968]/20 rounded-xl text-xs font-mono font-bold text-gray-900 tracking-wider placeholder:text-gray-400 placeholder:font-normal placeholder:tracking-normal transition-all outline-hidden"
                />

                <div className="absolute inset-y-0 right-1.5 flex items-center space-x-1">
                  {utrNumber && (
                    <button
                      type="button"
                      onClick={() => setUtrNumber('')}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-md cursor-pointer"
                      title="Clear"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handlePasteUtr}
                    className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                    title="Paste from clipboard"
                  >
                    <ClipboardPaste className="w-3 h-3 text-[#0FA968]" />
                    <span>Paste</span>
                  </button>
                </div>
              </div>

              {/* Helper Bar & Demo Fill */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <button
                  type="button"
                  onClick={handleFillDemoUtr}
                  className="text-[10px] font-bold text-[#0FA968] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>⚡ Auto-fill Sample UTR</span>
                </button>

                <span
                  className={`text-[10px] font-mono font-semibold ${
                    utrNumber.length === 12
                      ? 'text-[#0FA968]'
                      : utrNumber.length > 0
                      ? 'text-amber-600'
                      : 'text-gray-400'
                  }`}
                >
                  {utrNumber.length} / 12 digits
                </span>
              </div>

              {utrError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-600 text-[11px] font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{utrError}</span>
                </div>
              )}

              {/* Action Button: Submit UTR (ONLY Submit UTR as requested) */}
              <button
                type="button"
                onClick={handleSubmitUtr}
                disabled={isSubmittingReview || !utrNumber.trim()}
                className={`w-full py-3.5 px-4 font-bold rounded-full transition-all text-sm tracking-wide flex items-center justify-center space-x-2 shadow-md ${
                  isSubmittingReview || !utrNumber.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-[#0FA968] hover:bg-[#0c8e57] active:scale-[0.98] text-white shadow-[0_6px_20px_rgba(15,169,104,0.3)] cursor-pointer'
                }`}
              >
                {isSubmittingReview ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting UTR...</span>
                  </>
                ) : (
                  <>
                    <span>Submit UTR</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Cancel Order Option: Allows user to cancel this order and take another order instead */}
          {orderStatus !== 'Completed' && onCancelOrder && (
            <div className="pt-2">
              {isConfirmingCancel ? (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl animate-in fade-in space-y-2">
                  <div className="flex items-center space-x-2 text-red-700 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Cancel Order {order.id}? (ऑर्डर रद्द करें?)</span>
                  </div>
                  <p className="text-[11px] text-red-600 leading-relaxed">
                    Agar aap ye order cancel karte hain, to aap list se koi doosra naya order chun sakte hain.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playTap();
                        setIsConfirmingCancel(false);
                      }}
                      className="py-2 px-3 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
                    >
                      No, Keep
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playTap();
                        setIsConfirmingCancel(false);
                        onCancelOrder(order);
                      }}
                      className="py-2 px-3 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 cursor-pointer shadow-sm"
                    >
                      Yes, Cancel Order
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setIsConfirmingCancel(true);
                  }}
                  className="w-full py-2.5 px-4 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 font-bold rounded-full text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cancel Order &amp; Choose Another (ऑर्डर कैंसिल करें)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="pt-1 pb-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2 text-xs text-gray-500 font-semibold hover:text-gray-700 cursor-pointer text-center"
          >
            Return to Payment Orders
          </button>
        </div>
      </div>

      {/* Change Payout Wallet Modal */}
      {isChangingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-gray-800">
                Select Payout Wallet
              </h3>
              <button
                type="button"
                onClick={() => setIsChangingWallet(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {['Mobikwik', 'Paytm', 'Freecharge', 'MoneyView', 'FamPay', 'UPI'].map(
                (walletName) => (
                  <button
                    key={walletName}
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setSelectedWallet(walletName);
                      setIsChangingWallet(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold cursor-pointer transition-colors ${
                      selectedWallet === walletName
                        ? 'border-[#0FA968] bg-emerald-50 text-[#0FA968]'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{walletName}</span>
                    {selectedWallet === walletName && (
                      <Check className="w-4 h-4 text-[#0FA968]" />
                    )}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Voucher Modal */}
      {isVoucherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsVoucherOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Voucher Header */}
            <div className="text-center pt-2 pb-4 border-b border-dashed border-gray-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#0FA968] flex items-center justify-center mx-auto mb-2">
                <FileText className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-extrabold text-base text-gray-900">
                Official FamPay Settlement Voucher
              </h3>
              <p className="text-[11px] text-gray-500">
                OK PAY Verified Merchant Order Receipt
              </p>
            </div>

            {/* Voucher Body */}
            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Order Amount:</span>
                <span className="font-bold text-gray-800">
                  INR {order.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Gateway:</span>
                <span className="font-bold text-[#111827] bg-[#FFC727]/20 px-2 py-0.5 rounded text-[10px]">
                  FamPay UPI QR
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">FamPay UPI ID:</span>
                <span className="font-mono text-gray-800 font-bold">{fampayUpi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payee Name:</span>
                <span className="font-medium text-gray-800">{payeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Submitted UTR:</span>
                <span className="font-mono text-gray-900 font-bold">
                  {submittedUtr || utrNumber || 'Pending Submission'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payout Target:</span>
                <span className="font-medium text-gray-800">
                  {selectedWallet} ({payoutAccount})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cashback Rebate:</span>
                <span className="font-bold text-[#0FA968]">+₹{order.income}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Reference No:</span>
                <span className="font-mono text-[10px] text-gray-600">
                  {orderNo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="font-bold text-[#0FA968]">
                  {orderStatus === 'Completed'
                    ? 'Verified & Completed'
                    : orderStatus === 'PendingApproval'
                    ? 'Pending Admin Approval'
                    : 'Pending UTR'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Timestamp:</span>
                <span className="text-gray-600">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>

            {/* Verified Stamp Badge */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-center space-x-2 text-[#0FA968] font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>OK PAY &amp; FamPay Verified Digital Seal</span>
            </div>

            <button
              type="button"
              onClick={() => setIsVoucherOpen(false)}
              className="w-full mt-4 py-3 bg-[#0FA968] hover:bg-[#0c8e57] text-white font-bold rounded-full text-xs cursor-pointer shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
