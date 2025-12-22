import React, { useMemo, useState } from 'react';
import { Member, Rental, Transaction, TransactionType } from '@/types';
import { Tool } from '@/types';
import { FileText } from 'lucide-react';
import { ReportsHeader } from './ReportsHeader';
import { FinancialReportSection } from './FinancialReportSection';
import { MaintenanceReportSection } from './MaintenanceReportSection';
import { UsageReportSection } from './UsageReportSection';

interface ReportsTabProps {
    users: Member[];
    tools: Tool[];
    rentals: Rental[];
    transactions: Transaction[];
    onToolClick: (toolId: string) => void;
}

type Period = 'Annual' | 'S1' | 'S2';

export const ReportsTab: React.FC<ReportsTabProps> = ({ users, tools, rentals, transactions, onToolClick }) => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('Annual');

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

        return { rentals: filteredRentals, transactions: filteredTransactions };
    }, [rentals, transactions, selectedYear, selectedPeriod]);

    const financialStats = useMemo(() => {
        const totalPurchaseValue = tools.reduce((acc, t) => acc + (t.purchasePrice || 0), 0);
        const totalVNC = tools.reduce((acc, t) => {
            if (!t.purchasePrice || !t.purchaseDate || !t.expectedLifespan) return acc + (t.purchasePrice || 0);
            const purchaseYear = new Date(t.purchaseDate).getFullYear();
            const age = Math.max(0, currentYear - purchaseYear);
            const depreciationPerYear = t.purchasePrice / t.expectedLifespan;
            return acc + Math.max(0, t.purchasePrice - (depreciationPerYear * age));
        }, 0);

        const totalDebt = users.reduce((acc, u) => acc + u.totalDebt, 0);

        const revenueByCategory = tools.reduce((acc, t) => {
            const toolRevenue = filteredData.rentals
                .filter(r => r.toolId === t.id && r.status === 'completed')
                .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
            const catName = t.category?.name || t.categoryId || 'Divers';
            acc[catName] = (acc[catName] || 0) + toolRevenue;
            return acc;
        }, {} as Record<string, number>);

        const toolProfitability = tools.map(t => {
            const revenue = filteredData.rentals
                .filter(r => r.toolId === t.id && r.status === 'completed')
                .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
            const repairCosts = filteredData.transactions
                .filter(tx => (tx as any).toolId === t.id && tx.type === TransactionType.REPAIR_COST)
                .reduce((sum, tx) => sum + tx.amount, 0);
            return { id: t.id, title: t.title, profit: revenue - repairCosts, revenue, repairCosts };
        }).sort((a, b) => b.profit - a.profit);

        return { totalPurchaseValue, totalVNC, totalDebt, revenueByCategory, toolProfitability };
    }, [tools, filteredData, users, currentYear]);

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
                ? (new Date().getTime() - new Date(t.lastMaintenanceDate).getTime()) < (180 * 24 * 60 * 60 * 1000)
                : false
        }));

        return { availabilityRate, totalRepairCosts, complianceList };
    }, [tools, filteredData]);

    const usageStats = useMemo(() => {
        const completedRentals = filteredData.rentals.filter(r => r.status === 'completed');
        const toolUsage = tools.map(t => ({
            id: t.id,
            title: t.title,
            count: filteredData.rentals.filter(r => r.toolId === t.id).length
        })).sort((a, b) => b.count - a.count);

        return { totalVolume: completedRentals.length, top5: toolUsage.slice(0, 5), flop5: toolUsage.slice().reverse().slice(0, 5) };
    }, [tools, filteredData]);

    return (
        <div className="space-y-12 pb-20 print:p-0 print:bg-white print:text-black">
            <ReportsHeader
                selectedYear={selectedYear} setSelectedYear={setSelectedYear}
                selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod}
                currentYear={currentYear} handlePrint={() => window.print()}
            />

            <FinancialReportSection stats={financialStats} onToolClick={onToolClick} />

            <MaintenanceReportSection stats={maintenanceStats} onToolClick={onToolClick} />

            <UsageReportSection stats={usageStats} tools={tools} onToolClick={onToolClick} />

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

