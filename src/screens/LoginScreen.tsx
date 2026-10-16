import React, { useState } from 'react';
import { User as UserIcon, Lock, Eye, EyeOff, CheckCircle2, Smartphone } from 'lucide-react';
import { OkPayLogo } from '../components/OkPayLogo';

interface LoginScreenProps {
  onLogin: (phone: string, password: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  onGoToRegister: () => void;
  onGoToForgotPassword: () => void;
  onOpenPrivacy: () => void;
  onOpenAdmin?: () => void;
  onOpenDownloadApk?: () => void;
  initialPhone?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onGoToRegister,
  onGoToForgotPassword,
  onOpenPrivacy,
  onOpenAdmin,
  onOpenDownloadApk,
  initialPhone = '',
}) => {
  // Clean login interface: starts blank so new users have a clean slate
  const [phone, setPhone] = useState(initialPhone || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (initialPhone && initialPhone.trim().length > 0) {
      setPhone(initialPhone.trim());
    }
  }, [initialPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreePrivacy) {
      setError('Please agree to User Privacy Agreement');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await onLogin(phone.trim(), password);
      if (!res.success && res.error) {
        setError(res.error);
      }
    } catch {
      setError('Login failed. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8F8] flex flex-col justify-between max-w-md mx-auto shadow-2xl relative select-none">
      <div>
        {/* Logo Section */}
        <div className="flex flex-col items-center pt-10 pb-4 px-6">
          <OkPayLogo size="lg" className="mb-4" />
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-[11px] font-bold text-[#0FA968] shadow-2xs">
            <span>🎁</span>
            <span>New user login receives ₹30 instant bonus</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] text-gray-500 font-medium mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Unique User ID &amp; Balance Auto-Saved in Device Storage</span>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="px-8 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200 text-center font-medium">
              {error}
            </div>
          )}

          {/* Phone Field */}
          <div className="relative flex items-center bg-white rounded-full border border-gray-200/90 shadow-sm px-4 py-3 focus-within:border-[#0FA968] focus-within:ring-2 focus-within:ring-[#0FA968]/20 transition-all">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 mr-2">
              <UserIcon className="w-5 h-5 text-gray-400 stroke-[1.8]" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="w-full text-base bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none font-medium"
            />
          </div>

          {/* Password Field */}
          <div className="relative flex items-center bg-white rounded-full border border-gray-200/90 shadow-sm px-4 py-3 focus-within:border-[#0FA968] focus-within:ring-2 focus-within:ring-[#0FA968]/20 transition-all">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 mr-2">
              <Lock className="w-5 h-5 text-gray-400 stroke-[1.8]" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full text-base bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none font-medium tracking-wide"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Register & Remember Me Links */}
          <div className="flex items-center justify-between text-sm pt-1 px-1">
            <button
              type="button"
              onClick={onGoToRegister}
              className="text-[#0FA968] font-medium hover:underline cursor-pointer tracking-tight"
            >
              Register
            </button>
            <label className="flex items-center space-x-1.5 cursor-pointer text-gray-600 text-[13px]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-full accent-[#0FA968] cursor-pointer"
              />
              <span>Remember Me</span>
            </label>
          </div>

          {/* Privacy Agreement Checkbox */}
          <div className="flex items-center justify-center space-x-1.5 pt-3">
            <button
              type="button"
              onClick={() => setAgreePrivacy(!agreePrivacy)}
              className="cursor-pointer flex items-center space-x-1"
            >
              <CheckCircle2
                className={`w-4 h-4 transition-colors ${
                  agreePrivacy ? 'text-[#0FA968] fill-[#0FA968]/20' : 'text-gray-300'
                }`}
              />
              <span className="text-xs text-[#0FA968] font-medium hover:underline">
                Agree&quot;User Privacy Agreement&quot;
              </span>
            </button>
          </div>

          {/* Sign In Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#0FA968] hover:bg-[#0c8e57] active:scale-[0.98] text-white font-semibold rounded-full shadow-[0_6px_20px_rgba(15,169,104,0.35)] transition-all cursor-pointer text-base tracking-wide flex items-center justify-center space-x-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </div>

          {/* Forget Password */}
          <div className="text-center pt-3">
            <button
              type="button"
              onClick={onGoToForgotPassword}
              className="text-[#0FA968] text-xs font-medium hover:underline cursor-pointer"
            >
              Forget Password
            </button>
          </div>

          {/* Download Official APK Button for Fans */}
          {onOpenDownloadApk && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenDownloadApk}
                className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#0FA968] font-bold rounded-2xl border border-emerald-200/90 text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xs"
              >
                <Smartphone className="w-4 h-4 text-[#0FA968]" />
                <span>Download Android App (APK)</span>
                <span className="text-[10px] bg-[#0FA968] text-white px-2 py-0.5 rounded-full font-extrabold">
                  v2.4
                </span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Version footer */}
      <div className="pb-6 px-8 select-none flex flex-col items-center justify-center space-y-1">
        <div className="text-[11px] text-gray-500 font-medium flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>OK PAY Android Release • v2.4.0</span>
        </div>
      </div>
    </div>
  );
};
