import React, { useState } from 'react';
import { X, Zap, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { ClaimOrder } from '../../types';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: ClaimOrder[];
  onSelectOrder?: (order: ClaimOrder) => void;
  onCancelOrder?: (order: ClaimOrder) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  orders,
  onSelectOrder,
  onCancelOrder,
}) => {
  const [filter, setFilter] = useState<'all' | 'claimed' | 'processing' | 'available'>('all');

  if (!isOpen) return null;

  const filtered = orders.filter((o) => {
    if (filter === 'claimed') return o.status === 'claimed' || o.status === 'completed';
    if (filter === 'processing') return o.status === 'processing';
    if (filter === 'available') return o.status === 'available';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm max-h-[80vh] bg-white rounded-3xl p-6 shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-3">
          <Zap className="w-6 h-6 text-violet-600" />
          <h2 className="text-lg font-bold text-gray-900">Order Records</h2>
        </div>

        {/* Filter buttons */}
        <div className="flex space-x-1.5 mb-3 overflow-x-auto no-scrollbar">
          {(['all', 'claimed', 'processing', 'available'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize cursor-pointer transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-[#0FA968] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'processing' ? 'Under Review' : f}
            </button>
          ))}
        </div>

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              No orders found in this category.
            </div>
          ) : (
            filtered.map((order) => (
              <div
                key={order.id}
                onClick={() => {
                  if (onSelectOrder) {
                    onClose();
                    onSelectOrder(order);
                  }
                }}
                className={`p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between transition-colors ${
                  onSelectOrder ? 'hover:bg-emerald-50/50 cursor-pointer' : ''
                }`}
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-gray-900">{order.id}</span>
                    <span className="text-[10px] bg-emerald-100 text-[#0FA968] font-bold px-1.5 py-0.2 rounded">
                      {order.currency}
                    </span>
                    <span className="bg-[#111827] text-[#FFC727] font-black text-[9px] px-1.5 py-0.2 rounded">
                      FamPay
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-0.5">
                    Principal: ∫ {order.amount.toLocaleString()}
                  </div>
                  <div className="text-xs font-bold text-red-500">
                    Profit: +₹{order.income}
                  </div>
                </div>

                <div className="text-right flex flex-col items-end space-y-1">
                  {order.status === 'claimed' || order.status === 'completed' ? (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Claimed</span>
                    </span>
                  ) : order.status === 'processing' ? (
                    <>
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Under Review</span>
                      </span>
                      {onCancelOrder && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            onCancelOrder(order);
                          }}
                          className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-full flex items-center space-x-0.5 cursor-pointer mt-1"
                          title="Cancel Order"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Ready</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
