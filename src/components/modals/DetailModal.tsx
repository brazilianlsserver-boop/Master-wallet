import React, { useState } from 'react';
import { X, FileText, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';
import { AppState, Transaction, User } from '../../types';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  appState: AppState;
  transactions: Transaction[];
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  user,
  appState,
  transactions,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal' | 'claim_income'>('all');

  if (!isOpen) return null;

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'all') return true;
    return tx.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm max-h-[88vh] bg-white rounded-3xl p-5 shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-3">
          <FileText className="w-6 h-6 text-[#0FA968]" />
          <h2 className="text-lg font-bold text-gray-900">Financial Breakdown</h2>
        </div>

        {/* User Summary Card */}
        <div className="bg-[#FAFBFB] rounded-2xl p-4 border border-gray-100 space-y-2 mb-3 text-xs">
          <div className="flex justify-between text-gray-500">
            <span>Account:</span>
            <span className="font-bold text-gray-800">{user.phone} (ID: {user.id})</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Available Balance:</span>
            <span className="font-extrabold text-sm text-[#0FA968]">
              ₹ {appState.balance.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Total Deposit:</span>
            <span className="font-bold text-gray-800">₹ {appState.depositTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Total Withdrawal:</span>
            <span className="font-bold text-gray-800">₹ {appState.withdrawalTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Total Commission Rebate:</span>
            <span className="font-bold text-emerald-600">₹ {appState.commissionTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1.5 mb-2.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'claim_income', label: 'Earnings' },
            { id: 'deposit', label: 'Deposits' },
            { id: 'withdrawal', label: 'Withdrawals' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as typeof filterType)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-[#0FA968] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              No transactions found for this filter.
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs hover:bg-gray-100/60 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      tx.type === 'withdrawal'
                        ? 'bg-red-100 text-red-500'
                        : 'bg-emerald-100 text-[#0FA968]'
                    }`}
                  >
                    {tx.type === 'withdrawal' ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{tx.title}</div>
                    <div className="text-[10px] text-gray-400">{tx.date}</div>
                  </div>
                </div>

                <div
                  className={`font-black text-xs ${
                    tx.type === 'withdrawal' ? 'text-red-500' : 'text-emerald-600'
                  }`}
                >
                  {tx.type === 'withdrawal' ? '-' : '+'}₹ {tx.amount.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-3 py-3 bg-[#0FA968] text-white font-bold rounded-full shadow-md text-xs cursor-pointer hover:bg-[#0c8e57]"
        >
          Close Detail
        </button>
      </div>
    </div>
  );
};
