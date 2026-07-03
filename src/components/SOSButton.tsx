import React from 'react';
import { motion } from 'motion/react';
import { PhoneCall } from 'lucide-react';
import { DriverPosition } from '../types';

interface SOSButtonProps {
  emergencyNumber?: string;
  driverPosition?: DriverPosition;
  triggerAlert: (msg: string, type: 'info' | 'success' | 'warning' | 'error' | 'news') => void;
}

export function SOSButton({ emergencyNumber, driverPosition, triggerAlert }: SOSButtonProps) {
  // Use a state to track if we're dragging vs clicking
  const [isDragging, setIsDragging] = React.useState(false);

  const handleSOSClick = () => {
    if (isDragging) return; // Prevent click if we just dragged
    
    if (!emergencyNumber) {
      triggerAlert('Atur Nomor Darurat di Pengaturan terlebih dahulu!', 'error');
      return;
    }
    
    let cleanNumber = emergencyNumber.replace(/\D/g, '');
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '62' + cleanNumber.substring(1);
    }
    
    const time = new Date().toLocaleString('id-ID');
    let mapLink = "Lokasi tidak diketahui";
    if (driverPosition) {
      mapLink = `https://maps.google.com/?q=${driverPosition.lat},${driverPosition.lng}`;
    }
    
    const message = `*DARURAT!* Saya butuh bantuan segera.\n\nWaktu: ${time}\nLokasi Saat Ini:\n${mapLink}`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        // Small timeout to prevent the click event from firing immediately after drag
        setTimeout(() => setIsDragging(false), 150);
      }}
      className="fixed z-[9999]"
      style={{ left: 16, bottom: 100 }} // Initial position
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
    >
      <div className="relative">
        {/* Pulsing glow behind */}
        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
        
        {/* Actual button */}
        <button
          onClick={handleSOSClick}
          className="relative w-14 h-14 bg-red-600 rounded-full border-2 border-white shadow-[0_4px_12px_rgba(220,38,38,0.5)] flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <PhoneCall size={24} className="animate-pulse" />
        </button>
      </div>
    </motion.div>
  );
}
