import React, { useState } from 'react';
import { Transaction, TransactionType, PaymentMethod } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useUsersQuery } from '@/hooks/data/useUsersQuery';
import { DollarSign, CheckCircle } from 'lucide-react';

interface NewTransactionFormProps {
    onSubmit: (data: Partial<Transaction>) => void;
    onCancel: () => void;
}

export const NewTransactionForm: React.FC<NewTransactionFormProps> = ({ onSubmit, onCancel }) => {
    const { data: users = [] } = useUsersQuery();
    const [userId, setUserId] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<TransactionType>(TransactionType.PAYMENT);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            userId,
            amount: parseFloat(amount),
            type,
            method: paymentMethod,
            status: 'paid',
            description
        });
    };

    const typeOptions = [
        { id: TransactionType.RENTAL, name: 'Location' },
        { id: TransactionType.MEMBERSHIP_FEE, name: 'Cotisation' },
        { id: TransactionType.REPAIR_COST, name: 'Réparation' },
        { id: TransactionType.PAYMENT, name: 'Paiement' }
    ];

    const paymentMethodOptions = [
        { id: 'card', name: 'Carte' },
        { id: 'check', name: 'Chèque' },
        { id: 'cash', name: 'Espèces' }
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-8 py-2">
            <div className="glass-card p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-6">
                <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-2">
                    <DollarSign className="w-3.5 h-3.5" /> Informations de Transaction
                </h4>

                <Select
                    label="Membre"
                    options={users.map(u => ({ id: u.id, name: u.name }))}
                    value={userId}
                    onChange={setUserId}
                    placeholder="--- Sélectionner un membre ---"
                    required
                />

                <div className="space-y-2">
                    <label htmlFor="amount-input" className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block ml-1">Montant (€)</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-bold text-xl">€</span>
                        <input
                            id="amount-input"
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="block w-full rounded-2xl glass-input p-4 pl-10 text-2xl font-black text-white transition-all focus:ring-0 placeholder:text-gray-700"
                            placeholder="0.00"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Select
                        label="Type"
                        options={typeOptions}
                        value={type}
                        onChange={val => setType(val as TransactionType)}
                    />

                    <Select
                        label="Mode de paiement"
                        options={paymentMethodOptions}
                        value={paymentMethod}
                        onChange={val => setPaymentMethod(val as PaymentMethod)}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="description-input" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 block">Description</label>
                    <textarea
                        id="description-input"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Détails de la transaction..."
                        rows={3}
                        className="w-full bg-transparent border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all placeholder-gray-600 resize-none leading-relaxed"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-6 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-[0.3em] transition-colors"
                >
                    Annuler
                </button>
                <Button
                    type="submit"
                    className="px-10 py-4 rounded-[20px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_15px_30px_-10px_rgba(168,85,247,0.5)] transition-all hover:scale-[1.01] active:scale-95 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
                >
                    <CheckCircle className="w-4 h-4" /> Confirmer
                </Button>
            </div>
        </form>
    );
};
