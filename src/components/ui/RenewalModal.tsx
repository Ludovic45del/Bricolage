import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { HelpCircle, CreditCard, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils';

interface RenewalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (price: number) => void;
    memberName: string;
    defaultPrice: number;
}

export const RenewalModal: React.FC<RenewalModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    memberName,
    defaultPrice
}) => {
    const [price, setPrice] = useState(defaultPrice);

    useEffect(() => {
        if (isOpen) {
            setPrice(defaultPrice);
        }
    }, [isOpen, defaultPrice]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Renouvellement d'Adhésion">
            <div className="flex flex-col items-center text-center space-y-8">
                <div className="p-6 rounded-[32px] bg-purple-500/10 border border-purple-500/20 shadow-2xl animate-bounce-slow text-purple-400 mt-4">
                    <HelpCircle className="w-16 h-16" />
                </div>

                <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white tracking-tight">Renouvellement d'Adhésion</h3>
                    <p className="text-sm text-gray-400 font-light leading-relaxed px-4">
                        Confirmez-vous le renouvellement de l'adhésion pour <span className="font-bold text-white underline underline-offset-4 decoration-purple-500/30">{memberName}</span> ? L'adhésion sera prolongée d'une année supplémentaire.
                    </p>
                </div>

                <div className="w-full space-y-3 pt-6 border-t border-white/[0.03]">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Montant à facturer (€)</label>
                    <div className="glass-card p-6 border-white/10 bg-white/5 flex items-center justify-center group focus-within:border-purple-500/30 transition-all shadow-inner rounded-[32px]">
                        <span className="text-gray-500 mr-4 text-2xl font-light">€</span>
                        <input
                            type="number"
                            step="0.01"
                            className="bg-transparent border-none p-0 text-4xl font-black text-white focus:outline-none w-32 text-center"
                            value={price}
                            onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </div>

                <div className="flex w-full justify-between items-center pt-8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm font-bold text-gray-500 hover:text-white transition-colors"
                    >
                        Annuler
                    </button>
                    <Button
                        variant="primary"
                        onClick={() => onConfirm(price)}
                        className="px-10 py-5 rounded-[24px] shadow-[0_15px_40px_-5px_rgba(139,92,246,0.3)] transition-all hover:scale-105 active:scale-95 min-w-[180px]"
                    >
                        <CreditCard className="w-4 h-4 mr-2" /> Confirmer & Renouveler
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
