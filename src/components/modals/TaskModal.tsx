import React from 'react';
import {
  ArrowLeft,
  X,
  Star,
  CheckCircle2,
  Users,
  Share2,
  Award,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { ClaimOrder, User } from '../../types';
import { sounds } from '../../utils/audio';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaim: (reward: number, title: string, taskId: string) => void;
  onOpenTeam?: () => void;
  orders?: ClaimOrder[];
  user?: User;
  registeredUsers?: Record<string, User>;
  claimedTasks?: string[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onRewardClaim,
  onOpenTeam,
  orders = [],
  user,
  registeredUsers = {},
  claimedTasks = [],
}) => {
  if (!isOpen) return null;

  // 1. Calculate user's completed orders statistics
  const completedOrders = (orders || []).filter((o) => o.status === 'completed');
  const completedOrdersTotal = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const completedOrdersCount = completedOrders.length;

  // 2. Calculate real referrals for this user
  const userPhone = user?.phone || '';
  const userInviteCode = user?.inviteCode || '';
  const userReferrals = Object.values(registeredUsers || {}).filter(
    (u) =>
      u.phone !== userPhone &&
      (u.referredBy === userPhone || (userInviteCode && u.referredBy === userInviteCode))
  );

  const totalReferrals = userReferrals.length;
  const maxReferralOrders = userReferrals.reduce((max, r) => Math.max(max, r.ordersCount || 0), 0);

  const has3kOrder = completedOrdersTotal >= 3000 || completedOrders.some((o) => (o.amount || 0) >= 3000);

  // Exact Tasks requested by User + Real Referral tasks
  const tasks = [
    {
      id: 'task-3k-order',
      tag: '• TASK 1',
      title: '3K Orders Milestone (Get ₹2,300)',
      desc: 'If you do a ₹3,000 order or complete orders worth ₹3,000 total, you will get ₹2,300 cash reward.',
      reward: 2300,
      current: completedOrdersTotal,
      target: 3000,
      unit: '₹',
      isClaimed: claimedTasks.includes('task-3k-order'),
      isReadyToClaim: has3kOrder,
      actionText: 'Claim ₹2,300',
    },
    {
      id: 'task-15-orders',
      tag: '• TASK 2',
      title: '15 Orders Milestone (Get ₹1,000)',
      desc: 'If you do 15 completed orders on OK PAY, you will get ₹1,000 bonus.',
      reward: 1000,
      current: completedOrdersCount,
      target: 15,
      unit: 'Orders',
      isClaimed: claimedTasks.includes('task-15-orders'),
      isReadyToClaim: completedOrdersCount >= 15,
      actionText: 'Claim ₹1,000',
    },
    {
      id: 'task-invite-5orders',
      tag: '• TASK 3',
      title: 'Friend Completes 5 Orders (Get ₹500 More)',
      desc: 'If you invite a new user and the new user does 5 orders, then you get ₹500 more.',
      reward: 500,
      current: maxReferralOrders,
      target: 5,
      unit: 'Friend Orders',
      isClaimed: claimedTasks.includes('task-invite-5orders'),
      isReadyToClaim: totalReferrals > 0 && maxReferralOrders >= 5,
      actionText: 'Claim ₹500',
      isReferralTask: true,
    },
    {
      id: 'task-invite-friend',
      tag: '• REAL REFERRAL BONUS',
      title: 'Invite a New User (Get ₹500 from Tasks)',
      desc: 'Invite any new user to join OK PAY. You get an instant notification and ₹500 from tasks when they register!',
      reward: 500,
      current: totalReferrals,
      target: 1,
      unit: 'New Users',
      isClaimed: claimedTasks.includes('task-invite-friend'),
      isReadyToClaim: totalReferrals >= 1,
      actionText: 'Claim ₹500',
      isReferralTask: true,
    },
  ];

  const handleAction = (task: (typeof tasks)[0]) => {
    sounds.playTap();
    if (task.isClaimed) return;

    if (task.isReadyToClaim) {
      onRewardClaim(task.reward, task.title, task.id);
    } else if (task.isReferralTask && totalReferrals === 0) {
      onClose();
      if (onOpenTeam) onOpenTeam();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs select-none">
      <div className="w-full max-w-md h-[90vh] bg-[#F4F8F8] rounded-[28px] shadow-2xl flex flex-col overflow-hidden relative border border-white/20 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="pt-5 pb-3 px-4 flex items-center justify-between shrink-0 bg-white border-b border-gray-100">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1.5 text-[#0FA968] hover:bg-emerald-50 rounded-full cursor-pointer transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div className="text-center">
            <h1 className="text-xl font-black text-[#0FA968] tracking-tight">
              Task Rewards
            </h1>
            <p className="text-[11px] text-gray-500 font-medium">
              Complete milestones to earn real wallet bonuses
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Summary Stats Bar */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shrink-0 shadow-xs flex items-center justify-around text-center text-xs">
          <div>
            <span className="text-[10px] text-emerald-100 block font-medium">Completed Total</span>
            <span className="font-extrabold text-sm">₹{completedOrdersTotal.toLocaleString()}</span>
          </div>
          <div className="w-px h-6 bg-white/20" />
          <div>
            <span className="text-[10px] text-emerald-100 block font-medium">Total Orders</span>
            <span className="font-extrabold text-sm">{completedOrdersCount} Finished</span>
          </div>
          <div className="w-px h-6 bg-white/20" />
          <div>
            <span className="text-[10px] text-emerald-100 block font-medium">Real Referrals</span>
            <span className="font-extrabold text-sm">{totalReferrals} Friends</span>
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {tasks.map((task) => {
            const progressRatio = Math.min(1, task.current / (task.target || 1));

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-4 shadow-xs border transition-all ${
                  task.isClaimed
                    ? 'border-gray-100 opacity-80'
                    : task.isReadyToClaim
                    ? 'border-emerald-300 ring-2 ring-emerald-400/20 shadow-md'
                    : 'border-gray-100'
                }`}
              >
                {/* Tag & Progress text */}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span
                    className={`font-extrabold text-[11px] tracking-wide ${
                      task.isClaimed
                        ? 'text-gray-400'
                        : task.isReadyToClaim
                        ? 'text-[#0FA968]'
                        : 'text-amber-500'
                    }`}
                  >
                    {task.tag}
                  </span>

                  <div className="flex items-center space-x-2">
                    <div className="w-20 sm:w-28 h-2 bg-[#E6F4EE] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          task.isClaimed
                            ? 'bg-gray-400'
                            : 'bg-[#0FA968]'
                        }`}
                        style={{ width: `${progressRatio * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-gray-500 font-bold text-[11px] whitespace-nowrap">
                      {task.unit === '₹' ? `₹${task.current}` : task.current} / {task.unit === '₹' ? `₹${task.target}` : task.target}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-black text-sm text-gray-900 leading-snug">
                  {task.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-500 leading-relaxed font-normal mt-1">
                  {task.desc}
                </p>

                {/* Bottom Row: Star Reward & Action Button */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-2">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#0FA968] flex items-center justify-center text-white shadow-2xs">
                      <Star className="w-3.5 h-3.5 fill-white stroke-none" />
                    </div>
                    <span className="font-black text-base text-gray-900">
                      +₹{task.reward.toLocaleString()}
                    </span>
                  </div>

                  {/* Button state */}
                  {task.isClaimed ? (
                    <div className="flex items-center space-x-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0FA968]" />
                      <span>Claimed</span>
                    </div>
                  ) : task.isReadyToClaim ? (
                    <button
                      type="button"
                      onClick={() => handleAction(task)}
                      className="px-5 py-2 bg-[#0FA968] hover:bg-[#0c8e57] text-white text-xs font-black rounded-full shadow-[0_4px_14px_rgba(15,169,104,0.35)] cursor-pointer active:scale-95 transition-all flex items-center space-x-1 animate-pulse"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{task.actionText}</span>
                    </button>
                  ) : task.isReferralTask && totalReferrals === 0 ? (
                    <button
                      type="button"
                      onClick={() => handleAction(task)}
                      className="px-4 py-1.5 bg-[#0FA968] hover:bg-[#0c8e57] text-white text-xs font-bold rounded-full shadow-xs cursor-pointer active:scale-95 transition-all flex items-center space-x-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Invite Friends</span>
                    </button>
                  ) : (
                    <div className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                      In Progress ({task.current}/{task.target})
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-white border-t border-gray-100 shrink-0 text-center text-xs text-gray-500">
          <span>All task rewards credit directly to your active OK PAY balance.</span>
        </div>
      </div>
    </div>
  );
};
