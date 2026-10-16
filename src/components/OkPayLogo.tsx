import React from 'react';

interface OkPayLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const OkPayLogo: React.FC<OkPayLogoProps> = ({ size = 'lg', className = '' }) => {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  return (
    <div
      className={`relative rounded-[28px] p-2.5 shadow-xl flex flex-col items-center justify-center overflow-hidden select-none bg-gradient-to-b from-[#310b5c] via-[#210943] to-[#12042b] ${sizeMap[size]} ${className}`}
      style={{
        boxShadow: '0 12px 30px -4px rgba(49, 11, 92, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
      }}
    >
      {/* Background glow highlights */}
      <div className="absolute -top-10 -left-10 w-24 h-24 bg-pink-500/20 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl pointer-events-none" />

      {/* Modern stylized OK vector */}
      <svg
        viewBox="0 0 120 70"
        className="w-full h-auto max-h-[60%] drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="oGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FACC15" />
            <stop offset="30%" stopColor="#FB923C" />
            <stop offset="70%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>
          <linearGradient id="kGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="kGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>

        {/* 'O' shape: thick smooth rounded donut ring */}
        <circle
          cx="38"
          cy="36"
          r="23"
          stroke="url(#oGrad)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* 'K' shape: stem + 2 branches */}
        {/* vertical stem */}
        <rect x="66" y="13" width="11" height="46" rx="5.5" fill="url(#kGrad2)" />

        {/* upper slanted arm */}
        <path
          d="M74 38L96 16"
          stroke="url(#kGrad)"
          strokeWidth="11"
          strokeLinecap="round"
        />

        {/* lower slanted arm */}
        <path
          d="M75 36L97 56"
          stroke="url(#kGrad)"
          strokeWidth="11"
          strokeLinecap="round"
        />
      </svg>

      {/* Subtext 'P A Y' */}
      <span className="text-white font-black tracking-[0.38em] text-[15px] pl-1.5 mt-0.5 leading-none drop-shadow">
        PAY
      </span>
    </div>
  );
};
