import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  variant?: 'glass' | 'solid';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'lg',
  variant = 'solid'
}) => {
  const sizeClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-[90rem]',
  };
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const bgClass = variant === 'glass' ? 'liquid-glass-light border-white/20' : 'bg-[#0f172a] border-white/10';
  const headerBg = variant === 'glass' ? 'bg-slate-900/40 backdrop-blur-xl' : 'bg-[#0f172a]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content - auto height, no scroll */}
      <div className={`relative ${bgClass} w-full ${sizeClasses[size]} max-h-[95vh] flex flex-col animate-fade-in shadow-[0_30px_100px_-15px_rgba(0,0,0,0.6)] rounded-[24px] md:rounded-[40px] overflow-hidden`}>
        {/* Header - rounded top corners */}
        <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 md:px-8 md:py-6 ${headerBg} rounded-t-[24px] md:rounded-t-[40px] ${variant === 'glass' ? 'border-b border-white/5' : ''}`}>
          <div className="flex-1">
            {typeof title === 'string' ? (
              <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
            ) : (
              title
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-2xl transition-all text-gray-500 hover:text-white flex-shrink-0 ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - fits content, scrolls only if needed */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {children}
        </div>

        {/* Footer - Sticky */}
        {footer && (
          <div className={`sticky bottom-0 z-10 p-6 ${headerBg} border-t border-white/5`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};