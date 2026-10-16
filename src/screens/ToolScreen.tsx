import React from 'react';
import { Plus, Wallet as WalletIcon, Trash2, CheckCircle } from 'lucide-react';
import { Wallet } from '../types';

interface ToolScreenProps {
  wallets: Wallet[];
  onOpenAddWallet: () => void;
  onDeleteWallet: (id: string) => void;
  onSetDefaultWallet: (id: string) => void;
}

export const ToolScreen: React.FC<ToolScreenProps> = ({
  wallets,
  onOpenAddWallet,
  onDeleteWallet,
  onSetDefaultWallet,
}) => {
  return (
    <div className="pb-32 bg-[#F4F8F8] min-h-screen max-w-md mx-auto select-none">
      {/* Header */}
      <div className="pt-6 pb-4 text-center">
        <h1 className="text-xl font-bold text-[#0FA968] tracking-tight">Tool</h1>
      </div>

      <div className="px-6 pt-16">
        {wallets.length === 0 ? (
          /* Exact empty state matching Screenshot 1 */
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-base font-semibold text-[#0FA968] mb-8">
              No wallets yet
            </p>

            <button
              type="button"
              onClick={onOpenAddWallet}
              className="w-full py-3 px-6 bg-[#0FA968] hover:bg-[#0c8e57] text-white text-base font-bold rounded-full shadow-[0_6px_20px_rgba(15,169,104,0.3)] active:scale-[0.98] transition-all cursor-pointer"
            >
              Add
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700">Bound Wallets ({wallets.length})</span>
              <button
                type="button"
                onClick={onOpenAddWallet}
                className="flex items-center space-x-1 text-xs font-bold text-[#0FA968] hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Wallet</span>
              </button>
            </div>

            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0FA968] flex items-center justify-center font-bold">
                    <WalletIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900">{wallet.type}</span>
                      {wallet.isDefault && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">
                      {wallet.accountNumber}
                    </div>
                    <div className="text-[11px] text-gray-400">{wallet.accountName}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!wallet.isDefault && (
                    <button
                      type="button"
                      onClick={() => onSetDefaultWallet(wallet.id)}
                      className="text-xs text-gray-400 hover:text-[#0FA968] p-1 cursor-pointer"
                      title="Set as Default"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteWallet(wallet.id)}
                    className="text-xs text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                    title="Delete Wallet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={onOpenAddWallet}
              className="w-full mt-4 py-3 bg-[#0FA968] hover:bg-[#0c8e57] text-white text-sm font-bold rounded-full shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Wallet</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
