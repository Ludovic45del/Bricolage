import React, { useState, useMemo } from 'react';
import { Member, Tool, Rental } from '@/types';
import { formatCurrency, formatDate } from '@/utils';
import { X } from 'lucide-react';
import { FilterSelect } from '@/components/ui/FilterSelect';

interface RentalHistorySectionProps {
    rentals: Rental[];
    users: Member[];
    tools: Tool[];
    onViewRental: (rental: Rental) => void;
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
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [selectedSemester, setSelectedSemester] = useState<string>('all');

    // Get available years from rentals
    const availableYears = useMemo(() => {
        const years = [...new Set(rentals.map(r => new Date(r.endDate || r.createdAt).getFullYear()))].sort((a: number, b: number) => b - a);
        return years;
    }, [rentals]);


    const yearOptions = [
        { value: 'all', label: 'Toutes les années' },
        ...availableYears.map(year => ({ value: year.toString(), label: year.toString() }))
    ];

    const semesterOptions = [
        { value: 'all', label: 'Tous les semestres' },
        { value: '1', label: 'S1 (Jan-Juin)' },
        { value: '2', label: 'S2 (Juil-Déc)' },
    ];

    // Filter rentals
    const filteredRentals = useMemo(() => {
        return rentals.filter(r => {
            const date = new Date(r.endDate || r.createdAt);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const semester = month <= 6 ? 1 : 2;
            const yearMatch = selectedYear === 'all' || year.toString() === selectedYear;
            const semesterMatch = selectedSemester === 'all' || semester.toString() === selectedSemester;
            return yearMatch && semesterMatch;
        });
    }, [rentals, selectedYear, selectedSemester]);

    return (
        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-md">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h3 className="text-lg font-bold text-white">Historique des Locations</h3>
                <div className="flex items-center gap-3">
                    <FilterSelect
                        options={yearOptions}
                        value={selectedYear}
                        onChange={setSelectedYear}
                        placeholder="Année"
                    />
                    <FilterSelect
                        options={semesterOptions}
                        value={selectedSemester}
                        onChange={setSelectedSemester}
                        placeholder="Semestre"
                    />
                    {(selectedYear !== 'all' || selectedSemester !== 'all') && (
                        <button
                            onClick={() => { setSelectedYear('all'); setSelectedSemester('all'); }}
                            className="p-2 text-gray-400 hover:text-white bg-gray-900/80 border border-gray-700/50 rounded-xl transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="text-xs uppercase bg-white/5 text-gray-300">
                        <tr>
                            <th className="px-6 py-4 rounded-tl-xl">Outil</th>
                            <th className="px-6 py-4">Membre</th>
                            <th className="px-6 py-4">Période</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4 rounded-tr-xl text-right">Coût</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredRentals.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                                    Aucune location dans l'historique.
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
                                        className="hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="text-white font-medium">{tool?.title || 'Outil supprimé'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white font-medium">{user?.name || 'Inconnu'}</span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-white/70">
                                            {formatDate(rental.startDate)} → {formatDate(rental.endDate)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${rental.status === 'completed'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                }`}>
                                                {getStatusLabel(rental.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-white font-bold">
                                                {rental.totalPrice ? formatCurrency(rental.totalPrice) : '-'}
                                            </span>
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
};
