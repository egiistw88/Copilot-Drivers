import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, TrendingUp, Clock, Package, Wallet, Banknote, HelpCircle } from 'lucide-react';
import { OrderData } from './OrderInputDialog';

export interface OrderRecord extends OrderData {
  id: string;
  timestamp: string;
}

interface ShiftSummarySheetProps {
  isVisible: boolean;
  onClose: () => void;
  orders: OrderRecord[];
  onReset: () => void;
}

export function ShiftSummarySheet({ isVisible, onClose, orders, onReset }: ShiftSummarySheetProps) {
  const totalIncome = orders.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalTips = orders.reduce((acc, curr) => acc + (curr.tips || 0), 0);
  const orderCount = orders.length;
  
  const cashIncome = orders.filter(o => o.paymentMethod === 'cash').reduce((acc, curr) => acc + (curr.amount || 0) + (curr.tips || 0), 0);
  const walletIncome = orders.filter(o => o.paymentMethod === 'wallet').reduce((acc, curr) => acc + (curr.amount || 0) + (curr.tips || 0), 0);
  
  const avgIncome = orderCount > 0 ? Math.round(totalIncome / orderCount) : 0;
  
  const formatIDR = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[4000] flex flex-col justify-end sm:justify-center items-center sm:p-4">
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
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-x-4 sm:border-x-4 border-[#111111] p-6 pb-12 shadow-[0px_-8px_0px_0px_rgba(0,0,0,0.1)] sm:shadow-[8px_8px_0px_0px_#111111] h-fit max-h-[90vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 sm:hidden" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border-2 border-transparent active:border-[#111111] transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-6 mt-2">
              <div className="p-3 bg-[#10b981] border-2 border-[#111111] rounded-full">
                <CheckCircle2 size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase text-[#111111] tracking-tight">Shift Selesai</h2>
                <p className="text-gray-500 font-bold">Kerja bagus hari ini! Ini hasilmu.</p>
              </div>
            </div>

            <div className="bg-[#FFC107] border-4 border-[#111111] rounded-2xl p-6 shadow-[8px_8px_0px_0px_#111111] mb-6 relative overflow-hidden">
              <span className="text-sm font-bold uppercase tracking-widest text-[#111111]/70 block mb-1">Total Pendapatan</span>
              <span className="text-4xl font-black text-[#111111] tracking-tighter">{formatIDR(totalIncome + totalTips)}</span>
              {totalTips > 0 && (
                 <span className="text-xs font-bold text-[#111111]/70 block mt-1">+ {formatIDR(totalTips)} (Tips)</span>
              )}
              <TrendingUp size={120} className="absolute -right-6 -bottom-6 text-[#111111] opacity-10" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 border-2 border-[#111111] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#111111]">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Banknote size={18} />
                  <span className="text-xs font-bold uppercase">Uang Tunai</span>
                </div>
                <span className="text-xl font-black text-green-600">{formatIDR(cashIncome)}</span>
              </div>
              
              <div className="bg-gray-50 border-2 border-[#111111] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#111111]">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Wallet size={18} />
                  <span className="text-xs font-bold uppercase">Non-Tunai</span>
                </div>
                <span className="text-xl font-black">{formatIDR(walletIncome)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Package size={18} />
                  <span className="text-xs font-bold uppercase">Total Order</span>
                </div>
                <span className="text-2xl font-black">{orderCount}</span>
              </div>
              
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <TrendingUp size={18} />
                  <span className="text-xs font-bold uppercase">Rata-rata</span>
                </div>
                <span className="text-xl font-black">{formatIDR(avgIncome)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={onClose}
                className="w-full h-16 bg-[#111111] text-white font-bold rounded-xl flex items-center justify-center gap-2 active:bg-gray-800 transition-colors border-2 border-[#111111] text-lg uppercase tracking-widest"
              >
                Lanjut Nanti
              </button>
              
              <button 
                onClick={() => {
                  onClose();
                  onReset();
                }}
                className="w-full h-16 bg-red-100 text-red-600 font-bold rounded-xl flex items-center justify-center gap-2 active:bg-red-200 transition-colors border-2 border-red-200 text-sm uppercase tracking-widest"
              >
                Reset Data Shift
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
