import React, { useState } from 'react';
import { X, ShieldCheck, Check } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPin: string;
  onSavePin: (newPin: string) => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  currentPin,
  onSavePin,
}) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPin && oldPin !== currentPin) {
      setError('Current PIN is incorrect (Default: 123456)');
      return;
    }
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      setError('New PIN must be exactly 6 numeric digits');
      return;
    }
    if (newPin !== confirmPin) {
      setError('Confirmation PIN does not match');
      return;
    }

    setError('');
    onSavePin(newPin);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
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

        <div className="flex items-center space-x-2 mb-3">
          <ShieldCheck className="w-6 h-6 text-[#0FA968]" />
          <h2 className="text-lg font-bold text-gray-900">Security PIN Settings</h2>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Required for withdrawals and sensitive wallet modifications.
        </p>

        {error && (
          <div className="p-2.5 mb-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {success ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#0FA968] flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <p className="text-sm font-bold text-gray-800">Security PIN Updated!</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Current PIN (Default: 123456)
              </label>
              <input
                type="password"
                maxLength={6}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="123456"
                className="w-full p-2.5 rounded-xl border border-gray-200 text-sm tracking-widest text-center focus:border-[#0FA968] focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                New 6-Digit PIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Enter 6 digits"
                className="w-full p-2.5 rounded-xl border border-gray-200 text-sm tracking-widest text-center focus:border-[#0FA968] focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Confirm New PIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Repeat 6 digits"
                className="w-full p-2.5 rounded-xl border border-gray-200 text-sm tracking-widest text-center focus:border-[#0FA968] focus:outline-none font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-3 bg-[#0FA968] text-white font-bold rounded-full shadow-md text-xs cursor-pointer hover:bg-[#0c8e57]"
            >
              Update Security PIN
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
