import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Navigation, Utensils, Package, Wallet, Banknote, HelpCircle } from 'lucide-react';

const kecamatanBandung = ["Andir","Antapani","Arcamanik","Astana Anyar","Babakan Ciparay","Bandung Kidul","Bandung Kulon","Bandung Wetan","Batununggal","Bojongloa Kaler","Bojongloa Kidul","Buahbatu","Cibeunying Kaler","Cibeunying Kidul","Cibiru","Cicendo","Cidadap","Cinambo","Coblong","Gedebage","Kiaracondong","Lengkong","Mandalajati","Panyileukan","Rancasari","Regol","Sukajadi","Sukasari","Sumur Bandung","Ujungberung"];

export interface OrderData {
  location: string;
  time: string;
  serviceType: string;
  amount: number;
  tips: number;
  paymentMethod: string;
}

interface OrderInputDialogProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: OrderData) => void;
  defaultService?: string;
}

export function OrderInputDialog({ isVisible, onClose, onSubmit, defaultService = 'ride' }: OrderInputDialogProps) {
  const [amountStr, setAmountStr] = useState('');
  const [tipsStr, setTipsStr] = useState('');
  const [serviceType, setServiceType] = useState(defaultService === 'all' ? 'ride' : defaultService);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wallet'>('wallet');
  const [location, setLocation] = useState(kecamatanBandung[0]);
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(amountStr.replace(/\D/g, ''), 10);
    const tips = parseInt(tipsStr.replace(/\D/g, ''), 10) || 0;
    
    if (!isNaN(amount) && amount > 0) {
      onSubmit({ amount, tips, serviceType, paymentMethod, location, time });
      setAmountStr('');
      setTipsStr('');
      onClose();
    }
  };

  const formatRupiah = (val: string) => {
    const num = val.replace(/\D/g, '');
    if (!num) return '';
    return 'Rp ' + parseInt(num, 10).toLocaleString('id-ID');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full sm:max-w-md bg-white border-t-4 sm:border-4 border-[#111111] rounded-t-3xl sm:rounded-3xl p-6 pb-8 shadow-[0px_-8px_0px_0px_rgba(17,17,17,0.1)] sm:shadow-[8px_8px_0px_0px_#111111] max-h-[90vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 sm:hidden" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border-2 border-transparent active:border-[#111111] transition-colors hidden sm:flex"
            >
              <X size={24} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-black uppercase text-[#111111]">Input Orderan</h2>
              <p className="text-gray-500 font-medium">Catat detail pendapatan harian dengan lengkap.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Waktu Order</label>
                  <input 
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 text-lg font-bold border-2 border-[#111111] rounded-xl outline-none focus:ring-4 focus:ring-[#FFC107]/50 transition-all bg-gray-50 text-[#111111]"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Kecamatan (BDO)</label>
                  <select 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 text-lg font-bold border-2 border-[#111111] rounded-xl outline-none focus:ring-4 focus:ring-[#FFC107]/50 transition-all bg-gray-50 text-[#111111] appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23111\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                  >
                    {kecamatanBandung.map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Jenis Layanan</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setServiceType('ride')}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold flex flex-col items-center gap-1 transition-colors ${serviceType === 'ride' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-gray-50 text-gray-400 border-gray-200 active:border-[#111111]'}`}
                  >
                    <Navigation size={20} />
                    <span className="text-xs">Ride</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceType('food')}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold flex flex-col items-center gap-1 transition-colors ${serviceType === 'food' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-gray-50 text-gray-400 border-gray-200 active:border-[#111111]'}`}
                  >
                    <Utensils size={20} />
                    <span className="text-xs">Food</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceType('send')}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold flex flex-col items-center gap-1 transition-colors ${serviceType === 'send' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-gray-50 text-gray-400 border-gray-200 active:border-[#111111]'}`}
                  >
                    <Package size={20} />
                    <span className="text-xs">Send</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Metode Pembayaran</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold flex flex-col items-center gap-1 transition-colors ${paymentMethod === 'wallet' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-gray-50 text-gray-400 border-gray-200 active:border-[#111111]'}`}
                  >
                    <Wallet size={20} />
                    <span className="text-xs">Non-Tunai</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold flex flex-col items-center gap-1 transition-colors ${paymentMethod === 'cash' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-gray-50 text-gray-400 border-gray-200 active:border-[#111111]'}`}
                  >
                    <Banknote size={20} />
                    <span className="text-xs">Tunai</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Tarif Bersih (Net)</label>
                  <input 
                    type="text"
                    inputMode="numeric"
                    value={formatRupiah(amountStr)}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="Rp 0"
                    className="w-full px-4 py-4 text-2xl font-black border-2 border-[#111111] rounded-xl outline-none focus:ring-4 focus:ring-[#FFC107]/50 transition-all bg-gray-50 text-[#111111]"
                    autoFocus
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Tips (Opsional)</label>
                  <input 
                    type="text"
                    inputMode="numeric"
                    value={formatRupiah(tipsStr)}
                    onChange={(e) => setTipsStr(e.target.value)}
                    placeholder="Rp 0"
                    className="w-full px-4 py-4 text-2xl font-black border-2 border-[#111111] rounded-xl outline-none focus:ring-4 focus:ring-[#FFC107]/50 transition-all bg-gray-50 text-[#111111]"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={!amountStr}
                className="w-full h-16 bg-[#FFC107] text-[#111111] font-bold rounded-xl flex items-center justify-center gap-2 border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] disabled:opacity-50 disabled:active:shadow-[4px_4px_0px_0px_#111111] disabled:active:translate-y-0 disabled:active:translate-x-0 active:translate-y-1 active:translate-x-1 active:shadow-none mt-2 transition-all uppercase tracking-widest text-lg"
              >
                <Check size={24} className="stroke-[3px]" />
                Simpan Pendapatan
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
