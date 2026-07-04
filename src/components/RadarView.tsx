import React, { useState, useEffect } from 'react';
import { MapView } from './MapView';
import { X, Layers, Navigation, ChevronLeft, CloudRain, Sun, Cloud, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RadarViewProps {
  onSelectZone?: (zone: any) => void;
  onClose: () => void;
  driverPosition: { lat: number; lng: number };
  heatmapData: Array<[number, number, number]>;
  topZones?: any[];
  weather?: string;
}

export function RadarView({ onClose, driverPosition, heatmapData, topZones = [], weather = "Cerah", onSelectZone }: RadarViewProps) {
  const [activeLayers, setActiveLayers] = useState<string[]>(['heatmap']);
  const [forceCenter, setForceCenter] = useState(0);
  const [showLayers, setShowLayers] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleLayer = (layer: string) => {
    setActiveLayers(prev => 
      prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]
    );
  };

  const getWeatherIcon = (w: string) => {
    if (w.toLowerCase().includes('hujan') || w.toLowerCase().includes('gerimis')) return <CloudRain size={20} className="text-blue-500" />;
    if (w.toLowerCase().includes('awan') || w.toLowerCase().includes('mendung')) return <Cloud size={20} className="text-gray-500" />;
    return <Sun size={20} className="text-orange-500" />;
  };

  return (
    <div className="relative w-full h-full bg-white flex flex-col">
      {/* Map Container */}
      <div className="flex-1 relative">
        <MapView 
          heatmapData={activeLayers.includes('heatmap') ? heatmapData : []} 
          topZones={activeLayers.includes('heatmap') ? topZones : []}
          driverPosition={driverPosition} 
          forceCenter={forceCenter}
        />
        
        {/* Top Controls */}
        <div className="absolute top-4 left-4 z-[1000]">
          <button 
            onClick={onClose}
            className="w-14 h-14 bg-white border-2 border-[#111111] rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_#111111] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <ChevronLeft size={32} />
          </button>
        </div>

        {/* Time and Weather Overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <div className="bg-white border-2 border-[#111111] rounded-full px-4 py-2 flex items-center gap-3 shadow-[4px_4px_0px_0px_#111111]">
            <div className="flex items-center gap-1.5 border-r-2 border-gray-200 pr-3">
              <Clock size={18} className="text-[#111111]" />
              <span className="font-bold text-[#111111] text-lg">{currentTime}</span>
            </div>
            <div className="flex items-center gap-1.5 pl-1">
              {getWeatherIcon(weather)}
              <span className="font-bold text-sm text-[#111111] max-w-[80px] truncate">{weather}</span>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-3">
          <button 
            onClick={() => setForceCenter(prev => prev + 1)}
            className="w-14 h-14 bg-white border-2 border-[#111111] rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_#111111] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <Navigation size={28} />
          </button>
          <button 
            onClick={() => setShowLayers(!showLayers)}
            className={`w-14 h-14 border-2 border-[#111111] rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_#111111] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all ${showLayers ? 'bg-[#FFC107]' : 'bg-white'}`}
          >
            <Layers size={28} />
          </button>
        </div>

        {/* Layer Toggles Panel */}
        <AnimatePresence>
          {showLayers && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 20, y: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20, y: -20 }}
              className="absolute top-36 right-4 z-[1000] flex flex-col p-4 bg-white border-2 border-[#111111] rounded-2xl shadow-[6px_6px_0px_0px_#111111]"
            >
              <h3 className="font-extrabold text-lg mb-3">Filter Radar</h3>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => toggleLayer('heatmap')}
                  className={`px-5 py-3 rounded-xl font-bold text-md border-2 transition-colors flex items-center justify-between gap-4 ${activeLayers.includes('heatmap') ? 'bg-[#FFC107] border-[#111111]' : 'bg-gray-100 border-transparent text-gray-500'}`}
                >
                  <span>Demand Heatmap</span>
                  {activeLayers.includes('heatmap') && <div className="w-3 h-3 rounded-full bg-red-500 border border-[#111111]"></div>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recommended Zones Overlay */}
        <AnimatePresence>
          {topZones && topZones.length > 0 && activeLayers.includes('heatmap') && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-6 left-4 right-4 z-[1000]"
            >
              <div className="bg-white border-2 border-[#111111] rounded-2xl p-4 shadow-[8px_8px_0px_0px_#111111]">
                <h3 className="font-extrabold text-lg mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#10b981] animate-pulse inline-block border border-[#111111]"></span>
                  Target Hotspot (Live)
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
                  {topZones.map((z, idx) => (
                    <div key={idx} onClick={() => onSelectZone && onSelectZone(z)} className="min-w-[180px] snap-center bg-gray-50 border-2 border-[#111111] rounded-xl p-3 shrink-0 flex flex-col justify-between active:scale-95 transition-transform cursor-pointer">
                      <p className="font-bold text-md truncate">{z.name}</p>
                      <div className="flex justify-between items-end mt-2">
                        <span className="text-sm font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-lg">~{Math.round(z.radius)}m</span>
                        <div className="text-right">
                          <span className="text-xs font-bold block">Skor</span>
                          <span className="font-black text-lg text-[#10b981]">{z.score}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
