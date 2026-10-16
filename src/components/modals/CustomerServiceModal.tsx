import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User as UserIcon } from 'lucide-react';

interface CustomerServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export const CustomerServiceModal: React.FC<CustomerServiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! I am your OK PAY assistant. How can I assist your earning & payment journey today?',
      time: '14:43',
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const quickQuestions = [
    'How do I claim orders?',
    'Which wallets are supported?',
    'How long does withdrawal take?',
    'What is the commission rate?',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Generate responsive bot answer
    setTimeout(() => {
      let reply = "Our customer support team is available 24/7. Your query has been logged.";
      const lower = text.toLowerCase();
      if (lower.includes('order') || lower.includes('claim')) {
        reply = "Go to the 'Payment' tab, browse the available orders, and click 'Claim'. Each completed claim gives you 4.2% cashback immediately!";
      } else if (lower.includes('wallet') || lower.includes('paytm') || lower.includes('freecharge')) {
        reply = "We recommend Freecharge, Paytm, or MoneyView wallet. You can also bind UPI, USDT TRC20, or Bank Card in the 'Tool' tab!";
      } else if (lower.includes('withdraw')) {
        reply = "Withdrawals are processed instantly to your bound wallet. Default transaction PIN is 123456, which you can customize in 'Pin' settings.";
      } else if (lower.includes('commission') || lower.includes('rate')) {
        reply = "The standard commission cashback rate is 4.20% per completed transaction cycle.";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm h-[580px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0FA968] p-4 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">OK PAY Support</h3>
              <div className="flex items-center space-x-1 text-[11px] text-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                <span>Online 24/7</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full cursor-pointer hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Question Chips */}
        <div className="px-3 py-2 bg-emerald-50/70 border-b border-emerald-100/50 flex space-x-1.5 overflow-x-auto no-scrollbar">
          {quickQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 bg-white border border-emerald-200 text-[#0FA968] text-[11px] font-semibold rounded-full whitespace-nowrap hover:bg-emerald-50 cursor-pointer shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#F8FAF9]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
                  msg.sender === 'user' ? 'bg-sky-500' : 'bg-[#0FA968]'
                }`}
              >
                {msg.sender === 'user' ? (
                  <UserIcon className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#0FA968] text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-100 shadow-2xs rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
                <span
                  className={`text-[9px] block text-right mt-1 ${
                    msg.sender === 'user' ? 'text-emerald-100' : 'text-gray-400'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-2.5 bg-white border-t border-gray-100 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-800 focus:outline-none focus:border-[#0FA968]"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            className="p-2 rounded-full bg-[#0FA968] text-white hover:bg-[#0c8e57] cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
