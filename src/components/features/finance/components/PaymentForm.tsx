import React from 'react';
import { CreditCard, History, DollarSign, CheckSquare, Square } from 'lucide-react';
import { Member, Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface PaymentFormProps {
    selectedPayerId: string;
    setSelectedPayerId: (id: string) => void;
    paymentAmount: string;
    setPaymentAmount: (amount: string) => void;
    paymentMethod: 'card' | 'check' | 'cash';
    setPaymentMethod: (method: 'card' | 'check' | 'cash') => void;
    selectedItems: string[];
    setSelectedItems: (items: string[]) => void;
    debtors: Member[];
    users: Member[];
    dueItems: Transaction[];
    onSubmit: (e: React.FormEvent) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
    selectedPayerId,
    setSelectedPayerId,
    paymentAmount,
    setPaymentAmount,
    paymentMethod,
    setPaymentMethod,
    selectedItems,
    setSelectedItems,
    debtors,
    users,
    dueItems,
    onSubmit
}) => {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center tracking-tight">
                <div className="w-1 h-6 bg-purple-500/50 rounded-full mr-4"></div>
                Encaisser un Paiement
            </h3>
            <div className="glass-card p-8 border-white/5 h-fit shadow-2xl sticky top-8">
                <form onSubmit={onSubmit} className="space-y-8">
                    <Select
                        label="Sélection du Payeur"
                        options={debtors.map(u => ({
                            id: u.id,
                            name: `${u.name} (${formatCurrency(u.totalDebt)})`
                        }))}
                        value={selectedPayerId}
                        onChange={val => {
                            setSelectedPayerId(val);
                            const u = users.find(user => user.id === val);
                            if (u) {
                                setPaymentAmount(u.totalDebt.toString());
                                setSelectedItems([]);
                            }
                        }}
                        placeholder="-- Sélectionner Membre --"
                    />

                    {selectedPayerId && dueItems.length > 0 && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Items à régler</label>
                                <span className="text-[10px] font-black text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">Sélection multiple</span>
                            </div>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar pr-2">
                                {dueItems.map(item => {
                                    const isSelected = selectedItems.includes(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                const newSelected = isSelected
                                                    ? selectedItems.filter(id => id !== item.id)
                                                    : [...selectedItems, item.id];
                                                setSelectedItems(newSelected);

                                                // Auto-calc amount
                                                const total = dueItems
                                                    .filter(i => newSelected.includes(i.id))
                                                    .reduce((sum, i) => sum + i.amount, 0);
                                                setPaymentAmount(total > 0 ? total.toString() : '');
                                            }}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${isSelected
                                                ? 'glass-card border-purple-500/30 bg-purple-500/10'
                                                : 'border-white/5 bg-white/2 hover:border-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-700'}`}>
                                                    {isSelected ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold text-white leading-none mb-1">{item.description || item.type}</p>
                                                    <p className="text-[9px] text-gray-500 uppercase font-medium">{formatDate(item.date)}</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-black ${isSelected ? 'text-purple-400' : 'text-gray-400'}`}>
                                                {formatCurrency(item.amount)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Montant du Paiement (€)</label>
                        <div className="glass-card p-5 border-white/5 bg-white/5">
                            <div className="flex items-center">
                                <span className="text-gray-500 mr-3 text-xl font-light">€</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="block w-full bg-transparent border-none p-0 text-3xl font-black text-white focus:outline-none placeholder-gray-700"
                                    placeholder="0.00"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Méthode de Paiement</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { id: 'card', label: 'Carte Bancaire', icon: CreditCard },
                                { id: 'check', label: 'Chèque', icon: History },
                                { id: 'cash', label: 'Espèces', icon: DollarSign }
                            ].map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 gap-2 ${paymentMethod === m.id
                                        ? 'glass-card border-purple-500/50 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)] scale-105'
                                        : 'border-white/5 hover:border-white/20'
                                        }`}
                                    onClick={() => setPaymentMethod(m.id as any)}
                                >
                                    <m.icon className={`w-5 h-5 ${paymentMethod === m.id ? 'text-purple-400' : 'text-gray-600'}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest text-center ${paymentMethod === m.id ? 'text-white' : 'text-gray-500'}`}>
                                        {m.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-5 shadow-[0_15px_40px_-5px_rgba(139,92,246,0.3)] transition-all hover:scale-105 active:scale-95"
                        disabled={!selectedPayerId}
                    >
                        Finaliser le Paiement
                    </Button>
                </form>
            </div>
        </div>
    );
};
