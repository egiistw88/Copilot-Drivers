import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, X, Send, Sparkles } from 'lucide-react';

interface CopilotSheetProps {
  isVisible: boolean;
  onClose: () => void;
  contextData: {
    score: number;
    demandLevel: string;
    locationName: string;
    weather: string;
    contextPills: string[];
    config?: any;
  };
  onWarning?: (msg: string) => void;
}

export function CopilotSheet({ isVisible, onClose, contextData, onWarning }: CopilotSheetProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Halo Abangku! Ada yang bisa dibantu untuk shift hari ini? Lagi sepi atau butuh info area?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', text }],
          context: contextData
        })
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (!data.text) throw new Error('No text returned');
      setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
      
      if (data.fallback && onWarning) {
        onWarning("Server AI sedang sibuk. Menggunakan sistem heuristik lokal sementara.");
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Waduh, koneksi ke pusat lagi gangguan nih. Coba lagi ya.' }]);
      if (onWarning) {
        onWarning("Koneksi jaringan terganggu. Beralih ke mode offline.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#111111]/60 z-[1900] backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="absolute bottom-0 left-0 right-0 z-[2000] bg-white border-t-4 border-[#111111] rounded-t-3xl pt-2 pb-6 px-4 flex flex-col max-h-[85vh] h-full shadow-[0px_-8px_0px_0px_rgba(17,17,17,0.1)]"
          >
            <div className="w-16 h-1.5 bg-[#111111]/20 rounded-full mx-auto mb-4 shrink-0" />
            
            <div className="flex justify-between items-center mb-4 px-2 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={24} className="text-[#FFC107]" />
                <h3 className="text-2xl font-black uppercase tracking-wide">AI Copilot</h3>
              </div>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full active:bg-gray-200">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-4 mb-4 flex flex-col">
              {messages.map((msg, idx) => (
                <div key={idx} className={`max-w-[85%] p-4 rounded-2xl border-2 border-[#111111] ${msg.role === 'ai' ? 'bg-[#FFC107] self-start rounded-tl-none shadow-[4px_4px_0px_0px_#111111]' : 'bg-white self-end rounded-tr-none shadow-[-4px_4px_0px_0px_#111111]'}`}>
                  <p className="font-bold text-[#111111] leading-snug">{msg.text}</p>
                </div>
              ))}
              {isLoading && (
                <div className="max-w-[85%] p-4 rounded-2xl border-2 border-[#111111] bg-[#FFC107] self-start rounded-tl-none shadow-[4px_4px_0px_0px_#111111]">
                  <p className="font-bold text-[#111111] leading-snug animate-pulse">Lagi mikir...</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Tanya info seputar orderan..."
                className="flex-1 h-14 px-4 border-2 border-[#111111] rounded-xl font-bold text-lg outline-none focus:ring-4 focus:ring-[#FFC107]/50 transition-all"
              />
              <button 
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="w-14 h-14 bg-[#111111] text-white rounded-xl flex items-center justify-center disabled:bg-gray-400 active:scale-95 transition-transform"
              >
                <Send size={24} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
