import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation, MapPin, Zap, X } from 'lucide-react';

interface Recommendation {
  targetLocation: string;
  address?: string;
  distanceKm: number;
  etaMins: number;
  score: number;
}

interface RecommendationsSheetProps {
  isVisible: boolean;
  onClose: () => void;
  recommendations: Recommendation[];
  onNavigate: (rec: Recommendation) => void;
}

export function RecommendationsSheet({ isVisible, onClose, recommendations, onNavigate }: RecommendationsSheetProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#111111]/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-[101] overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="w-full flex justify-center py-3 bg-white shrink-0">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            <div className="px-6 pb-4 shrink-0 flex justify-between items-center bg-white border-b-2 border-gray-100">
              <div>
                <h2 className="text-2xl font-extrabold text-[#111111]">Area Potensial</h2>
                <p className="text-sm font-medium text-gray-500">Pilih lokasi untuk mencari order</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center active:bg-gray-200 transition-colors"
              >
                <X size={20} className="text-[#111111]" />
              </button>
            </div>

            <div className="px-6 py-6 overflow-y-auto space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    className="bg-white border-2 border-[#111111] rounded-2xl p-4 flex flex-col gap-3 shadow-[4px_4px_0px_0px_#111111] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <MapPin size={24} className="text-[#FFC107] drop-shadow-sm" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-lg text-[#111111]">{rec.targetLocation}</h3>
                          {rec.address && (
                            <p className="text-sm font-medium text-gray-500 mt-0.5">{rec.address}</p>
                          )}
                        </div>
                      </div>
                      <div className="bg-[#FFC107] text-[#111111] px-2 py-1 rounded-lg font-bold text-xs flex items-center gap-1 border-2 border-[#111111] shrink-0 ml-2">
                        <Zap size={12} fill="#111111" />
                        Skor {rec.score}
                      </div>
                    </div>
                    
                    <div className="text-sm font-bold text-[#111111] flex items-center gap-2 ml-[36px] bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <span>Jarak: {rec.distanceKm} km</span>
                      <span className="text-gray-300">•</span>
                      <span>Est: {rec.etaMins} mnt</span>
                    </div>

                    <button 
                      onClick={() => onNavigate(rec)}
                      className="mt-2 w-full py-3 bg-[#111111] text-white font-bold rounded-xl flex items-center justify-center gap-2 active:bg-gray-800 transition-colors"
                    >
                      <Navigation size={18} />
                      Jadikan Target Lokasi
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-gray-500 font-medium">
                  Sedang mencari area potensial...
                </div>
              )}
            </div>
            
            <div className="pb-8 bg-white" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
