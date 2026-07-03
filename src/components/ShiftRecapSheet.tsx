import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, FileText } from 'lucide-react';

interface ShiftRecapSheetProps {
  isVisible: boolean;
  onClose: () => void;
  shiftStats: { orders: number; income: number };
  orderHistory: { id: string, amount: number, time: string, location: string }[];
  onSubmit: (details: { grossIncome: number; expenses: number; netIncome: number }) => void;
}

export function ShiftRecapSheet({ isVisible, onClose, shiftStats, orderHistory, onSubmit }: ShiftRecapSheetProps) {
  const [grossIncome, setGrossIncome] = useState<string>('');
  const [expenseFuel, setExpenseFuel] = useState<string>('');
  const [expenseFood, setExpenseFood] = useState<string>('');

  useEffect(() => {
    if (isVisible) {
      setGrossIncome(shiftStats.income.toString());
      setExpenseFuel('0');
      setExpenseFood('0');
    }
  }, [isVisible, shiftStats.income]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedGross = parseInt(grossIncome.replace(/[^0-9]/g, ''), 10) || 0;
    const parsedFuel = parseInt(expenseFuel.replace(/[^0-9]/g, ''), 10) || 0;
    const parsedFood = parseInt(expenseFood.replace(/[^0-9]/g, ''), 10) || 0;
    
    const totalExpenses = parsedFuel + parsedFood;
    const netIncome = parsedGross - totalExpenses;

    onSubmit({
      grossIncome: parsedGross,
      expenses: totalExpenses,
      netIncome: netIncome
    });
  };

  const getNumber = (val: string) => parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
  
  const currentGross = getNumber(grossIncome);
  const currentFuel = getNumber(expenseFuel);
  const currentFood = getNumber(expenseFood);
  const currentNet = currentGross - currentFuel - currentFood;

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
            className="relative w-full bg-white rounded-t-3xl border-t-4 border-x-4 border-[#111111] p-6 pb-12 shadow-[0px_-8px_0px_0px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center border-2 border-[#111111]">
                  <FileText size={20} className="stroke-[2.5px]" />
                </div>
                <h2 className="text-2xl font-extrabold text-[#111111]">Rekap Shift</h2>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full border-2 border-transparent active:border-[#111111] transition-colors"
              >
                <X size={24} color="#111111" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pb-4">
              <form id="recap-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl mb-4">
                  <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Total Order Diselesaikan</p>
                  <p className="text-3xl font-black text-[#111111]">{shiftStats.orders} Order</p>
                </div>

                {orderHistory && orderHistory.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Riwayat Order Hari Ini</p>
                    <div className="space-y-3">
                      {orderHistory.map(order => (
                        <div key={order.id} className="flex items-center justify-between p-4 border-2 border-[#111111] rounded-xl bg-white shadow-[4px_4px_0px_0px_#111111]">
                          <div>
                            <p className="font-extrabold text-[#111111] text-lg">{order.location}</p>
                            <p className="text-sm text-gray-600 font-bold">{order.time}</p>
                          </div>
                          <p className="font-black text-green-600 text-lg">+ Rp {order.amount.toLocaleString('id-ID')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Total Pemasukan (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">Rp</span>
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={grossIncome ? parseInt(grossIncome.replace(/[^0-9]/g, '')).toLocaleString('id-ID') : ''}
                      onChange={(e) => setGrossIncome(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full pl-12 pr-4 py-3 border-2 border-[#111111] rounded-xl font-bold text-xl outline-none focus:ring-4 focus:ring-blue-500/50 transition-all text-[#111111]"
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Sesuaikan jika ada perbedaan dengan realita.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Pengeluaran Bensin (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">Rp</span>
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={expenseFuel ? parseInt(expenseFuel.replace(/[^0-9]/g, '')).toLocaleString('id-ID') : ''}
                      onChange={(e) => setExpenseFuel(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-3 border-2 border-[#111111] rounded-xl font-bold text-xl outline-none focus:ring-4 focus:ring-red-500/50 transition-all text-[#111111]"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Makan & Parkir (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">Rp</span>
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={expenseFood ? parseInt(expenseFood.replace(/[^0-9]/g, '')).toLocaleString('id-ID') : ''}
                      onChange={(e) => setExpenseFood(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-3 border-2 border-[#111111] rounded-xl font-bold text-xl outline-none focus:ring-4 focus:ring-red-500/50 transition-all text-[#111111]"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-300">
                  <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider text-center">Pendapatan Bersih Hari Ini</p>
                  <p className={`text-4xl font-black text-center ${currentNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currentNet < 0 ? '-' : ''}Rp {Math.abs(currentNet).toLocaleString('id-ID')}
                  </p>
                </div>
              </form>
            </div>

            <div className="pt-4 shrink-0 bg-white border-t-2 border-gray-100">
              <button 
                form="recap-form"
                type="submit"
                className="w-full h-16 bg-[#111111] text-white rounded-xl flex items-center justify-center gap-2 active:bg-gray-800 transition-colors border-2 border-[#111111] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none"
              >
                <Check size={28} className="stroke-[3px]" />
                <span className="text-xl font-extrabold uppercase tracking-wide">Selesaikan Shift</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
