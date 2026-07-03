import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface FinalReceiptProps {
  isVisible: boolean;
  onClose: () => void;
  data: {
    date: string;
    totalOrders: number;
    grossIncome: number;
    expenses: number;
    netIncome: number;
    orderHistory: { id: string; amount: number; time: string; location: string }[];
  } | null;
}

export function FinalReceiptModal({ isVisible, onClose, data }: FinalReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async () => {
    if (receiptRef.current) {
      setDownloading(true);
      try {
        const canvas = await html2canvas(receiptRef.current, { 
          backgroundColor: '#ffffff', 
          scale: 2,
          logging: false,
          useCORS: true
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `Rekap_Maxim_${data?.date.replace(/\//g, '-')}.png`;
        link.click();
      } catch (err) {
        console.error("Error generating image", err);
      } finally {
        setDownloading(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && data && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm flex flex-col gap-4 z-10 max-h-[90vh]"
          >
            {/* The Receipt to capture */}
            <div 
              ref={receiptRef}
              className="bg-white p-6 rounded-2xl border-4 border-[#111111] shadow-[8px_8px_0px_0px_#111111] relative overflow-hidden"
            >
              {/* Receipt Header */}
              <div className="text-center mb-6 border-b-2 border-dashed border-gray-300 pb-6">
                <div className="w-16 h-16 bg-[#FFC107] rounded-full border-2 border-[#111111] mx-auto mb-3 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-[#111111]" />
                </div>
                <h2 className="text-2xl font-black text-[#111111] uppercase tracking-wider">Rekap Harian</h2>
                <p className="text-gray-500 font-bold mt-1">{data.date}</p>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-xl border-2 border-[#111111]">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Order</p>
                  <p className="text-xl font-black text-[#111111]">{data.totalOrders}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-xl border-2 border-[#111111]">
                  <p className="text-xs text-green-600 font-bold uppercase mb-1">Pendapatan</p>
                  <p className="text-xl font-black text-green-700">Rp {data.netIncome.toLocaleString('id-ID')}</p>
                </div>
              </div>

              {/* Order History */}
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider border-b-2 border-[#111111] pb-2">Riwayat Perjalanan</p>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {data.orderHistory.length > 0 ? data.orderHistory.map(order => (
                    <div key={order.id} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-[#111111] text-sm">{order.location}</p>
                        <p className="text-xs text-gray-500 font-semibold">{order.time}</p>
                      </div>
                      <p className="font-black text-green-600 text-sm">Rp {order.amount.toLocaleString('id-ID')}</p>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 italic text-center py-4">Belum ada riwayat order tercatat hari ini.</p>
                  )}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-gray-100 p-4 rounded-xl border-2 border-[#111111] space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-600">Total Kotor</span>
                  <span className="font-bold text-[#111111]">Rp {data.grossIncome.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-600">Pengeluaran</span>
                  <span className="font-bold text-red-500">- Rp {data.expenses.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-full h-0.5 bg-[#111111] my-2 border-dashed"></div>
                <div className="flex justify-between items-center text-base">
                  <span className="font-black text-[#111111] uppercase tracking-wider">Bersih</span>
                  <span className="font-black text-green-600 text-lg">Rp {data.netIncome.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 h-14 bg-blue-500 text-white rounded-xl flex items-center justify-center gap-2 font-extrabold uppercase tracking-wide border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] active:translate-y-1 active:shadow-none transition-all disabled:opacity-75 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0px_0px_#111111]"
              >
                <Download size={20} className="stroke-[3px]" />
                {downloading ? 'Memproses...' : 'Simpan Gambar'}
              </button>
              
              <button 
                onClick={onClose}
                className="w-14 h-14 bg-white text-[#111111] rounded-xl flex items-center justify-center border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] active:translate-y-1 active:shadow-none transition-all shrink-0"
              >
                <X size={24} className="stroke-[3px]" />
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
