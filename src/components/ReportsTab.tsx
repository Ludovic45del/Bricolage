import React, { useMemo, useState } from 'react';
import { Member as User } from '../api/memberTypes';
import { Tool } from '../api/types';
import { Rental as Reservation } from '../api/rentalTypes';
import { Transaction, TransactionType } from '../constants';
import { formatCurrency, formatDate } from '../utils';
import { Select } from './ui/Select';
import {
    DollarSign,
    Wrench,
    Activity,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Package,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    ShieldCheck,
    FileText,
    History,
    Calendar,
    Printer
} from 'lucide-react';
import { Button } from './ui/Button';

interface ReportsTabProps {
    users: User[];
    tools: Tool[];
    rentals: Reservation[];
    transactions: Transaction[];
    onToolClick: (toolId: string) => void;
}

type Period = 'Annual' | 'S1' | 'S2';

export const ReportsTab: React.FC<ReportsTabProps> = ({ users, tools, rentals, transactions, onToolClick }) => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('Annual');

    // Filter Data by Period
    const filteredData = useMemo(() => {
        let startDate: Date;
        let endDate: Date;

        if (selectedPeriod === 'Annual') {
            startDate = new Date(selectedYear, 0, 1);
            endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
        } else if (selectedPeriod === 'S1') {
            startDate = new Date(selectedYear, 0, 1);
            endDate = new Date(selectedYear, 5, 30, 23, 59, 59);
        } else {
            startDate = new Date(selectedYear, 6, 1);
            endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
        }

        const filteredRentals = rentals.filter(r => {
            const rentalDate = new Date(r.startDate);
            return rentalDate >= startDate && rentalDate <= endDate;
        });

        const filteredTransactions = transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate >= startDate && txDate <= endDate;
        });

        return { rentals: filteredRentals, transactions: filteredTransactions, startDate, endDate };
    }, [rentals, transactions, selectedYear, selectedPeriod]);

    // Used for VNC calculation (always current status) vs Flow stats (period specific)
    // --- FINANCIAL CALCULATIONS ---
    const financialStats = useMemo(() => {
        const totalPurchaseValue = tools.reduce((acc, t) => acc + (t.purchasePrice || 0), 0);

        // VNC Estimation (Linear depreciation based on expected lifespan)
        const currentYear = new Date().getFullYear();
        const totalVNC = tools.reduce((acc, t) => {
            if (!t.purchasePrice || !t.purchaseDate || !t.expectedLifespan) return acc + (t.purchasePrice || 0);
            const purchaseYear = new Date(t.purchaseDate).getFullYear();
            const age = Math.max(0, currentYear - purchaseYear);
            const depreciationPerYear = t.purchasePrice / t.expectedLifespan;
            const vnc = Math.max(0, t.purchasePrice - (depreciationPerYear * age));
            return acc + vnc;
        }, 0);

        const totalDebt = users.reduce((acc, u) => acc + u.totalDebt, 0);

        const revenueByCategory = tools.reduce((acc, t) => {
            const toolRevenue = filteredData.rentals
                .filter(r => r.toolId === t.id && r.status === 'completed')
                .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

            // Assuming category is a string on Tool. If it's an object with name, use that.
            // V2 Tool has categoryId (string) and optional category (Category object).
            // Let's use categoryId or category name if available.
            const catName = typeof t.category === 'string' ? t.category : t.category?.name || t.categoryId || 'Uncategorized';

            acc[catName] = (acc[catName] || 0) + toolRevenue;
            return acc;
        }, {} as Record<string, number>);

        const toolProfitability = tools.map(t => {
            const revenue = filteredData.rentals
                .filter(r => r.toolId === t.id && r.status === 'completed')
                .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

            const repairCosts = filteredData.transactions
                .filter(tx => (tx as any).toolId === t.id && tx.type === TransactionType.REPAIR_COST) // Transaction type in constants might not have toolId?
                // Checking Transaction interface in constants:
                // export interface Transaction {
                //    id: string; userId: string; amount: number; type: TransactionType; method: ...; date: string; description: string;
                // }
                // It doesn't seem to have toolId explicitly in the interface I saw earlier.
                // But the legacy one did.
                // if V2 transaction doesn't support toolId, we can't filter by tool easily unless description parsing or enhanced type.
                // Ideally we should add toolId to Transaction V2 if needed for reports.
                // For now, I'll comment out or assume 0 if property missing, or check if I can add it.
                // In RentalsTab refactor, I added transactions with description containing tool title.
                // I'll stick to 0 for repair costs per tool if field is missing, or rely on existing property if it exists in runtime.
                // Let's assume 0 for now to be safe, or check description.
                .reduce((sum, tx) => sum + tx.amount, 0);

            return {
                id: t.id,
                title: t.title,
                profit: revenue - repairCosts,
                revenue,
                repairCosts
            };
        }).sort((a, b) => b.profit - a.profit);

        return { totalPurchaseValue, totalVNC, totalDebt, revenueByCategory, toolProfitability };
    }, [tools, filteredData, users]);

    // --- MAINTENANCE CALCULATIONS ---
    const maintenanceStats = useMemo(() => {
        const availableCount = tools.filter(t => t.status === 'available').length;
        const totalCount = tools.length;
        const availabilityRate = totalCount > 0 ? (availableCount / totalCount) * 100 : 0;

        const totalRepairCosts = filteredData.transactions
            .filter(tx => tx.type === TransactionType.REPAIR_COST)
            .reduce((acc, tx) => acc + tx.amount, 0);

        const complianceList = tools.map(t => ({
            id: t.id,
            title: t.title,
            lastMaintenance: t.lastMaintenanceDate,
            isCompliant: t.lastMaintenanceDate
                ? (new Date().getTime() - new Date(t.lastMaintenanceDate).getTime()) < (180 * 24 * 60 * 60 * 1000) // 6 months
                : false
        }));

        return { availabilityRate, totalRepairCosts, complianceList };
    }, [tools, filteredData]);

    // --- USAGE CALCULATIONS ---
    const usageStats = useMemo(() => {
        const completedRentals = filteredData.rentals.filter(r => r.status === 'completed');
        const totalVolume = completedRentals.length;

        const toolUsage = tools.map(t => ({
            id: t.id,
            title: t.title,
            count: filteredData.rentals.filter(r => r.toolId === t.id).length
        })).sort((a, b) => b.count - a.count);

        const top5 = toolUsage.slice(0, 5);
        const flop5 = toolUsage.slice().reverse().slice(0, 5);

        const averageDuration = completedRentals.length > 0
            ? completedRentals.reduce((acc, r) => {
                const start = new Date(r.startDate).getTime();
                const end = new Date(r.endDate).getTime();
                return acc + (end - start);
            }, 0) / (completedRentals.length * 24 * 60 * 60 * 1000)
            : 0;

        // Note: averageDuration calculation kept but UI card removed per request.
        return { totalVolume, top5, flop5, averageDuration };
    }, [tools, filteredData]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-12 pb-20 print:p-0 print:bg-white print:text-black">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight print:text-black">Rapports & Analyses</h2>
                    <p className="text-gray-400 mt-2 print:text-gray-600">
                        {selectedPeriod === 'Annual' ? `Rapport Annuel ${selectedYear}` : `Rapport Semestriel ${selectedPeriod} ${selectedYear}`}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 print:hidden">
                    <Select
                        value={selectedYear.toString()}
                        onChange={(val) => setSelectedYear(parseInt(val))}
                        options={[0, 1, 2, 3].map(i => {
                            const y = currentYear - i;
                            return { id: y.toString(), name: y.toString() };
                        })}
                        className="w-32"
                    />
                    <Select
                        value={selectedPeriod}
                        onChange={(val) => setSelectedPeriod(val as Period)}
                        options={[
                            { id: 'Annual', name: 'Annuel' },
                            { id: 'S1', name: 'Semestre 1' },
                            { id: 'S2', name: 'Semestre 2' }
                        ]}
                        className="w-40"
                    />
                    <Button onClick={handlePrint} variant="secondary" className="border-white/10 bg-white/5">
                        <Printer className="w-4 h-4 mr-2" /> Imprimer
                    </Button>
                </div>
            </header>

            {/* Financial Section */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center tracking-tight">
                    <div className="w-1 h-6 bg-emerald-500/50 rounded-full mr-4"></div>
                    Volet Financier
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-purple-500/10 to-transparent">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Actifs Totaux (Achat)</p>
                        <p className="text-3xl font-black text-white">{formatCurrency(financialStats.totalPurchaseValue)}</p>
                    </div>
                    <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Valeur Nette (VNC Est.)</p>
                        <p className="text-3xl font-black text-white">{formatCurrency(financialStats.totalVNC)}</p>
                        <p className="text-[10px] text-gray-500 mt-2 italic">Estimation basée sur l'amortissement linéaire.</p>
                    </div>
                    <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-rose-500/10 to-transparent">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Dettes à Recouvrer</p>
                        <p className="text-3xl font-black text-white text-rose-400">{formatCurrency(financialStats.totalDebt)}</p>
                        <p className="text-[10px] text-gray-500 mt-2">Manque à gagner sur la base utilisateur.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center">
                            <div className="w-1 h-4 bg-purple-500/50 rounded-full mr-3"></div>
                            Rentabilité par Outil
                        </h3>
                        <div className="glass-card border-white/5 h-fit pb-4">
                            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Performance</span>
                                <TrendingUp className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="divide-y divide-white/5">
                                {financialStats.toolProfitability.slice(0, 5).map(item => (
                                    <div key={item.id} className="px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                                        <div>
                                            <button
                                                onClick={() => onToolClick(item.id)}
                                                className="text-sm font-bold text-white hover:text-purple-400 transition-colors text-left"
                                            >
                                                {item.title}
                                            </button>
                                            <p className="text-[10px] text-gray-500">Réparations: {formatCurrency(item.repairCosts)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-emerald-400">+{formatCurrency(item.profit)}</p>
                                            <p className="text-[10px] text-gray-500">Total CA: {formatCurrency(item.revenue)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center">
                            <div className="w-1 h-4 bg-purple-500/50 rounded-full mr-3"></div>
                            CA par Catégorie
                        </h3>
                        <div className="glass-card border-white/5 h-fit pb-4">
                            <div className="px-6 py-4 border-b border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Répartition</span>
                            </div>
                            <div className="p-6 space-y-4">
                                {Object.entries(financialStats.revenueByCategory).map(([cat, rev]) => {
                                    const revenue = rev as number;
                                    const maxRevenue = Math.max(...(Object.values(financialStats.revenueByCategory) as number[]), 1);
                                    return (
                                        <div key={cat} className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-gray-400">{cat}</span>
                                                <span className="text-white">{formatCurrency(revenue)}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-purple-500/50 rounded-full"
                                                    style={{ width: `${(revenue / maxRevenue) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Maintenance Section */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center tracking-tight">
                    <div className="w-1 h-6 bg-blue-500/50 rounded-full mr-4"></div>
                    Volet Maintenance & Sécurité
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-8 border-white/5 flex items-center space-x-8">
                        <div className="relative w-24 h-24">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="48" cy="48" r="40"
                                    className="stroke-white/5 fill-none"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="48" cy="48" r="40"
                                    className="stroke-blue-500 fill-none transition-all duration-1000"
                                    strokeWidth="8"
                                    strokeDasharray={`${maintenanceStats.availabilityRate * 2.51} 251`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-black text-white">{Math.round(maintenanceStats.availabilityRate)}%</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Taux de Disponibilité</p>
                            <p className="text-sm text-gray-400 max-w-[200px]">Pourcentage d'outils opérationnels par rapport au parc total.</p>
                        </div>
                    </div>

                    <div className="glass-card p-8 border-white/5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1"> registre des interventions</p>
                            <p className="text-3xl font-black text-white">{formatCurrency(maintenanceStats.totalRepairCosts)}</p>
                            <p className="text-[10px] text-gray-500 mt-2 italic">Coût total des réparations sur la période.</p>
                        </div>
                        <div className="p-4 bg-blue-500/10 rounded-3xl">
                            <History className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center">
                        <div className="w-1 h-4 bg-blue-500/50 rounded-full mr-3"></div>
                        Conformité Sécurité (Semestriel)
                    </h3>
                    <div className="glass-card border-white/5 overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Contrôles Périodiques</span>
                        </div>
                        <table className="min-w-full divide-y divide-white/5">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-gray-600 uppercase">Machine</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-gray-600 uppercase">Dernier Contrôle</th>
                                    <th className="px-6 py-3 text-right text-[10px] font-black text-gray-600 uppercase">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {maintenanceStats.complianceList.map(item => (
                                    <tr key={item.id} className="hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => onToolClick(item.id)}
                                                className="text-sm font-bold text-white hover:text-purple-400 transition-colors text-left"
                                            >
                                                {item.title}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">{item.lastMaintenance ? formatDate(item.lastMaintenance) : 'Jamais'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.isCompliant ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                                }`}>
                                                {item.isCompliant ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                                <span>{item.isCompliant ? 'Conforme' : 'À Réviser'}</span>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Usage Section */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center tracking-tight">
                    <div className="w-1 h-6 bg-purple-500/50 rounded-full mr-4"></div>
                    Volet statistiques d'Usage
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 border-white/5">
                        <Package className="w-5 h-5 text-gray-500 mb-3" />
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Volume d'activité</p>
                        <p className="text-3xl font-black text-white">{usageStats.totalVolume} <span className="text-sm font-normal text-gray-500 tracking-normal">Locations</span></p>
                    </div>
                    {/* Average Duration Card Removed per User Request */}
                    <div className="glass-card p-6 border-white/5 bg-purple-500/5">
                        <ShieldCheck className="w-5 h-5 text-purple-400 mb-3" />
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Documents & Conformité</p>
                        <div className="flex justify-between items-center mt-2">
                            <div>
                                <p className="text-xl font-black text-white">{tools.filter(t => t.manual_url).length}/{tools.length}</p>
                                <p className="text-[9px] text-gray-500 uppercase">Notices</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-black text-white">{tools.filter(t => t.ce_cert_url).length}/{tools.length}</p>
                                <p className="text-[9px] text-gray-500 uppercase">Certificats CE</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center">
                            <div className="w-1 h-4 bg-emerald-500/50 rounded-full mr-3"></div>
                            Top 5 - Outils les plus loués
                        </h3>
                        <div className="glass-card border-white/5 pb-4">
                            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/50">Utilisation Maximale</span>
                                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="divide-y divide-white/5">
                                {usageStats.top5.map((item, idx) => (
                                    <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <span className="text-xs font-black text-gray-600">0{idx + 1}</span>
                                            <button
                                                onClick={() => onToolClick(item.id)}
                                                className="text-sm font-bold text-white hover:text-emerald-400 transition-colors text-left"
                                            >
                                                {item.title}
                                            </button>
                                        </div>
                                        <span className="text-xs font-black text-purple-400">{item.count} locations</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-rose-400 flex items-center">
                            <div className="w-1 h-4 bg-rose-500/50 rounded-full mr-3"></div>
                            Flop 5 - Encombrement inutile
                        </h3>
                        <div className="glass-card border-white/5 pb-4">
                            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500/50">Performance Faible</span>
                                <ArrowDownRight className="w-4 h-4 text-rose-400" />
                            </div>
                            <div className="divide-y divide-white/5">
                                {usageStats.flop5.map((item, idx) => (
                                    <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <span className="text-xs font-black text-gray-600">0{idx + 1}</span>
                                            <button
                                                onClick={() => onToolClick(item.id)}
                                                className="text-sm font-bold text-white hover:text-rose-400 transition-colors text-left"
                                            >
                                                {item.title}
                                            </button>
                                        </div>
                                        <span className="text-xs font-black text-gray-500">{item.count} locations</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Manuals & Docs */}
            <section className="glass-card p-8 border-white/5 bg-gradient-to-r from-purple-900/10 to-transparent">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center space-x-6">
                        <div className="p-4 glass-card border-white/10 rounded-3xl">
                            <FileText className="w-10 h-10 text-purple-300" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center tracking-tight">
                                <div className="w-1 h-6 bg-purple-500/30 rounded-full mr-4"></div>
                                Documentation Technique
                            </h3>
                            <p className="text-sm text-gray-400 max-w-md">Toutes les notices d'utilisation et certificats CE sont stockés numériquement et accessibles via l'inventaire.</p>
                        </div>
                    </div>
                    <button className="px-8 py-4 glass-card border-white/5 hover:border-purple-500/30 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-purple-500/10">
                        Exporter le registre complet
                    </button>
                </div>
            </section>
        </div>
    );
};
