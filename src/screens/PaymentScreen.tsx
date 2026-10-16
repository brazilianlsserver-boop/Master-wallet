import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, Sparkles, RefreshCw, Clock, ArrowRight, Trash2 } from 'lucide-react';
import { AppState, ClaimOrder } from '../types';
import { sounds } from '../utils/audio';

interface PaymentScreenProps {
  appState: AppState;
  orders: ClaimOrder[];
  activeOrder?: ClaimOrder | null;
  onClaimOrder: (order: ClaimOrder) => void;
  onOpenAddWallet: () => void;
  onRefreshOrders?: () => void;
  onCancelOrder?: (order: ClaimOrder) => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  appState,
  orders,
  activeOrder,
  onClaimOrder,
  onOpenAddWallet,
  onRefreshOrders,
  onCancelOrder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Top Picks');

  const categories = ['Top Picks', '100-499', '500-1999', '2000-4999'];

  const filteredOrders = orders.filter((order) => {
    if (selectedCategory === 'Top Picks') return true;
    return order.category === selectedCategory;
  });

  const availableCount = orders.filter((o) => o.status === 'available').length;

  return (
    <div className="pb-32 bg-[#F4F8F8] min-h-screen max-w-md mx-auto select-none">
      {/* Title */}
      <div className="pt-6 pb-3 text-center flex items-center justify-center space-x-2">
        <h1 className="text-xl font-bold text-[#0FA968] tracking-tight">Payment</h1>
      </div>

      <div className="px-4 space-y-3.5">
        {/* Green Hero Cashback Card */}
        <div className="relative rounded-[24px] bg-gradient-to-br from-[#0FA968] via-[#0E9F62] to-[#0A8752] p-5 text-white shadow-[0_8px_25px_rgba(15,169,104,0.25)] overflow-hidden">
          {/* Decorative graphic: chart bars & sun spheres */}
          <div className="absolute top-0 right-0 w-36 h-36 pointer-events-none overflow-hidden">
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-amber-400 rounded-full opacity-90" />
            <div className="absolute top-8 right-1 w-24 h-24 bg-blue-500 rounded-full opacity-85" />
          </div>

          <div className="relative z-10">
            {/* Top Row: Cashback + Abstract Bar Chart */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-emerald-100">Cashback</span>
                <div className="text-3xl font-black tracking-tight mt-0.5">
                  {(appState?.commissionRate ?? 4.2).toFixed(1)}%
                </div>
              </div>

              {/* Stylized Bar Chart */}
              <div className="flex items-end space-x-1.5 h-14 pr-4">
                <div className="w-2.5 h-6 bg-white/40 rounded-t-sm" />
                <div className="w-2.5 h-10 bg-white/70 rounded-t-sm" />
                <div className="w-2.5 h-14 bg-white rounded-t-sm shadow-sm" />
                <div className="w-2.5 h-8 bg-white/60 rounded-t-sm" />
                <div className="w-2.5 h-11 bg-white/80 rounded-t-sm" />
              </div>
            </div>

            {/* Bottom Sub-Cards Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {/* Balance Card */}
              <div className="bg-white/15 backdrop-blur-xs rounded-xl p-3 border border-white/20">
                <span className="text-[11px] text-emerald-100 block font-medium">Balance</span>
                <div className="text-xl font-extrabold tracking-tight mt-0.5">
                  ∫ {(appState?.balance ?? 0).toFixed(0)}
                </div>
              </div>

              {/* Reward & Pending Cards */}
              <div className="space-y-1.5">
                <div className="bg-white/15 backdrop-blur-xs rounded-xl px-3 py-1.5 border border-white/20 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-100 font-medium">Reward</span>
                  <span className="text-sm font-bold">∫ {(appState?.rewardTotal ?? 0).toFixed(0)}</span>
                </div>
                <div className="bg-white/15 backdrop-blur-xs rounded-xl px-3 py-1.5 border border-white/20 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-100 font-medium">Pending</span>
                  <span className="text-sm font-bold">∫ {(appState?.pendingTotal ?? 0).toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <button
          type="button"
          onClick={onOpenAddWallet}
          className="w-full bg-[#ECFDF5] border border-emerald-200/80 rounded-xl p-3 flex items-center space-x-2 text-left cursor-pointer hover:bg-emerald-100/50 transition-colors"
        >
          <AlertTriangle className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="text-xs text-emerald-800 font-medium leading-relaxed">
            Please use FamPay, Freecharge, Paytm, or MoneyView wallet for payment!
          </span>
        </button>

        {/* Active Claimed Order Card: Shows immediately when user has an active order */}
        {activeOrder && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled' && (
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-[#0FA968]/30 rounded-2xl p-4 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/50">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0FA968] animate-ping" />
                <span className="text-xs font-extrabold text-[#0FA968] uppercase tracking-wide">
                  Active Claimed Order
                </span>
                <span className="bg-[#111827] text-[#FFC727] text-[9px] font-black px-1.5 py-0.2 rounded">
                  FamPay QR
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-gray-700">
                {activeOrder.id}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div>
                <div className="text-xs text-gray-600">
                  Amount: <span className="text-sm font-extrabold text-gray-900">₹{(activeOrder?.amount ?? 0).toLocaleString()}</span>
                </div>
                <div className="text-xs font-bold text-emerald-600">
                  Total Return: +₹{((activeOrder?.amount ?? 0) + (activeOrder?.income ?? 0)).toFixed(2)}
                </div>
              </div>

              <div className="text-right">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeOrder.utr
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {activeOrder.utr
                    ? 'UTR Submitted'
                    : 'Awaiting Payment & UTR'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  onClaimOrder(activeOrder);
                }}
                className="py-2 px-3 bg-[#0FA968] hover:bg-[#0c8e57] text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1 cursor-pointer shadow-xs transition-transform active:scale-95"
              >
                <span>{activeOrder.utr ? 'View Order' : 'Pay / UTR'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {onCancelOrder && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    onCancelOrder(activeOrder);
                  }}
                  className="py-2 px-3 bg-white hover:bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cancel Order</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Filter Pills with Available Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  sounds.playTap();
                  setSelectedCategory(cat);
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0FA968] text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {onRefreshOrders && (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onRefreshOrders();
              }}
              title="Refresh available orders"
              className="p-2 bg-white rounded-full text-gray-500 hover:text-[#0FA968] border border-gray-100 shadow-2xs cursor-pointer shrink-0 ml-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Order Claim Cards List */}
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-xs shadow-xs border border-gray-100">
              <p>No orders currently available in this range.</p>
              {onRefreshOrders && (
                <button
                  type="button"
                  onClick={onRefreshOrders}
                  className="mt-3 px-4 py-1.5 bg-emerald-50 text-[#0FA968] font-bold rounded-full text-xs hover:bg-emerald-100 cursor-pointer"
                >
                  Load New Orders
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex items-center justify-between transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="text-sm font-extrabold text-[#0FA968] tracking-wide">
                      {order.currency}
                    </span>
                    <span className="bg-[#111827] text-[#FFC727] text-[9px] font-black px-1.5 py-0.2 rounded">
                      FamPay QR
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-gray-800">
                    Amount: <span className="font-extrabold">∫ {order.amount.toLocaleString()}</span>
                  </div>
                  <div className="text-xs font-bold text-red-500 mt-0.5">
                    Income:+{order.income}
                  </div>
                </div>

                {/* Claim Button: Enforces single active order policy */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    onClaimOrder(order);
                  }}
                  disabled={order.status === 'claimed' || order.status === 'completed'}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap ${
                    order.status === 'claimed' || order.status === 'completed'
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : activeOrder && activeOrder.id === order.id
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold hover:bg-amber-200'
                      : activeOrder && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled'
                      ? 'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-amber-50 hover:text-amber-700 cursor-not-allowed'
                      : order.status === 'processing'
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300 font-extrabold'
                      : 'bg-[#0FA968] hover:bg-[#0c8e57] text-white active:scale-95'
                  }`}
                >
                  {order.status === 'claimed' || order.status === 'completed'
                    ? 'Claimed'
                    : activeOrder && activeOrder.id === order.id
                    ? activeOrder.utr
                      ? 'Under Review'
                      : 'In Progress'
                    : activeOrder && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled'
                    ? '1 Order Active'
                    : order.status === 'processing'
                    ? 'Under Review'
                    : 'Claim'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
