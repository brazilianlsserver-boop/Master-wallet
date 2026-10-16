import React from 'react';
import { X, Mail, Megaphone } from 'lucide-react';
import { Announcement } from '../../types';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcements?: Announcement[];
  onMarkRead?: (id: string) => void;
  userPhone?: string;
}

export const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  announcements = [],
  onMarkRead,
  userPhone,
}) => {
  if (!isOpen) return null;

  const visibleAnnouncements = announcements.filter(
    (item) => !item.targetPhone || item.targetPhone === userPhone
  );

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
          <Mail className="w-6 h-6 text-[#0FA968]" />
          <h2 className="text-lg font-bold text-gray-900">Notifications & Inbox</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {visibleAnnouncements.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">No announcements yet.</div>
          ) : (
            visibleAnnouncements.map((item) => (
              <div
                key={item.id}
                onClick={() => onMarkRead?.(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  item.priority === 'urgent'
                    ? 'bg-amber-50/70 border-amber-300'
                    : item.unread
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    {item.priority === 'urgent' && (
                      <Megaphone className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span className="text-xs font-bold text-gray-900">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{item.date}</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">{item.content}</p>
                {item.unread && (
                  <span className="inline-block mt-1 text-[9px] font-bold text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                    NEW
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-3 bg-[#0FA968] text-white font-bold rounded-full shadow-md text-xs cursor-pointer hover:bg-[#0c8e57] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
