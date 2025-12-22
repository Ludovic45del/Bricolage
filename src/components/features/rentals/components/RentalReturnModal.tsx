import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';
import { Rental } from '@/types';

interface RentalReturnModalProps {
    rental: Rental | null;
    comment: string;
    setComment: (comment: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}

export const RentalReturnModal: React.FC<RentalReturnModalProps> = ({
    rental,
    comment,
    setComment,
    onClose,
    onConfirm
}) => {
    if (!rental) return null;

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Retour d'Outil"
        >
            <div className="space-y-8">
                <div className="p-6 rounded-[32px] border border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)] flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-emerald-300">Confirmation de Retour</h4>
                        <p className="text-xs font-medium text-emerald-200/70">
                            Confirmez-vous que l'outil a été rendu en bon état ?
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Commentaire sur l'état</label>
                    <textarea
                        rows={4}
                        className="block w-full rounded-2xl glass-input p-4 text-sm transition-all focus:ring-0 resize-none bg-white/5 border-white/10 text-white placeholder-gray-600"
                        placeholder="Ex: Propre, batterie pleine, lame ok..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                <div className="flex justify-between items-center pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm font-bold text-gray-500 hover:text-white transition-colors"
                    >
                        Annuler
                    </button>
                    <Button
                        onClick={onConfirm}
                        variant="primary"
                        className="px-10 py-5 rounded-[24px] shadow-[0_15px_40px_-5px_rgba(139,92,246,0.3)]"
                    >
                        Confirmer le Retour
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
