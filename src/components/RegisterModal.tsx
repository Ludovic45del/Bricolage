import React, { useState } from 'react';
import { Member as User, MemberRole, MemberStatus } from '../api/memberTypes';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { UserPlus, Mail, Phone, Building2, Hash, ArrowRight } from 'lucide-react';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: (userData: User) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onRegister }) => {
    // Using Partial<User> but mapped to form fields
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        badgeNumber: '',
        phone: '',
        employer: '',
        password: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const now = new Date().toISOString();
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);

        const newUser: User = {
            id: Date.now().toString(),
            name: formData.name || '',
            email: formData.email || '',
            badgeNumber: formData.badgeNumber || '',
            phone: formData.phone || '',
            employer: formData.employer || '',
            passwordHash: formData.password || '', // Storing plain password in hash field for mock
            role: 'member' as MemberRole,
            status: 'active' as MemberStatus,
            membershipExpiry: nextYear.toISOString().split('T')[0],
            totalDebt: 0,
            createdAt: now,
            updatedAt: now
        };

        onRegister(newUser);
        setFormData({
            name: '',
            email: '',
            badgeNumber: '',
            phone: '',
            employer: '',
            password: ''
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Créer un Compte"
            size="2xl"
        >
            <div className="p-2">
                <div className="flex items-center space-x-4 mb-8 bg-purple-500/5 p-4 rounded-2xl border border-purple-500/10">
                    <div className="w-12 h-12 glass-card flex items-center justify-center text-purple-400 shrink-0">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white">Bienvenue parmi nous !</h4>
                        <p className="text-sm text-gray-400">Remplissez ces informations pour rejoindre la section.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nom Complet</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-purple-400">
                                    <UserPlus className="w-4 h-4" />
                                </div>
                                <input
                                    required
                                    type="text"
                                    className="block w-full rounded-2xl glass-input p-3 pl-11 text-sm transition-all focus:ring-0"
                                    placeholder="Ex: Jean Dupont"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-purple-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    required
                                    type="email"
                                    className="block w-full rounded-2xl glass-input p-3 pl-11 text-sm transition-all focus:ring-0"
                                    placeholder="jean.dupont@societe.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Numéro AACCEA</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-purple-400">
                                    <Hash className="w-4 h-4" />
                                </div>
                                <input
                                    required
                                    type="text"
                                    className="block w-full rounded-2xl glass-input p-3 pl-11 text-sm transition-all focus:ring-0"
                                    placeholder="AACCEA-XXXX"
                                    value={formData.badgeNumber}
                                    onChange={e => setFormData({ ...formData, badgeNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Téléphone</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-purple-400">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <input
                                    required
                                    type="tel"
                                    className="block w-full rounded-2xl glass-input p-3 pl-11 text-sm transition-all focus:ring-0"
                                    placeholder="06 12 34 56 78"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Société / Employeur</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-purple-400">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <input
                                    required
                                    type="text"
                                    className="block w-full rounded-2xl glass-input p-3 pl-11 text-sm transition-all focus:ring-0"
                                    placeholder="Nom de votre entreprise"
                                    value={formData.employer}
                                    onChange={e => setFormData({ ...formData, employer: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Mot de Passe</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-purple-400">
                                    <Hash className="w-4 h-4" />
                                </div>
                                <input
                                    required
                                    type="password"
                                    className="block w-full rounded-2xl glass-input p-3 pl-11 text-sm transition-all focus:ring-0 font-bold tracking-widest"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1 py-4 rounded-2xl"
                            onClick={onClose}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant="secondary"
                            className="flex-1 py-4 rounded-2xl shadow-[0_10px_30px_-5px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all"
                        >
                            Confirmer l'Inscription <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </form>

                <p className="mt-6 text-center text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">
                    En vous inscrivant, votre compte sera activé immédiatement avec<br />le rôle de membre standard.
                </p>
            </div>
        </Modal>
    );
};
