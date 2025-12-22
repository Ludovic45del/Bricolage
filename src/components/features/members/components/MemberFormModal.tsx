import React, { useState, useEffect } from 'react';
import { Member, MemberRole, MemberStatus } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';

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
            title={user?.id === 'new' ? "Ajouter un Nouveau Membre" : "Modifier le Membre"}
        >
            <form id="member-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nom Complet</label>
                        <input
                            type="text"
                            required
                            className="block w-full rounded-2xl glass-input p-3 text-sm transition-all focus:ring-0"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email</label>
                        <input
                            type="email"
                            required
                            className="block w-full rounded-2xl glass-input p-3 text-sm transition-all focus:ring-0"
                            value={formData.email || ''}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Téléphone</label>
                        <input
                            type="tel"
                            className="block w-full rounded-2xl glass-input p-3 text-sm transition-all focus:ring-0"
                            value={formData.phone || ''}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Numéro de Badge</label>
                        <input
                            type="text"
                            className="block w-full rounded-2xl glass-input p-3 text-sm transition-all focus:ring-0"
                            value={formData.badgeNumber || ''}
                            onChange={e => setFormData({ ...formData, badgeNumber: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Rôle</label>
                        <Select
                            options={[
                                { id: 'member', name: 'Membre' },
                                { id: 'staff', name: 'Staff' },
                                { id: 'admin', name: 'Admin' }
                            ]}
                            value={formData.role || 'member'}
                            onChange={val => setFormData({ ...formData, role: val as MemberRole })}
                        />
                    </div>
                    <div className="space-y-1.5">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <DatePicker
                        label="Date d'expiration"
                        date={formData.membershipExpiry || ''}
                        onChange={val => setFormData({ ...formData, membershipExpiry: val })}
                        required
                    />
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Employeur / Affiliation</label>
                        <input
                            type="text"
                            className="block w-full rounded-2xl glass-input p-3 text-sm transition-all focus:ring-0"
                            value={formData.employer || ''}
                            onChange={e => setFormData({ ...formData, employer: e.target.value })}
                            placeholder="Ex: TechCorp"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        Annuler
                    </button>
                    <Button
                        form="member-form"
                        type="submit"
                        variant="primary"
                        className="px-10 py-4 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                        Sauvegarder
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
