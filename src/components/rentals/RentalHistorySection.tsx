import React from 'react';
import { Member as User } from '../../api/memberTypes';
import { Tool } from '../../api/types';
import { Rental as Reservation } from '../../api/rentalTypes';
import { formatCurrency, formatDate } from '../../utils';
import { History } from 'lucide-react';
import { useHistoryFilters, FilterState } from '../../hooks/useHistoryFilters';
import { HistoryFilterBar } from '../HistoryFilterBar';

interface RentalHistorySectionProps {
    rentals: Reservation[];
    users: User[];
    tools: Tool[];
    onViewRental: (rental: Reservation) => void;
}

const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed': return 'Terminé';
        case 'rejected': return 'Refusé';
        default: return status;
    }
};

export const RentalHistorySection: React.FC<RentalHistorySectionProps> = ({
    rentals,
    users,
    tools,
    onViewRental
}) => {
    const {
        filter,
        setFilter,
        sort,
        requestSort,
        filteredData: filteredRentals,
        availableYears
    } = useHistoryFilters<Reservation>(
        rentals,
        (r) => r.endDate || r.createdAt,
        (r) => r.toolId
    );

    return (
        <div className="pt-12 mt-10 border-t border-white/5 opacity-80 hover:opacity-100 transition-opacity">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center tracking-tight">
                <History className="w-6 h-6 mr-3 text-gray-500" /> Historique des Locations
            </h3>

            <HistoryFilterBar
                filter={filter}
                setFilter={setFilter}
                availableYears={availableYears}
                tools={tools.map(t => ({ id: t.id, name: t.title }))}
            />

            <div className="glass-card shadow-2xl border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/5">
                        <thead className="bg-white/5">
                            <tr>
                                <th
                                    onClick={() => requestSort('toolId')}
                                    className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors"
                                >
                                    Outil {sort.key === 'toolId' && (sort.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    onClick={() => requestSort('userId')}
                                    className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors"
                                >
                                    Membre {sort.key === 'userId' && (sort.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    onClick={() => requestSort('startDate')}
                                    className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors"
                                >
                                    Intervalles {sort.key === 'startDate' && (sort.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    onClick={() => requestSort('status')}
                                    className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors"
                                >
                                    Statut {sort.key === 'status' && (sort.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    onClick={() => requestSort('totalPrice')}
                                    className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors"
                                >
                                    Coût {sort.key === 'totalPrice' && (sort.direction === 'asc' ? '↑' : '↓')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-400 font-light">
                            {filteredRentals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-sm italic opacity-30">
                                        L'historique est vide.
                                    </td>
                                </tr>
                            ) : (
                                filteredRentals.map(rental => {
                                    const tool = tools.find(t => t.id === rental.toolId);
                                    const user = users.find(u => u.id === rental.userId);
                                    return (
                                        <tr
                                            key={rental.id}
                                            onClick={() => onViewRental(rental)}
                                            className="hover:bg-white/5 transition-colors group cursor-pointer"
                                        >
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
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${rental.status === 'completed'
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
        </div>
    );
};
