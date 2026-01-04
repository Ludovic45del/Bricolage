import React, { useState } from 'react';
import { Member, getMemberRoleLabel, getMemberStatusLabel } from '@/types';
import { formatDate, formatCurrency, isMembershipActive } from '@/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CreditCard, Trash2 } from 'lucide-react';

interface MemberDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: Member | null;
    onEdit: (user: Member) => void;
    onRenew: (user: Member) => void;
    onDelete: (user: Member) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
    isOpen,
    onClose,
    user,
    onEdit,
    onRenew,
    onDelete
}) => {
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopyFeedback(type);
        setTimeout(() => setCopyFeedback(null), 2000);
    };

    if (!user) return null;

    const isActive = isMembershipActive(user.membershipExpiry);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Détails du Membre"
        >
            <div className="space-y-8">
                <div className="flex flex-col items-center justify-center pt-4">
                    <div className="h-24 w-24 rounded-[32px] glass-card flex items-center justify-center text-4xl font-black text-white border-white/20 shadow-2xl mb-4 relative group">
                        <span className="text-purple-400">{user.name.charAt(0)}</span>
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center border-2 border-[#1a1a1a] shadow-lg ${user.status === 'active' ? 'bg-emerald-500' : user.status === 'suspended' ? 'bg-amber-500' : 'bg-gray-500'}`}>
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-white tracking-tight">{user.name}</h3>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : user.role === 'staff' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-gray-500'}`}>
                            {getMemberRoleLabel(user.role)}
                        </span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1 italic">{user.badgeNumber}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-5 bg-white/5 border-white/10">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Communications</p>
                        <div className="space-y-3">
                            <div
                                className="flex flex-col cursor-pointer group/copy relative"
                                onClick={() => handleCopy(user.email, 'email')}
                            >
                                <span className="text-[10px] text-gray-400 font-bold">EMAIL</span>
                                <span className="text-sm font-medium text-white truncate group-hover:text-purple-400 transition-colors">
                                    {user.email}
                                </span>
                                {copyFeedback === 'email' && (
                                    <span className="absolute right-0 top-0 text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full animate-bounce">Copié !</span>
                                )}
                            </div>
                            <div
                                className="flex flex-col cursor-pointer group/copy relative"
                                onClick={() => handleCopy(user.phone || '', 'phone')}
                            >
                                <span className="text-[10px] text-gray-400 font-bold">TÉLÉPHONE</span>
                                <span className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">
                                    {user.phone || 'Non renseigné'}
                                </span>
                                {copyFeedback === 'phone' && user.phone && (
                                    <span className="absolute right-0 top-0 text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full animate-bounce">Copié !</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-5 bg-white/5 border-white/10">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Structure</p>
                        <div className="space-y-3">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-bold">AFFILIATION / EMPLOYEUR</span>
                                <span className="text-sm font-medium text-white">{user.employer || 'Indépendant'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">NUMÉRO AACCEA</span>
                                <span className="text-sm font-medium text-white">{user.badgeNumber}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`glass-card p-5 border-white/10 ${user.totalDebt > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Balance / Dette</p>
                        <div className="flex items-baseline justify-between">
                            <span className={`text-2xl font-black ${user.totalDebt > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {formatCurrency(user.totalDebt)}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Dette Totale</span>
                        </div>
                    </div>

                    <div className={`glass-card p-5 border-white/10 ${isActive ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Adhésion</p>
                        <div className="flex items-baseline justify-between">
                            <span className={`text-sm font-bold ${isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {formatDate(user.membershipExpiry)}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Échéance</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center px-2 pt-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                    <span>Créé le : {formatDate(user.createdAt)}</span>
                </div>

                <div className="flex justify-between pt-4 gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => onDelete(user)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-transparent"
                    >
                        <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={() => onEdit(user)}>
                            Modifier Profil
                        </Button>
                        <Button variant="secondary" onClick={() => onRenew(user)}>
                            <CreditCard className="w-4 h-4 mr-2" /> Renouveler
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
