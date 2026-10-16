import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  RefreshCw,
  Coins,
  Headphones,
  Mail,
  ShieldCheck,
  BookOpen,
  ShieldAlert,
  User as UserIcon,
  Copy,
  Check,
  Smartphone,
  Download,
} from 'lucide-react';
import { AppState, User } from '../types';
import { sounds } from '../utils/audio';

interface MyAssetScreenProps {
  appState: AppState;
  user?: User;
  onLogout: () => void;
  onOpenWallet: () => void;
  onOpenIntegral: () => void;
  onOpenService: () => void;
  onOpenMessage: () => void;
  onOpenPin: () => void;
  onOpenTutorial: () => void;
  onOpenDeposit: () => void;
  onOpenWithdrawal: () => void;
  onOpenAdmin?: () => void;
  onOpenDownloadApk?: () => void;
}

export const MyAssetScreen: React.FC<MyAssetScreenProps> = ({
  appState,
  user,
  onLogout,
  onOpenWallet,
  onOpenIntegral,
  onOpenService,
  onOpenMessage,
  onOpenPin,
  onOpenTutorial,
  onOpenDeposit,
  onOpenWithdrawal,
  onOpenAdmin,
  onOpenDownloadApk,
}) => {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    if (user?.id) {
      sounds.playTap();
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="pb-32 bg-[#F4F8F8] min-h-screen max-w-md mx-auto select-none">
      {/* Header */}
      <div className="pt-6 pb-3 text-center">
        <h1 className="text-xl font-bold text-[#0FA968] tracking-tight">My Asset</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* User Identity & Device Storage Card */}
        {user && (
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0FA968]/10 text-[#0FA968] flex items-center justify-center font-bold">
                <UserIcon className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-extrabold text-gray-900">{user.phone}</span>
                  {user.role === 'admin' ? (
                    <span className="text-[10px] bg-gray-900 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-50 text-[#0FA968] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      Standard
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 font-medium mt-0.5">
                  <span className="font-mono text-gray-700">ID: {user.id}</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                    title="Copy ID"
                  >
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[#0FA968] text-[10px] font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Device Safe</span>
              </div>
              <span className="text-[10px] text-gray-400 block mt-1 font-mono">
                Auto-Saved
              </span>
            </div>
          </div>
        )}

        {/* Top Asset Stats Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Deposit */}
            <button
              type="button"
              onClick={onOpenDeposit}
              className="bg-[#FAFBFB] rounded-xl p-3 border border-gray-100 flex items-center space-x-3 text-left hover:bg-emerald-50/40 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-gray-500 font-medium block">Deposit</span>
                <span className="text-sm font-extrabold text-gray-800">
                  ₹ {(appState?.depositTotal ?? 0).toFixed(0)}
                </span>
              </div>
            </button>

            {/* Withdraw */}
            <button
              type="button"
              onClick={onOpenWithdrawal}
              className="bg-[#FAFBFB] rounded-xl p-3 border border-gray-100 flex items-center space-x-3 text-left hover:bg-emerald-50/40 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-gray-500 font-medium block">Withdraw</span>
                <span className="text-sm font-extrabold text-gray-800">
                  ₹ {(appState?.withdrawalTotal ?? 0).toFixed(0)}
                </span>
              </div>
            </button>
          </div>

          {/* Commission */}
          <div className="bg-[#FAFBFB] rounded-xl p-3 border border-gray-100 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-gray-500 font-medium block">Commission</span>
              <span className="text-sm font-extrabold text-gray-800">
                ₹ {(appState?.commissionTotal ?? 0).toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* 6 Action Tiles in 3x2 Grid */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100">
          <div className="grid grid-cols-3 gap-3">
            {/* 1. Wallet */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onOpenWallet();
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-emerald-50/50 transition-all cursor-pointer group active:scale-95"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#E6F4EE] flex items-center justify-center text-gray-700 shadow-2xs group-hover:bg-[#d8efe5] transition-colors">
                <span className="font-extrabold text-lg">¥</span>
              </div>
              <span className="text-xs font-semibold text-gray-800 mt-2">Wallet</span>
            </button>

            {/* 2. Integral */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onOpenIntegral();
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-emerald-50/50 transition-all cursor-pointer group active:scale-95"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#E6F4EE] flex items-center justify-center text-gray-700 shadow-2xs group-hover:bg-[#d8efe5] transition-colors">
                <Coins className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-xs font-semibold text-gray-800 mt-2">Integral</span>
            </button>

            {/* 3. Service */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onOpenService();
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-emerald-50/50 transition-all cursor-pointer group active:scale-95"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#E6F4EE] flex items-center justify-center text-gray-700 shadow-2xs group-hover:bg-[#d8efe5] transition-colors">
                <Headphones className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-xs font-semibold text-gray-800 mt-2">Service</span>
            </button>

            {/* 4. Message */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onOpenMessage();
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-emerald-50/50 transition-all cursor-pointer group active:scale-95"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#E6F4EE] flex items-center justify-center text-gray-700 shadow-2xs group-hover:bg-[#d8efe5] transition-colors">
                <Mail className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-xs font-semibold text-gray-800 mt-2">Message</span>
            </button>

            {/* 5. Pin */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onOpenPin();
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-emerald-50/50 transition-all cursor-pointer group active:scale-95"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#E6F4EE] flex items-center justify-center text-gray-700 shadow-2xs group-hover:bg-[#d8efe5] transition-colors">
                <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-xs font-semibold text-gray-800 mt-2">Pin</span>
            </button>

            {/* 6. Tutorial */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onOpenTutorial();
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-emerald-50/50 transition-all cursor-pointer group active:scale-95"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#E6F4EE] flex items-center justify-center text-gray-700 shadow-2xs group-hover:bg-[#d8efe5] transition-colors">
                <BookOpen className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-xs font-semibold text-gray-800 mt-2">Tutorial</span>
            </button>
          </div>

          {/* Version text */}
          <div className="text-right pt-4 pr-2 text-xs text-gray-500 font-medium">
            OK PAY Android Release • v2.4.0
          </div>
        </div>

        {/* Download Android APK Banner */}
        {onOpenDownloadApk && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onOpenDownloadApk();
              }}
              className="w-full p-3.5 bg-gradient-to-r from-emerald-600 via-[#0FA968] to-teal-600 hover:brightness-105 text-white font-bold rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-between text-xs border border-emerald-500/40 active:scale-[0.98]"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-white text-xs">Download Android App (APK)</span>
                  <span className="text-[10px] text-emerald-100 font-normal">v2.4.0 • Direct install for fans &amp; offline use</span>
                </div>
              </div>
              <span className="text-[10px] bg-white text-[#0FA968] font-black px-2.5 py-1 rounded-full shadow-2xs">
                Install APK
              </span>
            </button>
          </div>
        )}

        {/* Admin Management Console Button (ONLY for Admin) */}
        {user?.role === 'admin' && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                if (onOpenAdmin) onOpenAdmin();
              }}
              className="w-full p-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-between text-xs border border-gray-800 active:scale-[0.98]"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0FA968] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-white text-xs">Admin Panel</span>
                  <span className="text-[10px] text-gray-400 font-normal">Manage users, orders, balance & rates</span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                Open Console
              </span>
            </button>
          </div>
        )}

        {/* Logout Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3.5 px-4 bg-[#0FA968] hover:bg-[#0c8e57] active:scale-[0.98] text-white font-bold rounded-full shadow-[0_6px_20px_rgba(15,169,104,0.3)] transition-all cursor-pointer text-base tracking-wide"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
