import React from 'react';
import { Rental } from '@/types';
import { Tool } from '@/services/api/types';
import { formatDate, formatCurrency, getStatusLabel } from '@/utils';
import { Clock } from 'lucide-react';

interface UserReservationListProps {
    rentals: Rental[];
    tools: Tool[];
}

export const UserReservationList: React.FC<UserReservationListProps> = ({ rentals, tools }) => {
    if (rentals.length === 0) {
        return (
            <div className="glass-card shadow-2xl overflow-hidden border-white/5 p-20 text-center text-gray-600 font-light">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p>Aucun historique de location pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="glass-card shadow-2xl overflow-hidden border-white/5">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Outil</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Période</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Statut</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Montant</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {rentals.map(rental => {
                            const tool = tools.find(t => t.id === rental.toolId);
                            const categoryName = tool?.category?.name || tool?.categoryId || 'Inconnu';

                            return (
                                <tr key={rental.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                                            {tool?.title || 'Outil Inconnu'}
                                        </div>
                                        <div className="text-[10px] text-gray-600 font-medium">{categoryName}</div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-400 font-light">
                                        {formatDate(rental.startDate)} — {formatDate(rental.endDate)}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border backdrop-blur-md
                            ${rental.status === 'active' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                                                rental.status === 'pending' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
                                                    rental.status === 'rejected' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' :
                                                        'bg-white/5 text-gray-400 border-white/5'}`}>
                                            {getStatusLabel(rental.status)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-black text-white">
                                        {rental.totalPrice ? formatCurrency(rental.totalPrice) : '-'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
