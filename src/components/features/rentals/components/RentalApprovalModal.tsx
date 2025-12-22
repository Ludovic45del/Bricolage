import React from 'react';
import { Member, Rental, Tool } from '@/types';
import { formatDate, isMembershipActive } from '@/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface RentalApprovalModalProps {
    rental: Rental | null;
    price: number;
    setPrice: (price: number) => void;
    users: Member[];
    tools: Tool[];
    onClose: () => void;
    onConfirm: () => void;
}

export const RentalApprovalModal: React.FC<RentalApprovalModalProps> = ({
    rental,
    price,
    setPrice,
    users,
    tools,
    onClose,
    onConfirm
}) => {
    if (!rental) return null;

    const user = users.find(u => u.id === rental.userId);
    const tool = tools.find(t => t.id === rental.toolId);
    const isExpired = user ? !isMembershipActive(user.membershipExpiry) : false;

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Détails de la Réservation"
        >
            <div className="space-y-8">
                <div className={`p-6 rounded-[32px] border flex items-start space-x-4 ${isExpired ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isExpired ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {isExpired ? <AlertTriangle className="w-6 h-6 animate-pulse" /> : <CheckCircle className="w-6 h-6" />}
                    </div>
                    <div>
                        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isExpired ? 'text-rose-300' : 'text-emerald-300'}`}>
                            {isExpired ? 'Adhésion Expirée' : 'Adhésion Valide'}
                        </h4>
                        <p className={`text-xs font-medium leading-relaxed ${isExpired ? 'text-rose-200/70' : 'text-emerald-200/70'}`}>
                            {isExpired ? `Attention : Expire le ${formatDate(user?.membershipExpiry || '')}.` : `Valide jusqu'au ${formatDate(user?.membershipExpiry || '')}.`}
                        </p>
                    </div>
                </div>

                <div className="glass-card p-6 border-white/10 space-y-4 shadow-inner bg-white/5">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Membre Demandeur</span>
                        <span className="font-bold text-white tracking-tight">{user?.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Outil Loué</span>
                        <span className="font-bold text-white tracking-tight">{tool?.title}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-4 border-t border-white/[0.03]">
                        <span className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Période</span>
                        <span className="font-black text-gray-300">{formatDate(rental.startDate)} ➔ {formatDate(rental.endDate)}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">Montant à Facturer (€)</label>
                    <div className="relative group">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 text-2xl font-light">€</span>
                        <input
                            type="number"
                            step="0.01"
                            className="block w-full rounded-[32px] glass-input p-6 pl-14 text-4xl font-black transition-all focus:ring-0 shadow-lg"
                            value={price}
                            onChange={(e) => setPrice(parseFloat(e.target.value))}
                        />
                    </div>
                </div>

                <div className="flex justify-end w-full pt-10">
                    <Button onClick={onConfirm} variant="primary" size="lg" className="w-full py-6 rounded-[24px] text-xl font-black uppercase tracking-widest shadow-lg shadow-purple-900/40">
                        Valider & Facturer
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
