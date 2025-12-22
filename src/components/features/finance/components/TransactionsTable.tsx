import React from 'react';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils';
import { ArrowUpRight, ArrowDownLeft, CheckCircle, ExternalLink } from 'lucide-react';

interface TransactionsTableProps {
    transactions: Transaction[];
    onStatusChange?: (transactionId: string, newStatus: 'pending' | 'paid') => void;
    onRowClick?: (transaction: Transaction) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions, onStatusChange, onRowClick }) => {
    const handleMarkAsPaid = (e: React.MouseEvent, tx: Transaction) => {
        e.stopPropagation(); // Prevent row click
        if (onStatusChange && tx.status !== 'paid') {
            onStatusChange(tx.id, 'paid');
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase bg-white/5 text-gray-300">
                    <tr>
                        <th className="px-6 py-4 rounded-tl-xl">Date</th>
                        <th className="px-6 py-4">Utilisateur</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Montant</th>
                        <th className="px-6 py-4 rounded-tr-xl">Statut</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {transactions.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">
                                Aucune transaction enregistrée.
                            </td>
                        </tr>
                    ) : (
                        transactions.map((tx) => (
                            <tr
                                key={tx.id}
                                className={`hover:bg-white/5 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                                onClick={() => onRowClick?.(tx)}
                            >
                                <td className="px-6 py-4 font-mono text-white/70">{formatDate(tx.date)}</td>
                                <td className="px-6 py-4">
                                    <span className="text-white font-medium">{tx.user?.name || tx.userId}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tx.type === 'Payment'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {tx.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-white/80 max-w-[200px] truncate">{tx.description}</td>
                                <td className="px-6 py-4">
                                    <div className={`flex items-center font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                                        {tx.amount > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownLeft className="w-4 h-4 mr-1 text-gray-500" />}
                                        {formatCurrency(Math.abs(tx.amount))}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {tx.status === 'paid' ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Payé
                                            </span>
                                        ) : (
                                            <span
                                                className="inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10"
                                            >
                                                En attente
                                            </span>
                                        )}
                                        {onRowClick && (
                                            <ExternalLink className="w-4 h-4 text-gray-500 hover:text-white transition-colors" />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
