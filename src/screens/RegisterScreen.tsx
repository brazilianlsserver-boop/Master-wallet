import React, { useState } from 'react';
import { ArrowLeft, User, Lock, Phone, Link as LinkIcon } from 'lucide-react';

interface RegisterScreenProps {
  onBackToLogin: () => void;
  onRegisterSuccess: (userData: { phone: string; name: string; password: string; inviteCode?: string }) => void;
  initialInviteCode?: string;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onBackToLogin,
  onRegisterSuccess,
  initialInviteCode,
}) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [inviteCode, setInviteCode] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const fromUrl = urlParams.get('ref') || urlParams.get('invite');
      if (fromUrl && fromUrl.trim()) return fromUrl.trim();
      const stored = localStorage.getItem('okpay_pending_ref_code');
      if (stored && stored.trim()) return stored.trim();
    } catch {
      // ignore
    }
    return initialInviteCode || '894215';
  });
  const [error, setError] = useState('');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError('Please enter a User Name');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!phone || phone.length < 8) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    onRegisterSuccess({ phone: phone.trim(), name: userName.trim(), password, inviteCode: inviteCode.trim() });
  };

  return (
    <div className="min-h-screen bg-[#F4F8F8] flex flex-col justify-between max-w-md mx-auto shadow-2xl relative select-none">
      <div>
        {/* Top Header */}
        <div className="relative flex items-center justify-center px-4 pt-6 pb-4 mb-2">
          <button
            type="button"
            onClick={onBackToLogin}
            className="absolute left-4 p-2 text-[#0FA968] hover:bg-emerald-50 rounded-full cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          <h1 className="text-xl font-bold text-[#0FA968] tracking-tight">Register</h1>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSignUp} className="px-6 space-y-4 pt-2">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200 text-center font-medium">
              {error}
            </div>
          )}

          {/* 1. User Name */}
          <div className="relative flex items-center bg-white rounded-2xl border border-gray-200/90 shadow-xs px-4 py-3.5 focus-within:border-[#0FA968] transition-all">
            <User className="w-5 h-5 text-gray-400 mr-3 stroke-[1.8]" />
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="User Name"
              className="w-full text-base bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
            />
          </div>

          {/* 2. Password */}
          <div className="relative flex items-center bg-white rounded-2xl border border-gray-200/90 shadow-xs px-4 py-3.5 focus-within:border-[#0FA968] transition-all">
            <Lock className="w-5 h-5 text-gray-400 mr-3 stroke-[1.8]" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full text-base bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
            />
          </div>

          {/* 3. Phone (+91) */}
          <div className="relative flex items-center bg-white rounded-2xl border border-gray-200/90 shadow-xs px-4 py-3.5 focus-within:border-[#0FA968] transition-all">
            <Phone className="w-5 h-5 text-gray-400 mr-2 stroke-[1.8]" />
            <span className="text-[#0FA968] font-bold text-sm mr-2 pl-1 border-r border-gray-200 pr-2">
              +91
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="w-full text-base bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none font-medium"
            />
          </div>

          {/* 4. Invite Code */}
          <div className="relative flex items-center bg-white rounded-2xl border border-gray-200/90 shadow-xs px-4 py-3.5 focus-within:border-[#0FA968] transition-all">
            <LinkIcon className="w-5 h-5 text-gray-400 mr-3 stroke-[1.8]" />
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Invite Code"
              className="w-full text-base bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
            />
          </div>

          {/* Sign Up Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#0FA968] hover:bg-[#0c8e57] active:scale-[0.98] text-white font-semibold rounded-full shadow-[0_6px_20px_rgba(15,169,104,0.35)] transition-all cursor-pointer text-base tracking-wide"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>

      <div className="pb-6" />
    </div>
  );
};
