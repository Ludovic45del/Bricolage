import React, { memo } from 'react';
import { Rental, Member, Tool } from '@/types';
import { formatDate, formatCurrency } from '@/utils';

interface RentalHistoryTableProps {
    rentals: Rental[];
    users: Member[];
    tools: Tool[];
    limit?: number;
}

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'Completed': return 'Terminé';
        case 'Rejected': return 'Refusé';
        case 'active': return 'En cours';
        case 'Pending': return 'En attente';
        default: return status;
    }
};

/**
 * Table component for rental history
 * Shows completed and rejected rentals
 */
export const RentalHistoryTable: React.FC<RentalHistoryTableProps> = memo(({
    rentals,
    users = [],
    tools = [],
    limit = 10
}) => {
    // Ensure arrays are defined
    const safeRentals = rentals ?? [];
    const safeTools = tools ?? [];
    const safeUsers = users ?? [];
    const displayRentals = safeRentals.slice(0, limit);

    return (
        <div className="glass-card shadow-2xl border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                Outil
                            </th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                Membre
                            </th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                Période
                            </th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                Statut
                            </th>
                            <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                Coût
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-400 font-light">
                        {displayRentals.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center text-sm italic opacity-30">
                                    L'historique est vide.
                                </td>
                            </tr>
                        ) : (
                            displayRentals.map(rental => {
                                const tool = safeTools.find(t => t.id === rental.toolId);
                                const user = safeUsers.find(u => u.id === rental.userId);

                                return (
                                    <tr key={rental.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                                            {tool?.title || 'Outil Disparu'}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                                            {user?.name || 'Inconnu'}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-xs font-medium tracking-tighter">
                                            {formatDate(rental.startDate)} — {formatDate(rental.endDate)}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${rental.status === 'Completed'
                                                ? 'bg-white/5 text-gray-500 border-white/10'
                                                : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                                                }`}>
                                                {getStatusLabel(rental.status)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-black text-white">
                                            {rental.totalPrice ? formatCurrency(rental.totalPrice) : '-'}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

RentalHistoryTable.displayName = 'RentalHistoryTable';

export default RentalHistoryTable;
