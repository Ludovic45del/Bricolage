import React, { useState } from 'react';
import { Transaction, TransactionType } from '@/types';
import { Button } from '@/components/ui/Button';
import { useUsersQuery } from '@/hooks/data/useUsersQuery';

interface NewTransactionFormProps {
    onSubmit: (data: Partial<Transaction>) => void;
    onCancel: () => void;
}

export const NewTransactionForm: React.FC<NewTransactionFormProps> = ({ onSubmit, onCancel }) => {
    const { data: users = [] } = useUsersQuery();
    const [userId, setUserId] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<TransactionType>(TransactionType.PAYMENT);
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            userId,
            amount: parseFloat(amount),
            type,
            description,
            date: new Date().toISOString(),
            status: 'pending' // Or paid if immediate
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Membre</label>
                <select
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                >
                    <option value="">Sélectionner un membre</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id} className="text-black">{u.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Montant (€)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value as TransactionType)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {Object.values(TransactionType).map(t => (
                            <option key={t} value={t} className="text-black">{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
                <Button type="submit">Confirmer</Button>
            </div>
        </form>
    );
};
