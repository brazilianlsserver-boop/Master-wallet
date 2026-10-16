import React, { useMemo } from 'react';
import { CreditCard, DollarSign, RefreshCw, Coins, ArrowRightLeft, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { AppState } from '../types';
import { sounds } from '../utils/audio';

interface StatisticsScreenProps {
  appState: AppState;
  onToggleSelling: () => void;
  onOpenExchangeModal: () => void;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({
  appState,
  onToggleSelling,
  onOpenExchangeModal,
}) => {
  const currentDate = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY

  const handleToggle = () => {
    sounds.playTap();
    onToggleSelling();
  };

  // Generate 7-day trend data reflecting user earnings
  const trendData = useMemo(() => {
    const days: Array<{ day: string; earnings: number; orders: number }> = [];
    const today = new Date();
    
    // Past 6 days base progression
    const pastValues = [65, 110, 145, 190, 240, 310];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue, etc.
      
      let amount = 0;
      let orderCount = 0;
      if (i === 0) {
        // Today reflects real active commission total + base
        amount = Math.max(30, Number((appState.commissionTotal + 30).toFixed(0)));
        orderCount = Math.max(1, Math.round(amount / 25));
      } else {
        amount = pastValues[6 - i];
        orderCount = Math.round(amount / 28);
      }

      days.push({
        day: dayLabel,
        earnings: amount,
        orders: orderCount,
      });
    }
    return days;
  }, [appState.commissionTotal]);

  const total7Days = useMemo(() => {
    return trendData.reduce((acc, curr) => acc + curr.earnings, 0);
  }, [trendData]);

  return (
    <div className="pb-32 bg-[#F4F8F8] min-h-screen max-w-md mx-auto select-none">
      {/* Title */}
      <div className="pt-6 pb-3 text-center">
        <h1 className="text-xl font-bold text-[#0FA968] tracking-tight">Statistics</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* Main Card */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100">
          {/* Section 1: Statistics with Date */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-1.5 h-4 bg-[#0FA968] rounded-full" />
            <h2 className="text-sm font-extrabold text-gray-900 tracking-tight">
              Statistics <span className="text-gray-400 font-normal">({currentDate})</span>
            </h2>
          </div>

          {/* 2x2 Grid for General Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* 1. Balance */}
            <div className="bg-[#FAFBFB] rounded-xl p-3 border border-gray-50 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">Balance</span>
                <span className="text-sm font-bold text-gray-800">
                  ₹ {(appState?.balance ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* 2. Sell */}
            <div className="bg-[#FAFBFB] rounded-xl p-3 border border-gray-50 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                S$
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">Sell</span>
                <span className="text-sm font-bold text-gray-800">
                  ₹ {(appState?.sellTotal ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* 3. Deposit */}
            <div className="bg-[#FAFBFB] rounded-xl p-3 border border-gray-50 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">Deposit</span>
                <span className="text-sm font-bold text-gray-800">
                  ₹ {(appState?.depositTotal ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* 4. Commission */}
            <div className="bg-[#FAFBFB] rounded-xl p-3 border border-gray-50 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-rose-400 text-white flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">Commission</span>
                <span className="text-sm font-bold text-gray-800">
                  ₹ {(appState?.commissionTotal ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: 7-Day Performance Trend Chart */}
          <div className="pt-2 border-t border-gray-100 mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-4 bg-[#0FA968] rounded-full" />
                <h2 className="text-sm font-extrabold text-gray-900 tracking-tight">
                  7-Day Earnings Trend
                </h2>
              </div>
              <div className="flex items-center space-x-1 text-xs font-bold text-[#0FA968] bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+42.8%</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-2 px-1">
              <span>7D Total: <b className="text-gray-900 font-extrabold">₹{total7Days.toLocaleString()}</b></span>
              <span>Daily Avg: <b className="text-[#0FA968] font-bold">₹{(total7Days / 7).toFixed(0)}</b></span>
            </div>

            {/* Recharts Area Chart */}
            <div className="w-full h-44 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0FA968" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0FA968" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F4F2" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as { day: string; earnings: number; orders: number };
                        return (
                          <div className="bg-gray-900 text-white p-2.5 rounded-xl shadow-lg text-xs">
                            <div className="font-semibold text-gray-300">{data.day}</div>
                            <div className="font-extrabold text-[#34D399] text-sm mt-0.5">
                              ₹{data.earnings}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              {data.orders} claims settled
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#0FA968"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#earningsGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 3: Payment */}
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-1.5 h-4 bg-[#0FA968] rounded-full" />
            <h2 className="text-sm font-extrabold text-gray-900 tracking-tight">Payment</h2>
          </div>

          {/* Real Time Exchange Rates box */}
          <button
            type="button"
            onClick={onOpenExchangeModal}
            className="w-full bg-[#E8F7F0] border border-emerald-100 rounded-xl px-4 py-2.5 flex items-center justify-between mb-3 text-left hover:bg-emerald-100/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <ArrowRightLeft className="w-4 h-4 text-[#0FA968]" />
              <span className="text-xs font-semibold text-[#0FA968]">
                Real Time Exchange Rates(INR/USDT)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black text-[#0FA968] font-mono">
                {appState?.usdtRate ?? 112}
              </span>
              <span className="text-[9px] bg-amber-100 text-amber-700 font-extrabold px-1.5 py-0.5 rounded-full">
                Coming Soon
              </span>
            </div>
          </button>

          {/* 2x2 Grid for Payment processing */}
          <div className="grid grid-cols-2 gap-3">
            {/* In Process Amount */}
            <div className="bg-[#FAFBFB] rounded-xl p-3 border border-gray-50 flex items-center space-x-2.5">
              <Coins className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="text-[11px] text-gray-400 block font-medium">In Process Amount</span>
                <span className="text-xs font-bold text-gray-800">
                  ₹ {(appState?.inProcessAmount ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* In Process Orders */}
            <div className="bg-[#FAFBFB] rounded-xl p-3 border border-gray-50 flex items-center space-x-2.5">
              <Coins className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="text-[11px] text-gray-400 block font-medium">In Process Orders</span>
                <span className="text-xs font-bold text-gray-800">
                  {appState?.inProcessOrders ?? 0}
                </span>
              </div>
            </div>

            {/* Commission Rate */}
            <div className="bg-[#FAFBFB] rounded-xl p-3 border border-gray-50 flex items-center space-x-2.5">
              <Coins className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="text-[11px] text-gray-400 block font-medium">Commission Rate</span>
                <span className="text-xs font-bold text-gray-800">
                  {(appState?.commissionRate ?? 4.2).toFixed(2)} %
                </span>
              </div>
            </div>

            {/* Estimated Income */}
            <div className="bg-[#FAFBFB] rounded-xl p-3 border border-gray-50 flex items-center space-x-2.5">
              <Coins className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="text-[11px] text-gray-400 block font-medium">Estimated Income</span>
                <span className="text-xs font-bold text-gray-800">
                  ₹ {((appState.inProcessAmount * appState.commissionRate) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Big Yellow Selling Button matching screenshot */}
        <div className="pt-2 space-y-2.5">
          {appState.isSellingActive && (
            <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3 flex items-center justify-between shadow-2xs animate-in fade-in">
              <div className="flex items-center space-x-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-800">Auto-Matching Pool Online</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#0FA968] animate-pulse">Syncing orders...</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleToggle}
            className={`w-full py-4 px-6 text-white text-base font-black rounded-full transition-all cursor-pointer active:scale-[0.98] ${
              appState.isSellingActive
                ? 'bg-[#0FA968] shadow-[0_8px_25px_rgba(15,169,104,0.35)]'
                : 'bg-[#F5B800] hover:bg-[#e0a800] shadow-[0_8px_25px_rgba(245,184,0,0.35)]'
            }`}
          >
            {appState.isSellingActive ? 'Selling Active (Tap to Close)' : 'Closed Selling'}
          </button>
          <p className="text-center text-[11px] text-gray-400">
            {appState.isSellingActive
              ? '● System is accepting and matching orders automatically'
              : 'Tap to start order dispatch and earning commissions'}
          </p>
        </div>
      </div>
    </div>
  );
};
