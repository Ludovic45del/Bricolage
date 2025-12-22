import React, { useState, useEffect } from 'react';
import { Member } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: Member;
    onUpdateProfile: (updatedData: { email: string; phone: string; badgeNumber: string }) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
    isOpen,
    onClose,
    currentUser,
    onUpdateProfile
}) => {
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        badgeNumber: ''
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                email: currentUser.email,
                phone: currentUser.phone,
                badgeNumber: currentUser.badgeNumber
            });
        }
    }, [isOpen, currentUser]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateProfile(formData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Configuration du Profil"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400">Email</label>
                    <input
                        type="email"
                        className="glass-input w-full p-3 rounded-xl"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400">Téléphone</label>
                    <input
                        type="tel"
                        className="glass-input w-full p-3 rounded-xl"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400">Numéro Adhérent</label>
                    <input
                        type="text"
                        className="glass-input w-full p-3 rounded-xl text-white/50"
                        value={formData.badgeNumber}
                        readOnly
                    />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" onClick={onClose} variant="ghost">Annuler</Button>
                    <Button type="submit">Sauvegarder</Button>
                </div>
            </form>
        </Modal>
    );
};
