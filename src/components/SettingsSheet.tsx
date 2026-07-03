import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Settings2 } from 'lucide-react';

interface SettingsSheetProps {
  isVisible: boolean;
  onClose: () => void;
  config: {
    vehicleType: string;
    serviceType: string;
    targetIncome: number;
  };
  onSave: (newConfig: any) => void;
}

export function SettingsSheet({ isVisible, onClose, config, onSave }: SettingsSheetProps) {
  const [localConfig, setLocalConfig] = React.useState(config);

  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleChange = (key: string, value: any) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(localConfig);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full bg-white rounded-t-3xl border-t-4 border-x-4 border-[#111111] p-6 pb-12 shadow-[0px_-8px_0px_0px_rgba(0,0,0,0.1)] h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#FFC107] border-2 border-[#111111] rounded-full">
                  <Settings2 size={24} color="#111111" />
                </div>
                <h2 className="text-2xl font-extrabold">Pengaturan App</h2>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full border-2 border-transparent active:border-[#111111] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Vehicle Type */}
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Tipe Kendaraan</label>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleChange('vehicleType', 'motorcycle')}
                    className={`flex-1 py-4 border-2 rounded-xl font-bold transition-colors ${localConfig.vehicleType === 'motorcycle' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#111111] border-gray-300'}`}
                  >
                    Motor
                  </button>
                  <button 
                    onClick={() => handleChange('vehicleType', 'car')}
                    className={`flex-1 py-4 border-2 rounded-xl font-bold transition-colors ${localConfig.vehicleType === 'car' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#111111] border-gray-300'}`}
                  >
                    Mobil
                  </button>
                </div>
              </div>

              {/* Service Type */}
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Layanan Prioritas</label>
                <div className="grid grid-cols-2 gap-3">
                  {['all', 'ride', 'food', 'send'].map((svc) => (
                    <button 
                      key={svc}
                      onClick={() => handleChange('serviceType', svc)}
                      className={`py-3 border-2 rounded-xl font-bold capitalize transition-colors ${localConfig.serviceType === svc ? 'bg-[#FFC107] border-[#111111]' : 'bg-white border-gray-300'}`}
                    >
                      {svc === 'all' ? 'Semua' : svc === 'ride' ? 'Penumpang' : svc === 'food' ? 'Makanan' : 'Barang'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Income */}
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Target Pendapatan (Harian)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">Rp</span>
                  <input 
                    type="number" 
                    value={localConfig.targetIncome}
                    onChange={(e) => handleChange('targetIncome', parseInt(e.target.value) || 0)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-[#111111] rounded-xl font-bold text-lg outline-none focus:ring-4 focus:ring-[#FFC107]/50 transition-all"
                  />
                </div>
              </div>

              {/* Emergency Number */}
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Nomor Darurat (WhatsApp)</label>
                <p className="text-xs text-gray-500 -mt-2">Digunakan untuk tombol SOS (contoh: 628123456789)</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">+</span>
                  <input 
                    type="tel" 
                    value={localConfig.emergencyNumber || ''}
                    placeholder="628..."
                    onChange={(e) => handleChange('emergencyNumber', e.target.value)}
                    className="w-full pl-8 pr-4 py-4 border-2 border-[#111111] rounded-xl font-bold text-lg outline-none focus:ring-4 focus:ring-red-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full mt-8 h-16 bg-[#111111] text-white rounded-xl flex items-center justify-center gap-2 active:bg-gray-800 transition-colors border-2 border-[#111111] shadow-[4px_4px_0px_0px_#FFC107]"
            >
              <Save size={24} />
              <span className="text-xl font-bold">Simpan Pengaturan</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
