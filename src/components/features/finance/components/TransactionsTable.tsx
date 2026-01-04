import React, { useState, useMemo } from 'react';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils';
import { getPaymentMethodLabel } from '@/utils/labels';
import { ArrowUpRight, ArrowDownLeft, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';

interface TransactionsTableProps {
    transactions: Transaction[];
    onStatusChange?: (transactionId: string, newStatus: 'pending' | 'paid') => void;
    onRowClick?: (transaction: Transaction) => void;
}

type SortKey = 'date' | 'user' | 'method' | 'description' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc';

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions, onStatusChange, onRowClick }) => {
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => {
            let comparison = 0;
            switch (sortKey) {
                case 'date':
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                    break;
                case 'user':
                    comparison = (a.user?.name || '').localeCompare(b.user?.name || '');
                    break;
                case 'method':
                    comparison = (a.method || '').localeCompare(b.method || '');
                    break;
                case 'description':
                    comparison = a.description?.localeCompare(b.description || '') || 0;
                    break;
                case 'amount':
                    comparison = a.amount - b.amount;
                    break;
                case 'status':
                    comparison = (a.status || '').localeCompare(b.status || '');
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [transactions, sortKey, sortDirection]);

    const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
        if (sortKey !== columnKey) return <ChevronDown className="w-3 h-3 opacity-30" />;
        return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
    };

    const columnHeaderClass = "px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors select-none";


    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase bg-white/5 text-gray-300">
                    <tr>
                        <th className={`${columnHeaderClass} rounded-tl-xl`} onClick={() => handleSort('date')}>
                            <div className="flex items-center gap-1">Date <SortIcon columnKey="date" /></div>
                        </th>
                        <th className={columnHeaderClass} onClick={() => handleSort('user')}>
                            <div className="flex items-center gap-1">Utilisateur <SortIcon columnKey="user" /></div>
                        </th>
                        <th className={columnHeaderClass} onClick={() => handleSort('method')}>
                            <div className="flex items-center gap-1">Mode <SortIcon columnKey="method" /></div>
                        </th>
                        <th className={columnHeaderClass} onClick={() => handleSort('description')}>
                            <div className="flex items-center gap-1">Description <SortIcon columnKey="description" /></div>
                        </th>
                        <th className={columnHeaderClass} onClick={() => handleSort('amount')}>
                            <div className="flex items-center gap-1">Montant <SortIcon columnKey="amount" /></div>
                        </th>
                        <th className={`${columnHeaderClass} rounded-tr-xl`} onClick={() => handleSort('status')}>
                            <div className="flex items-center gap-1">Statut <SortIcon columnKey="status" /></div>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {sortedTransactions.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">
                                Aucune transaction enregistrée.
                            </td>
                        </tr>
                    ) : (
                        sortedTransactions.map((tx) => (
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
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-widest bg-blue-500/10 text-blue-300 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                        {getPaymentMethodLabel(tx.method)}
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
                                    {tx.status === 'paid' ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Payé
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10">
                                            En attente
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
