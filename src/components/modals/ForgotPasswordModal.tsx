import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordReset?: (phone: string, newPass: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onPasswordReset,
}) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = () => {
    if (!phone) {
      setStatusMsg('Please enter your phone number');
      return;
    }
    const mockOtp = '882104';
    setOtp(mockOtp);
    setStatusMsg(`Simulated OTP sent to ${phone}: ${mockOtp}`);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !otp || !newPassword) {
      setStatusMsg('Please fill in all fields');
      return;
    }
    if (onPasswordReset) {
      onPasswordReset(phone.trim(), newPassword);
    }
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-1">Reset Password</h2>
        <p className="text-xs text-gray-500 mb-4">Enter your registered mobile number</p>

        {statusMsg && (
          <div className="p-2.5 mb-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">
            {statusMsg}
          </div>
        )}

        {success ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#0FA968] flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <p className="text-sm font-bold text-gray-800">Password Reset Successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit phone number"
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#0FA968] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">OTP</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  className="flex-1 p-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#0FA968] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-3 py-2 bg-[#0FA968] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Get OTP
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#0FA968] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-3 bg-[#0FA968] text-white font-bold rounded-full shadow-md text-xs cursor-pointer"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
