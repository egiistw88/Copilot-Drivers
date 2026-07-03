import React, { useState, useEffect } from 'react';
import { Map, Navigation, ArrowRight, Zap, CloudRain, ShieldAlert, Settings2, RefreshCw, ClipboardCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { MapView, HeatmapPoint } from './MapView';
import { Recommendation, DriverPosition, ShiftStats } from '../types';

interface HomeViewProps {
  score: number;
  locationName: string;
  driverPosition: DriverPosition;
  heatmapData: HeatmapPoint[];
  recommendation: Recommendation;
  contextPills: string[];
  shiftStats: ShiftStats;
  targetIncome: number;
  lastUpdated: Date;
  isLoading: boolean;
  driverConfig?: any;
  activeTargetLocation?: string | null;
  activeTargetAddress?: string | null;
  onNavigateRadar: () => void;
  onShowRecommendations: () => void;
  onStartWork: () => void;
  onCopilot: () => void;
  onResetStats: () => void;
  onSettings: () => void;
  onRecapShift: () => void;
}

export function HomeView({ score, locationName, driverPosition, heatmapData, recommendation, contextPills, shiftStats, targetIncome, lastUpdated, isLoading, driverConfig, activeTargetLocation, activeTargetAddress, onNavigateRadar, onShowRecommendations, onStartWork, onCopilot, onResetStats, onSettings, onRecapShift }: HomeViewProps) {
  const [timeAgo, setTimeAgo] = useState('Baru saja');
  
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
      if (diff < 10) setTimeAgo('Baru saja');
      else if (diff < 60) setTimeAgo(`${diff} dtk lalu`);
      else setTimeAgo(`${Math.floor(diff/60)} mnt lalu`);
    }, 5000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const incomeProgress = targetIncome > 0 ? Math.min(100, (shiftStats.income / targetIncome) * 100) : 0;

  return (
    <div className="flex flex-col h-full w-full bg-white text-[#111111] overflow-y-auto">
      
      {activeTargetLocation && (
        <div className="bg-[#111111] px-6 py-4 border-b-2 border-[#111111] flex items-center justify-between sticky top-0 z-[60]">
          <div className="flex flex-col text-white">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Target Lokasi</span>
            <span className="text-base font-extrabold">{activeTargetLocation}</span>
            {activeTargetAddress && (
              <span className="text-xs text-gray-300 font-medium truncate max-w-[220px] mt-0.5">{activeTargetAddress}</span>
            )}
          </div>
          <div className="h-10 w-10 bg-[#FFC107] rounded-full flex items-center justify-center border-2 border-[#111111]">
            <Navigation size={20} className="text-[#111111] stroke-2" />
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="px-6 py-4 flex justify-between items-center border-b-2 border-[#111111] bg-gray-50 sticky top-0 z-50">
        <div className="flex flex-col flex-1 truncate mr-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#111111]/70">Lokasi Realtime</span>
            {isLoading && <RefreshCw size={12} className="animate-spin text-[#111111]/50" />}
            {!isLoading && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
          </div>
          <span className="text-xl font-extrabold truncate">{locationName}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold text-gray-400">Sync: {timeAgo}</span>
            {driverConfig && (
              <>
                <span className="text-[10px] text-gray-300">•</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase px-1.5 py-0.5 bg-gray-200 rounded border border-gray-300">
                  {driverConfig.vehicleType === 'car' ? 'Mobil' : 'Motor'}
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase px-1.5 py-0.5 bg-gray-200 rounded border border-gray-300">
                  {driverConfig.serviceType === 'all' ? 'Semua' : driverConfig.serviceType === 'ride' ? 'Penumpang' : driverConfig.serviceType === 'food' ? 'Makanan' : 'Barang'}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {shiftStats.orders >= 1 && (
            <button 
              onClick={onRecapShift}
              className="w-12 h-12 rounded-full bg-green-500 border-2 border-[#111111] flex items-center justify-center shadow-[4px_4px_0px_0px_#111111] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <ClipboardCheck size={24} color="#ffffff" />
            </button>
          )}
          <button 
            onClick={onSettings}
            className="w-12 h-12 rounded-full bg-gray-100 border-2 border-transparent active:border-[#111111] flex items-center justify-center transition-colors"
          >
            <Settings2 size={24} color="#111111" />
          </button>
          <button 
            onClick={onCopilot}
            className="w-12 h-12 rounded-full bg-[#FFC107] border-2 border-[#111111] flex items-center justify-center shadow-[4px_4px_0px_0px_#111111] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <Zap size={24} color="#111111" fill="#111111" />
          </button>
        </div>
      </div>

      {/* Opportunity Score */}
      <div className="flex flex-col items-center justify-center py-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[80px] leading-none font-extrabold tracking-tighter"
        >
          {score}
        </motion.div>
        <span className="text-xl font-bold uppercase tracking-widest mt-2">
          {score >= 75 ? 'Peluang Tinggi' : score >= 50 ? 'Peluang Sedang' : 'Peluang Rendah'}
        </span>
      </div>

      {/* Shift Stats */}
      <div className="px-6 mb-6">
        <div className="bg-[#111111] text-white border-2 border-[#111111] rounded-2xl p-4 flex flex-col shadow-[6px_6px_0px_0px_#FFC107]">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-6">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-400">Order</span>
                <span className="text-2xl font-extrabold">{shiftStats.orders}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-400">Pendapatan</span>
                <span className="text-2xl font-extrabold">Rp {shiftStats.income.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <button 
              onClick={onResetStats}
              className="text-xs font-bold uppercase px-3 py-2 bg-red-500 rounded-lg active:bg-red-600 transition-colors"
            >
              Reset
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
              <span>Target</span>
              <span>Rp {targetIncome.toLocaleString('id-ID')}</span>
            </div>
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FFC107] transition-all duration-500 ease-out"
                style={{ width: `${incomeProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Card */}
      <div className="px-6 mb-6">
        <div className="bg-white border-2 border-[#111111] rounded-2xl p-5 shadow-[6px_6px_0px_0px_#111111]">
          <h3 className="text-lg font-bold mb-1">{recommendation.actionText}</h3>
          <p className="text-[#111111]/80 font-medium mb-4">
            Jarak {recommendation.distanceKm} km • Estimasi: {recommendation.etaMins} mnt
          </p>
          <button 
            onClick={onShowRecommendations}
            className="w-full h-16 bg-[#FFC107] border-2 border-[#111111] rounded-xl flex items-center justify-center gap-2 active:bg-[#e0a800] transition-colors"
          >
            <Navigation size={24} className="stroke-2" />
            <span className="text-xl font-bold">Pilih Tujuan Area</span>
          </button>
        </div>
      </div>

      {/* Status Pills */}
      <div className="px-6 mb-6 flex flex-wrap gap-2">
        {contextPills.map((pill, idx) => (
          <span key={idx} className="px-4 py-2 border-2 border-[#111111] rounded-full font-bold text-sm bg-white">
            {pill}
          </span>
        ))}
      </div>

      {/* Mini Heatmap Placeholder (Clickable) */}
      <div className="px-6 mb-6">
        <div 
          onClick={onNavigateRadar}
          className="w-full h-40 bg-gray-200 border-2 border-[#111111] rounded-xl overflow-hidden relative active:opacity-80 transition-opacity cursor-pointer group"
        >
          <div className="pointer-events-none absolute inset-0 z-0">
            <MapView 
              heatmapData={heatmapData}
              driverPosition={driverPosition}
              forceCenter={0}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent z-10"></div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-white border-2 border-[#111111] px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_#111111] group-active:translate-y-1 group-active:shadow-none transition-all">
            <Map size={18} />
            Buka Radar Peta
          </div>
        </div>
      </div>

      {/* Action to Start Work */}
      <div className="px-6 mt-auto pb-6">
        <button 
          onClick={onStartWork}
          className="w-full h-[72px] bg-[#111111] text-white rounded-xl flex items-center justify-center gap-2 active:bg-gray-800 transition-colors border-2 border-[#111111]"
        >
          <span className="text-xl font-bold uppercase tracking-widest">Mulai Shift</span>
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
}
