import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, X, CheckCircle2, Info, Loader2, AlertTriangle } from 'lucide-react';

export type AlertType = 'news' | 'success' | 'info' | 'warning';

interface SmartNewsAlertProps {
  isVisible: boolean;
  onClose: () => void;
  message?: string;
  type?: AlertType;
  locationName?: string;
  weather?: string;
  onWarning?: (msg: string) => void;
  config?: any;
}

export function SmartNewsAlert({ isVisible, onClose, message, type = 'news', locationName, weather, onWarning, config }: SmartNewsAlertProps) {
  const [news, setNews] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const locationNameRef = React.useRef(locationName);
  const weatherRef = React.useRef(weather);
  const onWarningRef = React.useRef(onWarning);
  const configRef = React.useRef(config);

  useEffect(() => {
    locationNameRef.current = locationName;
    weatherRef.current = weather;
    onWarningRef.current = onWarning;
    configRef.current = config;
  }, [locationName, weather, onWarning, config]);

  useEffect(() => {
    if (isVisible && type === 'news') {
      setLoading(true);
      fetch('/api/smart-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: locationNameRef.current,
          weather: weatherRef.current,
          time: new Date().toISOString(),
          day: new Date().getDay(),
          config: configRef.current
        })
      })
        .then(res => res.json())
        .then(data => {
          setNews(data.message);
          setLoading(false);
          if (data.fallback && onWarningRef.current) {
            onWarningRef.current("Server AI sedang sibuk. Menggunakan sistem heuristik lokal sementara.");
          }
        })
        .catch(() => {
          setNews("Lalin sekitar terpantau stabil kang, tetap waspada.");
          setLoading(false);
          if (onWarningRef.current) {
            onWarningRef.current("Koneksi jaringan terganggu. Beralih ke sistem offline.");
          }
        });
    }
  }, [isVisible, type]);

  useEffect(() => {
    if (isVisible && !loading && (type !== 'news' || news)) {
      const timer = setTimeout(() => {
        onClose();
        if (type === 'news') {
          setTimeout(() => setNews(null), 500); // clear after animate out
        }
      }, type === 'news' ? 12000 : 4000); 
      return () => clearTimeout(timer);
    }
  }, [isVisible, type, onClose, loading, news]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="absolute bottom-6 left-4 right-4 z-[2000]"
        >
          {type === 'news' ? (
            <div className="bg-[#111111] border-2 border-[#111111] rounded-2xl p-4 shadow-[8px_8px_0px_0px_#FFC107] flex items-start gap-4">
              <div className="w-12 h-12 bg-[#FFC107] rounded-full flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,193,7,0.4)]">
                {loading ? (
                  <Loader2 size={24} className="text-[#111111] animate-spin" />
                ) : (
                  <Radio size={24} className="text-[#111111] animate-pulse" />
                )}
              </div>
              <div className="flex-1 pt-1 text-white">
                <h4 className="font-extrabold text-lg leading-tight mb-1 text-[#FFC107] uppercase tracking-wide">Live Intel</h4>
                <p className="text-gray-200 font-medium mb-1 text-sm leading-snug">
                  {loading ? 'Menyadap info & rekomendasi AI...' : news}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 active:bg-gray-800 transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          ) : (
            <div className={`bg-white border-2 border-[#111111] rounded-xl p-4 shadow-[4px_4px_0px_0px_#111111] flex items-center gap-3 ${type === 'warning' ? 'bg-[#FFEB3B]' : ''}`}>
              <div className={`shrink-0 ${type === 'success' ? 'text-green-600' : type === 'warning' ? 'text-orange-600' : 'text-blue-500'}`}>
                {type === 'success' ? <CheckCircle2 size={24} /> : type === 'warning' ? <AlertTriangle size={24} /> : <Info size={24} />}
              </div>
              <p className="flex-1 text-[#111111] font-bold text-sm leading-snug">{message}</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
