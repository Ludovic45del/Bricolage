import React from 'react';
import { Member } from '@/types';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils';
import { useHistoryFilters } from '@/hooks/data/useHistoryFilters';
import { History } from 'lucide-react';

interface PaymentHistoryProps {
    transactions: Transaction[];
    users: Member[];
    onSelectTransaction: (txId: string) => void;
}

const getMethodLabel = (method: string) => {
    switch (method) {
        case 'Card': return 'Carte Bancaire';
        case 'Check': return 'Chèque';
        case 'Cash': return 'Espèces';
        default: return method;
    }
};

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
    transactions,
    users,
    onSelectTransaction
}) => {
    const {
        filter,
        setFilter,
        sort,
        requestSort,
        filteredData: filteredTransactions,
        availableYears
    } = useHistoryFilters<Transaction>(transactions, (t) => t.date);

    return (
        <div className="mt-12">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center tracking-tight">
                <div className="w-1 h-6 bg-gray-500/50 rounded-full mr-4"></div>
                Historique des Paiements
            </h3>

            {/* Filter controls could be added here */}

            <div className="glass-card shadow-2xl border-white/5 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/5">
                        <thead className="bg-white/5">
                            <tr>
                                <th
                                    onClick={() => requestSort('date')}
                                    className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors"
                                >
                                    Date {sort.key === 'date' && (sort.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    onClick={() => requestSort('userId')}
                                    className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors"
                                >
                                    Membre {sort.key === 'userId' && (sort.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    onClick={() => requestSort('method')}
                                    className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors"
                                >
                                    Mode {sort.key === 'method' && (sort.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    onClick={() => requestSort('amount')}
                                    className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors"
                                >
                                    Montant {sort.key === 'amount' && (sort.direction === 'asc' ? '↑' : '↓')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-400 font-light">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-sm italic opacity-30">
                                        Aucun paiement récent.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map(tx => {
                                    const user = users.find(u => u.id === tx.userId);
                                    return (
                                        <tr
                                            key={tx.id}
                                            className="hover:bg-emerald-500/5 transition-colors group cursor-pointer"
                                            onClick={() => onSelectTransaction(tx.id)}
                                        >
                                            <td className="px-6 py-4 text-[10px] font-medium">{formatDate(tx.date)}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                                                {user?.name || 'Inconnu'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-300 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                                    {getMethodLabel(tx.method)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                                                {formatCurrency(Math.abs(tx.amount))}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
