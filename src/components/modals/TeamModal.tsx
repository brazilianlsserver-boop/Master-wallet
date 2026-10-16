import React, { useState } from 'react';
import {
  X,
  Users,
  Copy,
  Check,
  Share2,
  History,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Gift,
  Sparkles,
} from 'lucide-react';
import { User } from '../../types';
import { sounds } from '../../utils/audio';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  registeredUsers?: Record<string, User>;
  onOpenTasks?: () => void;
  showToast?: (msg: string) => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({
  isOpen,
  onClose,
  user,
  registeredUsers = {},
  onOpenTasks,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'invite' | 'history'>('invite');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const inviteCode = user?.inviteCode || '894215';
  const referralLink = `${window.location.origin}/?ref=${inviteCode}`;

  // Filter 100% REAL referrals from registeredUsers database
  const realReferrals = Object.values(registeredUsers || {}).filter(
    (u) =>
      u.phone !== user?.phone &&
      (u.referredBy === user?.phone || (inviteCode && u.referredBy === inviteCode))
  );

  const totalInvitedCount = realReferrals.length;
  const completed5OrdersCount = realReferrals.filter((r) => (r.ordersCount || 0) >= 5).length;
  // ₹500 on joining + ₹500 more when referral does 5 orders
  const totalEarnedBonuses = totalInvitedCount * 500 + completed5OrdersCount * 500;

  const handleCopyCode = () => {
    sounds.playTap();
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    if (showToast) showToast(`Invite code ${inviteCode} copied!`);
  };

  const handleCopyLink = () => {
    sounds.playTap();
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    if (showToast) {
      showToast('Referral link copied! Share with anyone to earn ₹500 from tasks!');
    }
  };

  const handleNativeShare = () => {
    sounds.playTap();
    const shareText = `Join OK PAY with my referral code ${inviteCode} and receive an instant ₹30 welcome bonus! Claim orders and earn daily cashback: ${referralLink}`;
    if (navigator.share) {
      navigator
        .share({
          title: 'Join OK PAY - Earn Daily Income',
          text: shareText,
          url: referralLink,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm max-h-[88vh] bg-white rounded-3xl p-5 shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#0FA968] flex items-center justify-center">
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 leading-tight">My Team &amp; Referrals</h2>
            <span className="text-[10px] text-emerald-600 font-bold block">
              Earn ₹500 per friend + ₹500 more on 5 orders
            </span>
          </div>
        </div>

        {/* Primary Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-2xl mb-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setActiveTab('invite');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'invite'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-[#0FA968]" />
            <span>Invite &amp; Earn</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setActiveTab('history');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <History className="w-3.5 h-3.5 text-[#0FA968]" />
            <span>My Referrals ({totalInvitedCount})</span>
            {totalInvitedCount > 0 && <span className="w-2 h-2 rounded-full bg-[#0FA968]" />}
          </button>
        </div>

        {/* Tab 1: Invite & Earn */}
        {activeTab === 'invite' && (
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5">
            {/* Invite Code card */}
            <div className="bg-[#FAFBFB] rounded-2xl p-4 border border-emerald-100 text-center relative overflow-hidden">
              <span className="text-xs text-gray-400 font-medium block">Your Personal Invite Code</span>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <span className="text-2xl font-black text-[#0FA968] tracking-widest font-mono">
                  {inviteCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1.5 text-gray-500 hover:text-[#0FA968] cursor-pointer"
                  title="Copy code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Share Referral Link Button */}
              <div className="mt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-2 bg-[#0FA968] hover:bg-[#0c8e57] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center space-x-1 active:scale-95 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0FA968] text-xs font-bold rounded-xl border border-emerald-200 cursor-pointer flex items-center justify-center space-x-1 active:scale-95 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Referral Rules High-Reward Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-3.5 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900 flex items-center space-x-1">
                  <Gift className="w-4 h-4 text-[#0FA968]" />
                  <span>Referral Rewards Program</span>
                </span>
                <span className="text-[10px] font-extrabold bg-[#0FA968] text-white px-2 py-0.5 rounded-full">
                  100% Real
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-emerald-800">
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-[#0FA968]">•</span>
                  <span>
                    <strong>Instant ₹500 Task Reward:</strong> When any user registers using your invite code/link, you get a notification and unlock ₹500 in Tasks!
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-[#0FA968]">•</span>
                  <span>
                    <strong>Extra +₹500 on 5 Orders:</strong> When your invited friend completes 5 claim orders, you unlock another ₹500 reward!
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="p-3 bg-gray-50 rounded-2xl flex items-center justify-around text-center text-xs border border-gray-100">
              <div>
                <span className="text-gray-400 block text-[10px]">Real Referrals</span>
                <span className="font-black text-gray-900 text-sm">{totalInvitedCount} Users</span>
              </div>
              <div className="w-px h-6 bg-gray-200" />
              <div>
                <span className="text-gray-400 block text-[10px]">5-Order Qualified</span>
                <span className="font-black text-emerald-600 text-sm">{completed5OrdersCount} Users</span>
              </div>
              <div className="w-px h-6 bg-gray-200" />
              <div>
                <span className="text-gray-400 block text-[10px]">Available Bonuses</span>
                <span className="font-black text-[#0FA968] text-sm">₹{totalEarnedBonuses}</span>
              </div>
            </div>

            {/* CTA to view task or history */}
            <div className="flex space-x-2">
              {onOpenTasks && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    onClose();
                    onOpenTasks();
                  }}
                  className="flex-1 py-2.5 bg-[#0FA968] hover:bg-[#0c8e57] text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Claim in Tasks</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  setActiveTab('history');
                }}
                className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#0FA968] font-bold text-xs rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-colors"
              >
                <span>View My Team ({totalInvitedCount})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Referral History (Real Data) */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto flex flex-col pr-0.5">
            {/* Header Metrics Banner */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-3 mb-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-800 font-medium block">Total Referral Earnings</span>
                <span className="text-lg font-black text-[#0FA968] leading-tight">
                  ₹{totalEarnedBonuses.toLocaleString()}.00
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-gray-500 font-medium block">Real Team Members</span>
                <span className="text-sm font-extrabold text-gray-800">
                  {totalInvitedCount} Friends Joined
                </span>
              </div>
            </div>

            {/* Real Referrals List */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-0.5">
              {realReferrals.length === 0 ? (
                <div className="text-center py-10 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0FA968] flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-800">No Referrals Yet</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Share your referral code <strong className="text-[#0FA968]">{inviteCode}</strong> with friends. When anyone joins, they will appear here and you can claim ₹500 immediately!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-[#0FA968] text-white font-bold text-xs rounded-full shadow-xs cursor-pointer inline-flex items-center space-x-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copy &amp; Invite Now</span>
                  </button>
                </div>
              ) : (
                realReferrals.map((item) => {
                  const ordersDone = item.ordersCount || 0;
                  const is5OrdersMet = ordersDone >= 5;

                  return (
                    <div
                      key={item.phone}
                      className="p-3 bg-gray-50 hover:bg-emerald-50/40 rounded-2xl border border-gray-100 flex items-center justify-between transition-colors text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0FA968] font-black text-xs flex items-center justify-center shrink-0">
                          {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-extrabold text-gray-900">{item.name}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#0FA968]">
                              Joined
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 flex items-center space-x-2 mt-0.5">
                            <span className="font-mono">{item.phone.slice(0, 4)}****{item.phone.slice(-2)}</span>
                            <span>•</span>
                            <span>{item.createdAt || 'Recent'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Orders & Reward status */}
                      <div className="text-right">
                        <div className="font-black text-emerald-600 text-xs">
                          +₹{is5OrdersMet ? 1000 : 500}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5 flex items-center justify-end space-x-0.5 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-[#0FA968]" />
                          <span>{ordersDone} / 5 orders</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Modal Bottom Button */}
        <div className="pt-3 border-t border-gray-100 mt-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-2.5 bg-[#0FA968] hover:bg-[#0c8e57] text-white font-bold rounded-full text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Invite More Friends (+₹500 Each)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
