import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle, CheckCircle2, Info, HelpCircle } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'confirm';
    confirmLabel?: string;
    cancelLabel?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info',
    confirmLabel = 'OK',
    cancelLabel = 'Annuler'
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-12 h-12 text-emerald-400" />;
            case 'warning': return <AlertCircle className="w-12 h-12 text-rose-400" />;
            case 'confirm': return <HelpCircle className="w-12 h-12 text-purple-400" />;
            default: return <Info className="w-12 h-12 text-blue-400" />;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
        >
            <div className="flex flex-col items-center text-center space-y-8">
                <div className="p-6 rounded-[32px] bg-white/5 border border-white/10 shadow-2xl animate-bounce-slow mt-4">
                    {getIcon()}
                </div>

                <div className="space-y-3">
                    <p className="text-sm text-gray-300 font-light leading-relaxed whitespace-pre-wrap px-4">
                        {message}
                    </p>
                </div>

                <div className="flex w-full justify-between items-center pt-8">
                    {type === 'confirm' && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-sm font-bold text-gray-500 hover:text-white transition-colors"
                        >
                            {cancelLabel}
                        </button>
                    )}
                    <Button
                        variant="primary"
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            onClose();
                        }}
                        className={`${type === 'confirm' ? 'px-10' : 'w-full'} py-5 rounded-[24px] shadow-[0_15px_40px_-5px_rgba(139,92,246,0.3)] transition-all hover:scale-105 active:scale-95 min-w-[180px]`}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
