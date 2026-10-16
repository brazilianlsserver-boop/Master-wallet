import React from 'react';
import { Home, CreditCard, Users, User } from 'lucide-react';
import { sounds } from '../utils/audio';

export type TabType = 'home' | 'payment' | 'tool' | 'statistics' | 'my';

interface BottomNavBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onTabChange }) => {
  const handleTab = (tab: TabType) => {
    sounds.playTap();
    onTabChange(tab);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] select-none">
      <div className="flex items-end justify-around px-2 pt-1.5 pb-2">
        {/* 1: Home */}
        <button
          type="button"
          onClick={() => handleTab('home')}
          className="flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors"
        >
          <div className="relative">
            <Home
              className={`w-6 h-6 transition-transform ${
                currentTab === 'home'
                  ? 'text-[#0FA968] fill-[#0FA968] scale-105'
                  : 'text-gray-300'
              }`}
            />
          </div>
          <span
            className={`text-[11px] font-semibold mt-1 tracking-tight ${
              currentTab === 'home' ? 'text-[#0FA968]' : 'text-gray-500'
            }`}
          >
            Home
          </span>
        </button>

        {/* 2: Payment */}
        <button
          type="button"
          onClick={() => handleTab('payment')}
          className="flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors"
        >
          <div className="relative">
            <CreditCard
              className={`w-6 h-6 transition-transform ${
                currentTab === 'payment'
                  ? 'text-[#0FA968] fill-[#0FA968] scale-105'
                  : 'text-gray-300'
              }`}
            />
          </div>
          <span
            className={`text-[11px] font-semibold mt-1 tracking-tight ${
              currentTab === 'payment' ? 'text-[#0FA968]' : 'text-gray-500'
            }`}
          >
            Payment
          </span>
        </button>

        {/* 3: Center Tool Floating Button */}
        <button
          type="button"
          onClick={() => handleTab('tool')}
          className="flex flex-col items-center justify-center flex-1 cursor-pointer group -mt-5 relative z-10"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
              currentTab === 'tool'
                ? 'bg-[#F5B800] ring-4 ring-[#F5B800]/30 scale-105'
                : 'bg-[#F7BD1E] hover:scale-105'
            }`}
          >
            {/* Wallet with radiating spark vector icon */}
            <svg
              viewBox="0 0 36 36"
              className="w-8 h-8 drop-shadow"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Radiating beams on top */}
              <path d="M18 4L18 8" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              <path d="M11 6L13 9" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M25 6L23 9" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />

              {/* Little coin emerging */}
              <circle cx="18" cy="9.5" r="3.2" fill="#FFFFFF" />
              <text x="18" y="11.5" textAnchor="middle" fill="#F5B800" fontSize="4.2" fontWeight="bold">
                $
              </text>

              {/* Wallet body */}
              <rect x="7" y="11.5" width="22" height="17" rx="3.5" fill="#2E384D" />
              {/* Wallet flap latch */}
              <path
                d="M21 17 C21 15.5 29 15.5 29 17 L29 23 C29 24.5 21 24.5 21 23 Z"
                fill="#1E293B"
              />
              {/* Clasp button */}
              <circle cx="24" cy="20" r="1.8" fill="#10B981" />
            </svg>
          </div>
        </button>

        {/* 4: Statistics */}
        <button
          type="button"
          onClick={() => handleTab('statistics')}
          className="flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors"
        >
          <div className="relative">
            <Users
              className={`w-6 h-6 transition-transform ${
                currentTab === 'statistics'
                  ? 'text-[#0FA968] fill-[#0FA968] scale-105'
                  : 'text-gray-300'
              }`}
            />
          </div>
          <span
            className={`text-[11px] font-semibold mt-1 tracking-tight ${
              currentTab === 'statistics' ? 'text-[#0FA968]' : 'text-gray-500'
            }`}
          >
            Statistics
          </span>
        </button>

        {/* 5: My */}
        <button
          type="button"
          onClick={() => handleTab('my')}
          className="flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors"
        >
          <div className="relative">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                currentTab === 'my'
                  ? 'bg-[#0FA968] text-white scale-105'
                  : 'border-2 border-gray-300 text-gray-300'
              }`}
            >
              <User className="w-4 h-4" />
            </div>
          </div>
          <span
            className={`text-[11px] font-semibold mt-1 tracking-tight ${
              currentTab === 'my' ? 'text-[#0FA968]' : 'text-gray-500'
            }`}
          >
            My
          </span>
        </button>
      </div>
    </div>
  );
};
