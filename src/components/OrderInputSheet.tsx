import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, MapPin, Clock } from 'lucide-react';

interface OrderInputSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number, time: string, location: string }) => void;
}

const LOCATIONS = [
  "Antapani", "Arcamanik", "Cisaranten", "Kiaracondong", 
  "Babakan Sari", "Buah Batu", "Rancasari", "RS Al Islam", 
  "Soekarno Hatta", "Terminal Cicaheum", "Stasiun Bandung", "Pasteur", 
  "Cihapit", "Setiabudi", "Leuwipanjang", "Braga"
];

export function OrderInputSheet({ isVisible, onClose, onSubmit }: OrderInputSheetProps) {
  const [amount, setAmount] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [location, setLocation] = useState<string>(LOCATIONS[0]);

  useEffect(() => {
    if (isVisible) {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':'));
      setLocation(LOCATIONS[0]);
      setAmount('');
    }
  }, [isVisible]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsedAmount) && parsedAmount > 0 && time && location) {
      onSubmit({ amount: parsedAmount, time, location });
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setAmount(val);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full bg-white rounded-t-3xl border-t-4 border-x-4 border-[#111111] p-6 pb-12 shadow-[0px_-8px_0px_0px_rgba(0,0,0,0.1)] max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-[#111111]">Catat Order Baru</h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full border-2 border-transparent active:border-[#111111] transition-colors"
              >
                <X size={24} color="#111111" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Waktu Order</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <Clock size={20} />
                  </div>
                  <input 
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#111111] rounded-xl font-bold text-lg outline-none focus:ring-4 focus:ring-green-500/50 transition-all text-[#111111]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Lokasi Penjemputan</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <MapPin size={20} />
                  </div>
                  <select 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#111111] rounded-xl font-bold text-lg outline-none focus:ring-4 focus:ring-green-500/50 transition-all text-[#111111] appearance-none bg-white"
                  >
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Pendapatan Bersih (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">Rp</span>
                  <input 
                    type="text"
                    inputMode="numeric"
                    value={amount ? parseInt(amount).toLocaleString('id-ID') : ''}
                    onChange={handleAmountChange}
                    placeholder="0"
                    autoFocus
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#111111] rounded-xl font-bold text-xl outline-none focus:ring-4 focus:ring-green-500/50 transition-all text-[#111111]"
                  />
                </div>
                <p className="text-xs text-gray-500 font-medium">Masukkan nominal yang Anda dapatkan setelah potongan aplikasi.</p>
              </div>

              <button 
                type="submit"
                disabled={!amount || parseInt(amount) <= 0 || !time || !location}
                className="w-full h-14 mt-4 bg-green-500 text-white rounded-xl flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-transparent active:bg-green-600 transition-colors border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] disabled:shadow-none"
              >
                <Check size={24} className="stroke-[3px]" />
                <span className="text-lg font-extrabold uppercase tracking-wide">Simpan Data</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
