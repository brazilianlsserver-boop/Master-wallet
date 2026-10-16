import React from 'react';
import { sounds } from '../utils/audio';

interface RobotMascotProps {
  onClick?: () => void;
  className?: string;
  badge?: string;
}

export const RobotMascot: React.FC<RobotMascotProps> = ({ onClick, className = '', badge }) => {
  const handleClick = () => {
    sounds.playTap();
    if (onClick) onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Customer Support Assistant"
      className={`fixed bottom-20 right-4 sm:right-6 z-40 transition-transform active:scale-90 hover:scale-105 cursor-pointer drop-shadow-lg group ${className}`}
    >
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-md group-hover:bg-emerald-400/50 transition-colors" />

        {/* Mascot SVG */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Top antenna */}
            <path
              d="M50 18 L50 8 M46 11 L54 11"
              stroke="#10B981"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="50" cy="7" r="4" fill="#34D399" />

            {/* Left and right headset ear pads */}
            <rect x="14" y="38" width="12" height="30" rx="6" fill="#047857" />
            <rect x="74" y="38" width="12" height="30" rx="6" fill="#047857" />

            {/* Headset top band */}
            <path
              d="M20 42 C 24 16, 76 16, 80 42"
              stroke="#047857"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Main Robot Face Container */}
            <rect
              x="22"
              y="26"
              width="56"
              height="50"
              rx="20"
              fill="#10B981"
              stroke="#059669"
              strokeWidth="3"
            />

            {/* Inner Face Screen (light mint green) */}
            <rect
              x="28"
              y="32"
              width="44"
              height="38"
              rx="14"
              fill="#ECFDF5"
            />

            {/* Cute Oval Eyes */}
            <ellipse cx="40" cy="48" rx="5" ry="7" fill="#065F46" />
            <ellipse cx="60" cy="48" rx="5" ry="7" fill="#065F46" />
            <circle cx="38.5" cy="45.5" r="2" fill="#FFFFFF" />
            <circle cx="58.5" cy="45.5" r="2" fill="#FFFFFF" />

            {/* Cheerful Smile */}
            <path
              d="M45 57 Q 50 62 55 57"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Headset Mic arm */}
            <path
              d="M74 56 C 74 68, 62 74, 56 73"
              stroke="#065F46"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Mic ball */}
            <circle cx="53" cy="73" r="3.5" fill="#047857" />
          </svg>
        </div>

        {/* Optional notification badge or online dot */}
        {badge ? (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
            {badge}
          </span>
        ) : (
          <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
        )}
      </div>
    </button>
  );
};
