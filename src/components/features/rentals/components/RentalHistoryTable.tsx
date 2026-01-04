import React, { memo, useState, useMemo } from 'react';
import { Rental, Member, Tool } from '@/types';
import { formatDate, formatCurrency } from '@/utils';
import { X, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { FilterSelect } from '@/components/ui/FilterSelect';

interface RentalHistoryTableProps {
    rentals: Rental[];
    users: Member[];
    tools: Tool[];
    limit?: number;
}

const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed': return 'Terminé';
        case 'rejected': return 'Refusé';
        case 'active': return 'En cours';
        case 'pending': return 'En attente';
        default: return status;
    }
};

type SortKey = 'tool' | 'user' | 'date' | 'status' | 'cost';
type SortDirection = 'asc' | 'desc';

export const RentalHistoryTable: React.FC<RentalHistoryTableProps> = memo(({
    rentals,
    users = [],
    tools = [],
}) => {
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [selectedSemester, setSelectedSemester] = useState<string>('all');
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const safeRentals = rentals ?? [];
    const safeTools = tools ?? [];
    const safeUsers = users ?? [];

    const availableYears = useMemo(() => {
        const years = [...new Set(safeRentals.map(r => new Date(r.endDate || r.createdAt).getFullYear()))].sort((a: number, b: number) => b - a);
        return years;
    }, [safeRentals]);

    const yearOptions = [
        { value: 'all', label: 'Toutes les années' },
        ...availableYears.map(year => ({ value: year.toString(), label: year.toString() }))
    ];

    const semesterOptions = [
        { value: 'all', label: 'Tous les semestres' },
        { value: '1', label: 'S1 (Jan-Juin)' },
        { value: '2', label: 'S2 (Juil-Déc)' },
    ];

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const filteredAndSortedRentals = useMemo(() => {
        let result = safeRentals.filter(r => {
            const date = new Date(r.endDate || r.createdAt);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const semester = month <= 6 ? 1 : 2;
            const yearMatch = selectedYear === 'all' || year.toString() === selectedYear;
            const semesterMatch = selectedSemester === 'all' || semester.toString() === selectedSemester;
            return yearMatch && semesterMatch;
        });

        result.sort((a, b) => {
            let comparison = 0;
            switch (sortKey) {
                case 'tool':
                    const toolA = safeTools.find(t => t.id === a.toolId)?.title || '';
                    const toolB = safeTools.find(t => t.id === b.toolId)?.title || '';
                    comparison = toolA.localeCompare(toolB);
                    break;
                case 'user':
                    const userA = safeUsers.find(u => u.id === a.userId)?.name || '';
                    const userB = safeUsers.find(u => u.id === b.userId)?.name || '';
                    comparison = userA.localeCompare(userB);
                    break;
                case 'date':
                    comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
                case 'cost':
                    comparison = (a.totalPrice || 0) - (b.totalPrice || 0);
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [safeRentals, safeTools, safeUsers, selectedYear, selectedSemester, sortKey, sortDirection]);

    const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
        if (sortKey !== columnKey) return <ChevronDown className="w-3 h-3 opacity-30" />;
        return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
    };

    const columnHeaderClass = "px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors select-none";

    return (
        <div className="bg-white/5 rounded-3xl p-4 md:p-6 border border-white/10 backdrop-blur-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-lg font-bold text-white">Historique des Locations</h3>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
                    <FilterSelect options={yearOptions} value={selectedYear} onChange={setSelectedYear} placeholder="Année" />
                    <FilterSelect options={semesterOptions} value={selectedSemester} onChange={setSelectedSemester} placeholder="Semestre" />
                    {(selectedYear !== 'all' || selectedSemester !== 'all') && (
                        <button onClick={() => { setSelectedYear('all'); setSelectedSemester('all'); }} className="p-2 text-gray-400 hover:text-white bg-gray-900/80 border border-gray-700/50 rounded-xl transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="text-xs uppercase bg-white/5 text-gray-300">
                        <tr>
                            <th className={`${columnHeaderClass} rounded-tl-xl`} onClick={() => handleSort('tool')}>
                                <div className="flex items-center gap-1">Outil <SortIcon columnKey="tool" /></div>
                            </th>
                            <th className={columnHeaderClass} onClick={() => handleSort('user')}>
                                <div className="flex items-center gap-1">Membre <SortIcon columnKey="user" /></div>
                            </th>
                            <th className={columnHeaderClass} onClick={() => handleSort('date')}>
                                <div className="flex items-center gap-1">Période <SortIcon columnKey="date" /></div>
                            </th>
                            <th className={columnHeaderClass} onClick={() => handleSort('status')}>
                                <div className="flex items-center gap-1">Statut <SortIcon columnKey="status" /></div>
                            </th>
                            <th className={`${columnHeaderClass} rounded-tr-xl text-right`} onClick={() => handleSort('cost')}>
                                <div className="flex items-center justify-end gap-1">Coût <SortIcon columnKey="cost" /></div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredAndSortedRentals.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">Aucune location dans l'historique.</td></tr>
                        ) : (
                            filteredAndSortedRentals.map(rental => {
                                const tool = safeTools.find(t => t.id === rental.toolId);
                                const user = safeUsers.find(u => u.id === rental.userId);
                                const isCompleted = rental.status.toLowerCase() === 'completed';
                                return (
                                    <tr key={rental.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4"><span className="text-white font-medium">{tool?.title || 'Outil supprimé'}</span></td>
                                        <td className="px-6 py-4"><span className="text-white font-medium">{user?.name || 'Inconnu'}</span></td>
                                        <td className="px-6 py-4 font-mono text-white/70">{formatDate(rental.startDate)} → {formatDate(rental.endDate)}</td>
                                        <td className="px-6 py-4">
                                            {isCompleted ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Terminé
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10">
                                                    {getStatusLabel(rental.status)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right"><span className="text-white font-bold">{rental.totalPrice ? formatCurrency(rental.totalPrice) : '-'}</span></td>
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
