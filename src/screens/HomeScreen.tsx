import React from 'react';
import { Copy, Bell, ArrowUp, ArrowDown, Check, ClipboardList, Users, Zap, FileText, ShieldAlert, Download, Smartphone } from 'lucide-react';
import { User, AppState, Transaction } from '../types';
import { sounds } from '../utils/audio';

interface HomeScreenProps {
  user: User;
  appState: AppState;
  transactions: Transaction[];
  onOpenDetail: () => void;
  onOpenDeposit: () => void;
  onOpenWithdrawal: () => void;
  onOpenUsdt: () => void;
  onOpenTask: () => void;
  onOpenTeam: () => void;
  onOpenOrder: () => void;
  onOpenNotifications: () => void;
  onSeeAllTransactions: () => void;
  onOpenAdmin?: () => void;
  onOpenDownloadApk?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  appState,
  transactions,
  onOpenDetail,
  onOpenDeposit,
  onOpenWithdrawal,
  onOpenUsdt,
  onOpenTask,
  onOpenTeam,
  onOpenOrder,
  onOpenNotifications,
  onSeeAllTransactions,
  onOpenAdmin,
  onOpenDownloadApk,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyId = () => {
    sounds.playTap();
    navigator.clipboard.writeText(user?.id || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const recentTransactions = (transactions || []).slice(0, 3);

  return (
    <div className="pb-32 bg-[#F4F8F8] min-h-screen max-w-md mx-auto select-none">
      {/* Top Profile Bar */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center space-x-3">
          {/* Avatar circle with soft blue smile */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-200 to-sky-300 flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
              <circle cx="20" cy="16" r="7" fill="#60A5FA" />
              <path
                d="M8 34 C8 26, 14 24, 20 24 C26 24, 32 26, 32 34"
                fill="#60A5FA"
              />
              <path
                d="M16 17 Q20 20 24 17"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <div className="text-xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {user?.phone || 'OK User'}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 font-medium mt-0.5">
              <span className="font-mono font-semibold text-gray-700">ID: {user?.id || '316568'}</span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                title="Copy ID"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-[#0FA968] text-[10px] font-bold border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Auto-Saved</span>
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Actions: Admin, APK Download, Notifications */}
        <div className="flex items-center space-x-1.5">
          {onOpenDownloadApk && (
            <button
              type="button"
              onClick={onOpenDownloadApk}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#0FA968] text-[11px] font-bold cursor-pointer shadow-xs border border-emerald-200/90 active:scale-95 transition-all"
              title="Download Android APK"
            >
              <Download className="w-3.5 h-3.5 text-[#0FA968]" />
              <span>APK</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-gray-900 hover:bg-black text-gray-200 text-[11px] font-bold cursor-pointer shadow-xs border border-gray-700/80 active:scale-95 transition-all"
              title="Open Admin Console"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin</span>
            </button>
          )}

          {/* Bell Notification */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full hover:bg-white text-gray-700 cursor-pointer transition-colors"
          >
            <Bell className="w-6 h-6 stroke-[1.8]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-3.5">
        {/* Main Available Balance Hero Card */}
        <div className="rounded-[22px] overflow-hidden shadow-[0_8px_25px_rgba(15,169,104,0.22)]">
          {/* Top Green Gradient Section */}
          <div className="relative bg-gradient-to-r from-[#0FA968] via-[#10B36E] to-[#0E9F62] p-5 text-white overflow-hidden">
            {/* Background decorative circles matching screenshots */}
            <div className="absolute -top-10 -right-8 w-40 h-40 bg-amber-400/90 rounded-full blur-[1px] pointer-events-none" />
            <div className="absolute top-2 -right-16 w-36 h-36 bg-blue-500/80 rounded-full blur-[1px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-6 w-28 h-28 bg-emerald-700/40 rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="text-sm font-medium text-emerald-100">Available Balance</div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="text-3xl font-extrabold tracking-tight">
                  ₹ {(appState?.balance ?? 0).toFixed(0)}
                </div>
                <button
                  type="button"
                  onClick={onOpenDetail}
                  className="px-5 py-1.5 bg-white text-gray-800 text-xs font-bold rounded-full shadow-md hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                >
                  Detail
                </button>
              </div>
            </div>
          </div>

          {/* Subcard (Deposit & Withdrawal) - non-clickable display only */}
          <div className="bg-[#0b8652] py-3 px-6 flex items-center justify-between text-white border-t border-emerald-600/30">
            {/* Deposit */}
            <div
              className="flex items-center space-x-2 flex-1 justify-center cursor-default select-none"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-400/30 flex items-center justify-center">
                <ArrowUp className="w-3.5 h-3.5 text-emerald-200 stroke-[3]" />
              </div>
              <div className="text-xs">
                <span className="font-semibold block sm:inline">Deposit</span>
                <span className="font-bold ml-1 text-sm">₹ {(appState?.depositTotal ?? 0).toFixed(0)}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/30 mx-2" />

            {/* Withdrawal */}
            <div
              className="flex items-center space-x-2 flex-1 justify-center cursor-default select-none"
            >
              <div className="w-5 h-5 rounded-full bg-red-400/30 flex items-center justify-center">
                <ArrowDown className="w-3.5 h-3.5 text-red-300 stroke-[3]" />
              </div>
              <div className="text-xs">
                <span className="font-semibold block sm:inline">Withdrawal</span>
                <span className="font-bold ml-1 text-sm">₹ {(appState?.withdrawalTotal ?? 0).toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action 4-Grid */}
        <div className="grid grid-cols-4 gap-2.5 pt-1">
          {/* 1: USDT */}
          <button
            type="button"
            onClick={onOpenUsdt}
            className="relative bg-white rounded-2xl p-3 flex flex-col items-center justify-center shadow-xs border border-gray-100 hover:shadow-md transition-all active:scale-95 cursor-pointer group"
          >
            {/* Top amber badge Coming Soon */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-xs uppercase tracking-tight">
              Coming Soon
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mt-1">
              <span className="font-black text-lg">₮</span>
            </div>
            <span className="text-xs font-semibold text-gray-700 mt-1.5">USDT</span>
          </button>

          {/* 2: Task */}
          <button
            type="button"
            onClick={onOpenTask}
            className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center shadow-xs border border-gray-100 hover:shadow-md transition-all active:scale-95 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-xs font-semibold text-gray-700 mt-1.5">Task</span>
          </button>

          {/* 3: Team */}
          <button
            type="button"
            onClick={onOpenTeam}
            className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center shadow-xs border border-gray-100 hover:shadow-md transition-all active:scale-95 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-xs font-semibold text-gray-700 mt-1.5">Team</span>
          </button>

          {/* 4: Order */}
          <button
            type="button"
            onClick={onOpenOrder}
            className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center shadow-xs border border-gray-100 hover:shadow-md transition-all active:scale-95 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Zap className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-xs font-semibold text-gray-700 mt-1.5">Order</span>
          </button>
        </div>

        {/* Official Android App APK Banner */}
        {onOpenDownloadApk && (
          <div className="bg-gradient-to-r from-emerald-600 via-[#0FA968] to-teal-600 rounded-2xl p-3.5 text-white shadow-[0_4px_16px_rgba(15,169,104,0.25)] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-black leading-tight flex items-center space-x-1.5">
                  <span>OK PAY Official APK</span>
                  <span className="text-[9px] bg-white text-[#0FA968] px-1.5 py-0.2 rounded-full font-extrabold uppercase">
                    v2.4
                  </span>
                </div>
                <div className="text-[10px] text-emerald-100 font-medium mt-0.5">
                  Android App install karein &amp; fans ke sath share karein
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenDownloadApk}
              className="px-3 py-1.5 bg-white text-[#0FA968] text-xs font-extrabold rounded-xl shadow-xs hover:bg-emerald-50 active:scale-95 transition-all shrink-0 cursor-pointer flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get APK</span>
            </button>
          </div>
        )}

        {/* Transactions Section Card */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 mt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
              Transactions
            </h2>
            <button
              type="button"
              onClick={onSeeAllTransactions}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              See All
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No top-up orders yet</p>
              <p className="text-xs text-gray-400 mt-0.5 mb-4">
                Top up now and start the game!
              </p>
              <button
                type="button"
                onClick={onOpenDeposit}
                className="px-6 py-2.5 bg-[#0FA968] hover:bg-[#0c8e57] text-white text-xs font-bold rounded-full shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Top up now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                >
                  <div>
                    <div className="font-semibold text-gray-800">{tx.title}</div>
                    <div className="text-gray-400 text-[10px]">{tx.date}</div>
                  </div>
                  <div
                    className={`font-bold text-sm ${
                      tx.type === 'withdrawal' ? 'text-red-500' : 'text-emerald-600'
                    }`}
                  >
                    {tx.type === 'withdrawal' ? '-' : '+'}₹ {tx.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
