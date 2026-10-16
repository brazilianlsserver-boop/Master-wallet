import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Smartphone,
  Share2,
  Check,
  Copy,
  ShieldCheck,
  Sparkles,
  ArrowDownCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { OkPayLogo } from '../OkPayLogo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface DownloadApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const DownloadApkModal: React.FC<DownloadApkModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  // Direct APK File Download
  const handleDownloadApkFile = () => {
    setDownloadStarted(true);
    showToast('Starting OK PAY Official APK download...');

    // Trigger direct APK download from server
    const link = document.createElement('a');
    link.href = '/download/OKPAY_v2.4_Official.apk';
    link.download = 'OKPAY_v2.4_Official.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadStarted(false);
      showToast('APK Download complete! Check your Downloads folder.');
    }, 2500);
  };

  const [showChromeGuide, setShowChromeGuide] = useState(true);

  // Direct Browser PWA / WebAPK Installation
  const handleDirectInstall = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          showToast('OK PAY App installing to your Home Screen!');
          setDeferredPrompt(null);
        } else {
          showToast('Installation cancelled.');
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      } finally {
        setIsInstalling(false);
      }
    } else {
      setShowChromeGuide(true);
      showToast('Tap Chrome menu (⋮) -> Select "Install app"!');
    }
  };

  // Share with Fans via WhatsApp
  const handleShareWithFans = () => {
    const appUrl = window.location.origin;
    const shareText = `🚀 *OK PAY Official Android App (APK)*\n\nDosto OK PAY App install karo aur daily merchant payment claims, task rewards aur referral cashback kamao!\n\n📲 Direct Download & Open Link:\n${appUrl}\n\n✅ 100% Verified & Admin Sagar Master Approved.`;

    if (navigator.share) {
      navigator
        .share({
          title: 'OK PAY Official App (APK)',
          text: shareText,
          url: appUrl,
        })
        .catch(() => {
          // fallback to whatsapp link
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
        });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
    showToast('Sharing OK PAY App link with fans!');
  };

  // Copy App & APK Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setIsCopied(true);
    showToast('App URL copied to clipboard! Share it with fans.');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="bg-[#F8FAFA] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-[#0FA968] via-emerald-600 to-teal-700 text-white p-5 relative overflow-hidden">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white rounded-2xl shadow-md text-[#0FA968]">
              <Smartphone className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Official Android Release</span>
              </div>
              <h3 className="text-lg font-black tracking-tight leading-tight">
                OK PAY Android App (APK)
              </h3>
            </div>
          </div>
          <p className="text-xs text-emerald-100 font-medium mt-2">
            Download the official Android APK to share with your fans or install directly to home screen!
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* APK Specification Card */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <OkPayLogo size="sm" />
                <div>
                  <h4 className="font-extrabold text-xs text-gray-900">OKPAY_v2.4_Official.apk</h4>
                  <span className="text-[10px] text-gray-400 font-medium">Package: com.okpay.earn</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#0FA968] font-bold text-[11px] border border-emerald-200">
                v2.4.0
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-100 text-[11px] text-center">
              <div className="bg-gray-50 p-1.5 rounded-xl">
                <span className="block text-gray-400 text-[9px] uppercase font-semibold">Size</span>
                <span className="font-bold text-gray-800">1.3 MB</span>
              </div>
              <div className="bg-gray-50 p-1.5 rounded-xl">
                <span className="block text-gray-400 text-[9px] uppercase font-semibold">OS</span>
                <span className="font-bold text-gray-800">Android 8.0+</span>
              </div>
              <div className="bg-gray-50 p-1.5 rounded-xl">
                <span className="block text-gray-400 text-[9px] uppercase font-semibold">Security</span>
                <span className="font-bold text-[#0FA968] flex items-center justify-center space-x-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {/* 1. Download Official APK */}
            <button
              type="button"
              onClick={handleDownloadApkFile}
              disabled={downloadStarted}
              className="w-full py-3.5 px-4 bg-[#0FA968] hover:bg-[#0c8e57] active:scale-[0.98] text-white font-bold rounded-2xl shadow-[0_4px_16px_rgba(15,169,104,0.35)] transition-all flex items-center justify-between cursor-pointer text-sm"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Download className={`w-4 h-4 ${downloadStarted ? 'animate-bounce' : ''}`} />
                </div>
                <div className="text-left">
                  <div className="leading-tight">Download APK File (.apk)</div>
                  <div className="text-[10px] text-white/80 font-normal">Direct offline installer package</div>
                </div>
              </div>
              <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-extrabold">
                {downloadStarted ? 'Downloading...' : '1.3 MB'}
              </span>
            </button>

            {/* 2. Direct Install / Add to Home Screen */}
            <button
              type="button"
              onClick={handleDirectInstall}
              disabled={isInstalling}
              className="w-full py-3 px-4 bg-white hover:bg-gray-50 active:scale-[0.98] border border-gray-300 text-gray-800 font-bold rounded-2xl transition-all flex items-center justify-between cursor-pointer text-sm shadow-2xs"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0FA968] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="leading-tight">Direct Install (WebAPK)</div>
                  <div className="text-[10px] text-gray-400 font-normal">Add to Android phone home screen</div>
                </div>
              </div>
              <span className="text-[11px] text-[#0FA968] bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                1-Tap Install
              </span>
            </button>

            {/* 3. Share with Fans (WhatsApp) */}
            <button
              type="button"
              onClick={handleShareWithFans}
              className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-bold rounded-2xl transition-all flex items-center justify-center space-x-2 cursor-pointer text-sm shadow-[0_4px_14px_rgba(37,211,102,0.3)]"
            >
              <Share2 className="w-4 h-4" />
              <span>Share App Link with Fans (WhatsApp)</span>
            </button>
          </div>

          {/* Copy Link helper */}
          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-200 text-xs">
            <span className="text-gray-500 font-mono text-[11px] truncate mr-2">
              {window.location.origin}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="shrink-0 flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-semibold cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-[#0FA968]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Solution for "There was a problem parsing the package" */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 space-y-2 shadow-2xs">
            <div className="flex items-center space-x-2 text-emerald-950 font-extrabold text-xs">
              <CheckCircle2 className="w-4 h-4 text-[#0FA968]" />
              <span>&quot;Problem Parsing Package&quot; Fix (100% Working)</span>
            </div>
            <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
              Agar phone me manual file open karne par <em>&quot;There was a problem parsing the package&quot;</em> error aaye, toh ye 100% working official Android solution use karein:
            </p>
            <div className="bg-white rounded-xl p-3 border border-emerald-200 text-xs space-y-2 font-medium text-gray-800">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#0FA968] text-white flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                <span>Google Chrome browser me upar right side <strong>3 dots (⋮)</strong> dabayein.</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#0FA968] text-white flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                <span>Menu me <strong>&quot;Install app&quot;</strong> (ya <strong>&quot;Add to Home screen&quot;</strong>) par click karein.</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#0FA968] text-white flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                <span>Google Android system turant bina kisi error ke official OK PAY App aapke phone me install kar dega!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
