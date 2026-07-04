import React from 'react';
import { ArrowLeft, Navigation, TrendingUp, AlertTriangle, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { Recommendation } from '../types';

interface WorkModeViewProps {
  onAddOrderClick: () => void;
  activeTargetLocation?: string | null;
  score: number;
  recommendation: Recommendation | null;
  targetIncome: number;
  onStopWork: () => void;
  onNavigate?: () => void;
  onReportQuiet?: () => void;
}

export function WorkModeView({ score, recommendation, activeTargetLocation, onStopWork, onNavigate, onReportQuiet, onAddOrderClick }: WorkModeViewProps) {
  const isGoodScore = score >= 75;

  return (
    <div className="flex flex-col h-full w-full bg-[#111111] text-white overflow-y-auto overflow-x-hidden p-6">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <button 
          onClick={onStopWork}
          className="w-14 h-14 bg-white border-4 border-white rounded-full flex items-center justify-center text-[#111111] active:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={28} className="stroke-[3px]" />
        </button>
        <div className="flex flex-col items-end">
          <span className="text-xl font-extrabold uppercase tracking-widest text-[#FFC107]">Shift Aktif</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-bold text-gray-300">Menyala Abangku</span>
          </div>
        </div>
      </div>

      <div className="flex-auto flex flex-col items-center justify-center relative min-h-[300px] py-4 shrink-0">
        {/* Glow effect based on score */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none ${isGoodScore ? 'bg-green-500' : 'bg-red-500'}`} />
        
        <span className="text-gray-400 font-bold uppercase tracking-widest mb-4 z-10">Peluang Area Ini</span>
        <motion.div 
          key={score}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-[100px] leading-none font-black tracking-tighter drop-shadow-lg z-10 ${isGoodScore ? 'text-green-500' : 'text-[#FFC107]'}`}
        >
          {score}
        </motion.div>
        
        {recommendation && (
          <div className="mt-6 bg-black/40 px-6 py-4 rounded-2xl border border-white/10 text-center max-w-[280px] z-10">
            <span className="text-xl font-extrabold uppercase block mb-1">
              {isGoodScore ? 'Bertahan' : 'Pindah Lokasi'}
            </span>
            <span className="text-sm font-medium text-gray-300">
              {activeTargetLocation ? `Anda sedang menuju: ${activeTargetLocation}` : (isGoodScore ? 'Potensi order tinggi di area Anda saat ini.' : `Disarankan geser ke ${recommendation.targetLocation} (${recommendation.distanceKm}km).`)}
            </span>
            {!isGoodScore && (
              <button 
                onClick={onNavigate}
                className="mt-4 w-full py-2.5 bg-[#FFC107] text-[#111111] font-bold rounded-xl flex items-center justify-center gap-2 active:bg-[#e0a800] transition-colors"
              >
                <Navigation size={18} className="stroke-2" />
                Jadikan Target Lokasi
              </button>
            )}
          </div>
        )}
      </div>

      <div className="w-full mt-auto mb-2 space-y-4 pt-4 shrink-0">
        <button 
          onClick={onAddOrderClick}
          className="w-full h-16 bg-[#FFC107] text-[#111111] rounded-2xl flex flex-col items-center justify-center active:translate-y-1 transition-all border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] active:shadow-none font-bold uppercase"
        >
          <span className="flex items-center gap-2"><Plus size={20} className="stroke-[3px]" /> Input Pendapatan Order</span>
        </button>

        <button 
          onClick={() => {
            if (onReportQuiet) onReportQuiet();
            else alert("Laporan 'Sepi' dikirim!");
          }}
          className="w-full h-16 bg-[#2a2a2a] border-b-4 border-black text-gray-400 rounded-2xl flex flex-col items-center justify-center active:translate-y-1 active:border-b-0 transition-all hover:text-white hover:bg-[#333]"
        >
          <span className="text-sm font-bold uppercase flex items-center gap-2"><AlertTriangle size={20} /> Lapor Kondisi Area & Analisa</span>
        </button>
      </div>
    </div>
  );
}
