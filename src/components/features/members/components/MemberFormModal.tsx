import React, { useState, useEffect } from 'react';
import { Member, MemberRole, MemberStatus } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';
import { User, ShieldCheck, CheckCircle, X as CloseIcon } from 'lucide-react';

interface MemberFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: Member | null;
    onSave: (userData: Partial<Member>) => void;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
    isOpen,
    onClose,
    user,
    onSave
}) => {
    // Initial state matching Member structure (V2)
    const initialFormState: Partial<Member> = {
        name: '',
        email: '',
        badgeNumber: '',
        phone: '',
        employer: '',
        role: 'member' as MemberRole,
        status: 'active' as MemberStatus,
        membershipExpiry: new Date().toISOString().split('T')[0],
        totalDebt: 0
    };

    const [formData, setFormData] = useState<Partial<Member>>(initialFormState);

    useEffect(() => {
        if (user && user.id !== 'new') {
            setFormData(user);
        } else {
            setFormData(initialFormState);
        }
    }, [user, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="5xl"
            title={
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400">
                        <User className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">
                        {user?.id === 'new' ? "Ajouter un Nouveau Membre" : "Modifier le Membre"}
                    </h2>
                </div>
            }
        >
            <form id="member-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10 py-4 max-w-[1200px] mx-auto">
                <div className="space-y-8">
                    {/* Section: Informations Personnelles */}
                    <div className="glass-card p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-6">
                        <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-2">
                            <User className="w-3.5 h-3.5" /> Informations Personnelles
                        </h4>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nom Complet</label>
                            <input
                                type="text"
                                required
                                style={{ color: '#ffffff' }}
                                className="block w-full rounded-2xl glass-input p-4 text-base font-bold text-white transition-all focus:ring-0 placeholder:text-gray-600 shadow-inner"
                                placeholder="Prénom Nom"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email</label>
                            <input
                                type="email"
                                required
                                style={{ color: '#ffffff' }}
                                className="block w-full rounded-2xl glass-input p-4 text-sm transition-all focus:ring-0 font-medium"
                                placeholder="email@exemple.com"
                                value={formData.email || ''}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Téléphone</label>
                                <input
                                    type="tel"
                                    style={{ color: '#ffffff' }}
                                    className="block w-full rounded-2xl glass-input p-3.5 text-sm transition-all focus:ring-0 font-medium"
                                    placeholder="06 12 34 56 78"
                                    value={formData.phone || ''}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Numéro de Badge</label>
                                <input
                                    type="text"
                                    style={{ color: '#ffffff' }}
                                    className="block w-full rounded-2xl glass-input p-3.5 text-sm transition-all focus:ring-0 font-bold"
                                    placeholder="A123-456"
                                    value={formData.badgeNumber || ''}
                                    onChange={e => setFormData({ ...formData, badgeNumber: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8 flex flex-col justify-between">
                    {/* Section: Détails de l'Adhésion */}
                    <div className="glass-card p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-6">
                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-3.5 h-3.5" /> Détails de l'Adhésion
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Rôle</label>
                                <Select
                                    options={[
                                        { id: 'member', name: 'Membre' },
                                        { id: 'admin', name: 'Admin' }
                                    ]}
                                    value={formData.role || 'member'}
                                    onChange={val => setFormData({ ...formData, role: val as MemberRole })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Statut</label>
                                <Select
                                    options={[
                                        { id: 'active', name: 'Actif' },
                                        { id: 'suspended', name: 'Suspendu' },
                                        { id: 'archived', name: 'Archivé' }
                                    ]}
                                    value={formData.status || 'active'}
                                    onChange={val => setFormData({ ...formData, status: val as MemberStatus })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Date d'expiration</label>
                            <DatePicker
                                date={formData.membershipExpiry || ''}
                                onChange={val => setFormData({ ...formData, membershipExpiry: val })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Employeur / Affiliation</label>
                            <input
                                type="text"
                                style={{ color: '#ffffff' }}
                                className="block w-full rounded-2xl glass-input p-3.5 text-sm transition-all focus:ring-0 font-medium"
                                value={formData.employer || ''}
                                onChange={e => setFormData({ ...formData, employer: e.target.value })}
                                placeholder="Ex: TechCorp"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-6 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-[0.3em] transition-colors"
                        >
                            Annuler
                        </button>
                        <Button
                            type="submit"
                            className="px-10 py-4 rounded-[20px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_15px_30px_-10px_rgba(168,85,247,0.5)] transition-all hover:scale-[1.01] active:scale-95 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" /> Sauvegarder
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};
