import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, ExternalLink, ShieldCheck, Clock, Download, Smartphone } from 'lucide-react';
import { sounds } from '../utils/audio';

interface FamPayQrCodeProps {
  amount: number;
  upiId?: string;
  payeeName?: string;
  orderNo?: string;
  compact?: boolean;
}

export const FamPayQrCode: React.FC<FamPayQrCodeProps> = ({
  amount,
  upiId = 'sagarmaster@fam',
  payeeName = 'Sagar Master',
  orderNo = `ORD-${Date.now().toString().slice(-6)}`,
  compact = false,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes countdown

  // UPI deep link
  const upiUrl = `upi://pay?pa=${encodeURIComponent(
    upiId
  )}&pn=${encodeURIComponent(payeeName)}&am=${(amount ?? 0).toFixed(
    2
  )}&cu=INR&tn=Order_${encodeURIComponent(orderNo)}`;

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(upiUrl, {
      width: compact ? 220 : 280,
      margin: 1.5,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate FamPay QR:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [upiUrl, compact]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleCopyUpi = () => {
    sounds.playTap();
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyAmount = () => {
    sounds.playTap();
    navigator.clipboard.writeText(amount.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    sounds.playTap();
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `FamPay_QR_${orderNo}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-[26px] p-5 shadow-xs border border-gray-100 select-none overflow-hidden relative">
      {/* FamPay Header Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          {/* FamPay Logo icon */}
          <div className="w-8 h-8 rounded-xl bg-[#111827] flex items-center justify-center shadow-xs">
            <span className="text-[#FFC727] font-black text-xs tracking-tighter">
              fam
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm text-[#111827] tracking-tight">
                FamPay
              </span>
              <span className="bg-[#FFC727]/20 text-[#B45309] font-bold text-[9px] px-1.5 py-0.5 rounded-full border border-[#FFC727]/40">
                UPI QR
              </span>
            </div>
            <span className="text-[10px] text-gray-400 block font-medium">
              Scan &amp; Pay directly to merchant
            </span>
          </div>
        </div>

        {/* Expiry timer */}
        <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-200/60 text-[10px] font-bold font-mono">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* QR Code Container with FamPay Frame */}
      <div className="py-4 flex flex-col items-center justify-center">
        <div className="relative p-3 bg-white rounded-2xl border-2 border-[#111827] shadow-sm">
          {/* FamPay decorative yellow top pill */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#111827] text-[#FFC727] px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider flex items-center space-x-1">
            <span>FAMPAY UPI</span>
          </div>

          {qrDataUrl ? (
            <div className="relative flex items-center justify-center">
              <img
                src={qrDataUrl}
                alt="FamPay QR Code"
                className="w-48 h-48 rounded-lg object-contain"
              />
              {/* Center FamPay Logo badge */}
              <div className="absolute w-10 h-10 rounded-full bg-[#111827] border-2 border-white flex items-center justify-center shadow-md">
                <span className="text-[#FFC727] font-black text-[10px] tracking-tight">
                  fam
                </span>
              </div>
            </div>
          ) : (
            <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="w-6 h-6 border-2 border-[#FFC727] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div className="mt-1 text-center">
            <span className="text-[10px] font-bold text-gray-600">
              Accepted on all UPI Apps
            </span>
          </div>
        </div>

        {/* Amount to pay */}
        <div className="mt-3.5 text-center">
          <span className="text-[11px] text-gray-400 font-medium">
            Pay Exact Amount:
          </span>
          <div className="flex items-center justify-center space-x-1.5 mt-0.5">
            <span className="text-2xl font-black text-[#0FA968] tracking-tight">
              ₹{amount.toFixed(2)}
            </span>
            <button
              type="button"
              onClick={handleCopyAmount}
              className="text-gray-400 hover:text-[#0FA968] p-1 cursor-pointer transition-colors"
              title="Copy Amount"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[#0FA968]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* FamPay UPI ID Row */}
      <div className="bg-[#FAFBFB] rounded-2xl p-3 border border-gray-100 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">FamPay UPI ID:</span>
          <div className="flex items-center space-x-1.5">
            <span className="font-mono font-bold text-gray-800 text-[11px] bg-white px-2 py-0.5 rounded border border-gray-200">
              {upiId}
            </span>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="px-2 py-0.5 bg-[#111827] hover:bg-black text-[#FFC727] rounded-md text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
            >
              {copiedUpi ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-500 font-medium">Merchant:</span>
          <span className="font-semibold text-gray-700">{payeeName}</span>
        </div>
      </div>

      {/* Supported UPI Apps Row */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            Supported:
          </span>
          <div className="flex items-center space-x-1">
            <span className="bg-[#111827] text-[#FFC727] font-black text-[9px] px-1.5 py-0.5 rounded">
              FamPay
            </span>
            <span className="bg-[#5F259F]/10 text-[#5F259F] font-bold text-[9px] px-1.5 py-0.5 rounded">
              PhonePe
            </span>
            <span className="bg-[#002970]/10 text-[#002970] font-bold text-[9px] px-1.5 py-0.5 rounded">
              Paytm
            </span>
            <span className="bg-blue-50 text-blue-600 font-bold text-[9px] px-1.5 py-0.5 rounded">
              GPay
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadQr}
          className="text-[10px] text-gray-500 hover:text-gray-800 font-bold flex items-center space-x-1 cursor-pointer transition-colors"
          title="Save QR Code image"
        >
          <Download className="w-3 h-3" />
          <span>Save QR</span>
        </button>
      </div>

      {/* Direct UPI App launcher on mobile */}
      <div className="mt-3">
        <a
          href={upiUrl}
          className="w-full py-2.5 bg-gradient-to-r from-[#111827] to-[#1F2937] hover:from-black hover:to-gray-900 text-[#FFC727] rounded-xl text-xs font-black flex items-center justify-center space-x-2 cursor-pointer shadow-xs active:scale-[0.99] transition-all"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#FFC727]" />
          <span>Tap to Pay with FamPay / Any UPI App</span>
          <ExternalLink className="w-3 h-3 text-[#FFC727]" />
        </a>
      </div>

      {/* Verified security note */}
      <div className="mt-2.5 flex items-center justify-center space-x-1.5 text-[10px] text-gray-400 font-medium text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-[#0FA968]" />
        <span>Secure settlement protected by FamPay &amp; OK PAY engine</span>
      </div>
    </div>
  );
};
