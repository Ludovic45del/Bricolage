import React from 'react';
import { Member as User } from '../../api/memberTypes';
import { formatCurrency } from '../../utils';
import { Mail } from 'lucide-react';

interface DebtorsListProps {
    debtors: User[];
    onSelectPayer: (userId: string) => void;
    onSendReminder: (user: User) => void;
}

export const DebtorsList: React.FC<DebtorsListProps> = ({
    debtors,
    onSelectPayer,
    onSendReminder
}) => {
    return (
        <div>
            <h3 className="text-xl font-bold text-white flex items-center tracking-tight">
                <div className="w-1 h-6 bg-emerald-500/50 rounded-full mr-4"></div>
                Dettes en cours
            </h3>
            <div className="glass-card shadow-2xl border-white/5 overflow-hidden mt-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/5">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Membre</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Montant Dû</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-400">
                            {debtors.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-8 py-20 text-center text-sm italic opacity-30">
                                        L'équilibre budgétaire est atteint.
                                    </td>
                                </tr>
                            ) : (
                                debtors.map(u => (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-6 text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                                            {u.name}
                                        </td>
                                        <td className="px-8 py-6 text-right text-sm text-rose-400 font-black drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                                            {formatCurrency(u.totalDebt)}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end items-center space-x-4">
                                                <button
                                                    className="text-purple-400 hover:text-white text-[10px] font-black uppercase tracking-widest p-2 rounded-xl transition-all"
                                                    onClick={() => onSelectPayer(u.id)}
                                                >
                                                    Choisir
                                                </button>
                                                <button
                                                    className="p-2 glass-card border-white/5 hover:border-white/20 text-gray-500 hover:text-rose-400 transition-all shadow-lg"
                                                    title="Envoyer un rappel par email"
                                                    onClick={() => onSendReminder(u)}
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
