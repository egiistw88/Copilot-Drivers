import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isVisible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary';
}

export function ConfirmDialog({ 
  isVisible, 
  title, 
  message, 
  confirmText = "Ya, Lanjutkan", 
  cancelText = "Batal", 
  onConfirm, 
  onCancel,
  variant = 'primary'
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm bg-white border-4 border-[#111111] rounded-2xl p-6 shadow-[8px_8px_0px_0px_#111111]"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-full border-2 border-[#111111] ${variant === 'danger' ? 'bg-red-500' : 'bg-[#FFC107]'}`}>
                <AlertTriangle size={32} color={variant === 'danger' ? 'white' : '#111111'} />
              </div>
              <h3 className="text-xl font-extrabold leading-tight">{title}</h3>
            </div>
            
            <p className="text-[#111111]/80 font-medium mb-8">
              {message}
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={onConfirm}
                className={`w-full py-4 rounded-xl font-bold text-lg border-2 border-[#111111] active:translate-y-1 active:translate-x-1 transition-all ${
                  variant === 'danger' ? 'bg-red-500 text-white shadow-[4px_4px_0px_0px_#111111] active:shadow-none' : 'bg-[#FFC107] text-[#111111] shadow-[4px_4px_0px_0px_#111111] active:shadow-none'
                }`}
              >
                {confirmText}
              </button>
              <button 
                onClick={onCancel}
                className="w-full py-4 rounded-xl font-bold text-lg bg-gray-100 text-[#111111] hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
