import React, { useMemo, useState } from 'react';
import { Member, Rental, Transaction, TransactionType } from '@/types';
import { Tool } from '@/types';
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

// Robust number conversion function
const toNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return isNaN(value) || !isFinite(value) ? 0 : value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
    }
    // Handle Decimal objects from Prisma
    if (typeof value === 'object' && value !== null) {
        if (typeof value.toNumber === 'function') return value.toNumber();
        if (typeof value.toString === 'function') {
            const parsed = parseFloat(value.toString());
            return isNaN(parsed) ? 0 : parsed;
        }
    }
    return 0;
};

export const ReportsTab: React.FC<ReportsTabProps> = ({ users, tools, rentals, transactions, onToolClick }) => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('Annual');

    // Filter data by selected period
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

        // Filter rentals - include if rental period overlaps with selected period
        const safeRentals = Array.isArray(rentals) ? rentals : [];
        const filteredRentals = safeRentals.filter(r => {
            if (!r || !r.startDate) return false;
            try {
                const rentalStart = new Date(r.startDate);
                const rentalEnd = r.actualReturnDate ? new Date(r.actualReturnDate) : new Date(r.endDate);
                // Include if there's any overlap with the selected period
                return rentalEnd >= startDate && rentalStart <= endDate;
            } catch {
                return false;
            }
        });

        // Filter transactions
        const safeTransactions = Array.isArray(transactions) ? transactions : [];
        const filteredTransactions = safeTransactions.filter(t => {
            if (!t || !t.date) return false;
            try {
                const txDate = new Date(t.date);
                return txDate >= startDate && txDate <= endDate;
            } catch {
                return false;
            }
        });

        return { rentals: filteredRentals, transactions: filteredTransactions, startDate, endDate };
    }, [rentals, transactions, selectedYear, selectedPeriod]);

    // Calculate financial statistics
    const financialStats = useMemo(() => {
        const safeTools = Array.isArray(tools) ? tools : [];
        const safeUsers = Array.isArray(users) ? users : [];


        // Total purchase value of all tools
        let totalPurchaseValue = 0;
        safeTools.forEach(t => {
            totalPurchaseValue += toNumber(t?.purchasePrice);
        });

        // Net Carrying Value (VNC) - depreciated value
        let totalVNC = 0;
        safeTools.forEach(t => {
            const purchasePrice = toNumber(t?.purchasePrice);
            const lifespan = toNumber(t?.expectedLifespan);

            if (purchasePrice > 0 && t?.purchaseDate && lifespan > 0) {
                try {
                    const purchaseYear = new Date(t.purchaseDate).getFullYear();
                    const age = Math.max(0, currentYear - purchaseYear);
                    const depreciation = (purchasePrice / lifespan) * age;
                    totalVNC += Math.max(0, purchasePrice - depreciation);
                } catch {
                    totalVNC += purchasePrice;
                }
            } else {
                totalVNC += purchasePrice;
            }
        });

        // Total debt from all users
        // Total pending transactions (Global) replacing User Debt to match Finance tab "En Attente"
        let totalDebt = 0;
        const allTransactions = Array.isArray(transactions) ? transactions : [];
        allTransactions.forEach(t => {
            if (t?.status === 'pending') {
                totalDebt += toNumber(t.amount);
            }
        });

        // Revenue by category from completed rentals
        const revenueByCategory: Record<string, number> = {};
        const toolProfitabilityMap: Record<string, { id: string; title: string; revenue: number; repairCosts: number; }> = {};

        // Initialize all tools in profitability map
        safeTools.forEach(t => {
            if (t?.id) {
                toolProfitabilityMap[t.id] = {
                    id: t.id,
                    title: t.title || 'Outil inconnu',
                    revenue: 0,
                    repairCosts: 0
                };
            }
        });

        // Calculate revenue from completed rentals
        filteredData.rentals.forEach(r => {
            if (r?.status === 'completed' && r?.toolId) {
                // Get the rental price
                let price = toNumber(r.totalPrice);

                // If totalPrice is 0 or missing, try to use the tool's weekly price
                if (price <= 0) {
                    const tool = safeTools.find(t => t?.id === r.toolId);
                    price = toNumber(tool?.weeklyPrice);
                }

                // Add to tool profitability
                if (toolProfitabilityMap[r.toolId]) {
                    toolProfitabilityMap[r.toolId].revenue += price;
                }

                // Add to category revenue
                const tool = safeTools.find(t => t?.id === r.toolId);
                const categoryName = tool?.category?.name || 'Divers';
                revenueByCategory[categoryName] = (revenueByCategory[categoryName] || 0) + price;
            }
        });

        // Calculate repair costs from transactions
        filteredData.transactions.forEach(tx => {
            if (tx?.type === TransactionType.REPAIR_COST || tx?.type === 'RepairCost') {
                const toolId = (tx as any).toolId;
                const cost = toNumber(tx.amount);

                if (toolId && toolProfitabilityMap[toolId]) {
                    toolProfitabilityMap[toolId].repairCosts += cost;
                }
            }
        });

        // Convert to array and calculate profit
        const toolProfitability = Object.values(toolProfitabilityMap)
            .map(item => ({
                ...item,
                profit: item.revenue - item.repairCosts
            }))
            .sort((a, b) => b.profit - a.profit);

        return { totalPurchaseValue, totalVNC, totalDebt, revenueByCategory, toolProfitability };
    }, [tools, filteredData, users, currentYear]);

    // Calculate maintenance statistics
    const maintenanceStats = useMemo(() => {
        const safeTools = Array.isArray(tools) ? tools : [];

        const availableCount = safeTools.filter(t => t?.status === 'available').length;
        const totalCount = safeTools.length;
        const availabilityRate = totalCount > 0 ? (availableCount / totalCount) * 100 : 0;

        // Total repair costs from filtered transactions
        let totalRepairCosts = 0;
        filteredData.transactions.forEach(tx => {
            if (tx?.type === TransactionType.REPAIR_COST || tx?.type === 'RepairCost') {
                totalRepairCosts += toNumber(tx.amount);
            }
        });

        // Compliance list
        const complianceList = safeTools.map(t => {
            let isCompliant = false;
            if (t?.lastMaintenanceDate) {
                try {
                    const lastMaint = new Date(t.lastMaintenanceDate).getTime();
                    const sixMonthsAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);
                    isCompliant = lastMaint > sixMonthsAgo;
                } catch {
                    isCompliant = false;
                }
            }
            return {
                id: t?.id || '',
                title: t?.title || 'Outil inconnu',
                lastMaintenance: t?.lastMaintenanceDate,
                isCompliant
            };
        });

        return { availabilityRate, totalRepairCosts, complianceList };
    }, [tools, filteredData]);

    // Calculate usage statistics
    const usageStats = useMemo(() => {
        const safeTools = Array.isArray(tools) ? tools : [];

        const completedRentals = filteredData.rentals.filter(r => r?.status === 'completed');

        const toolUsage = safeTools.map(t => ({
            id: t?.id || '',
            title: t?.title || 'Outil inconnu',
            count: filteredData.rentals.filter(r => r?.toolId === t?.id).length
        })).sort((a, b) => b.count - a.count);

        return {
            totalVolume: completedRentals.length,
            top5: toolUsage.slice(0, 5),
            flop5: toolUsage.slice().reverse().slice(0, 5)
        };
    }, [tools, filteredData]);

    return (
        <div className="space-y-12 pb-20 print:p-0 print:bg-white print:text-black">
            <ReportsHeader
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                selectedPeriod={selectedPeriod}
                setSelectedPeriod={setSelectedPeriod}
                currentYear={currentYear}
            />

            <FinancialReportSection stats={financialStats} onToolClick={onToolClick} />

            <MaintenanceReportSection stats={maintenanceStats} onToolClick={onToolClick} />

            <UsageReportSection stats={usageStats} tools={tools} onToolClick={onToolClick} />
        </div>
    );
};
