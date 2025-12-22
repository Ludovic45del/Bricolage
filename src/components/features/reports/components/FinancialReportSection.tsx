import React from 'react';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils';

interface FinancialReportSectionProps {
    stats: {
        totalPurchaseValue: number;
        totalVNC: number;
        totalDebt: number;
        revenueByCategory: Record<string, number>;
        toolProfitability: Array<{
            id: string;
            title: string;
            profit: number;
            revenue: number;
            repairCosts: number;
        }>;
    };
    onToolClick: (toolId: string) => void;
}

export const FinancialReportSection: React.FC<FinancialReportSectionProps> = ({ stats, onToolClick }) => {
    return (
        <section className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center tracking-tight">
                <div className="w-1 h-6 bg-emerald-500/50 rounded-full mr-4"></div>
                Volet Financier
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-purple-500/10 to-transparent">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Actifs Totaux (Achat)</p>
                    <p className="text-3xl font-black text-white">{formatCurrency(stats.totalPurchaseValue)}</p>
                </div>
                <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Valeur Nette (VNC Est.)</p>
                    <p className="text-3xl font-black text-white">{formatCurrency(stats.totalVNC)}</p>
                    <p className="text-[10px] text-gray-500 mt-2 italic">Estimation basée sur l'amortissement linéaire.</p>
                </div>
                <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-rose-500/10 to-transparent">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Dettes à Recouvrer</p>
                    <p className="text-3xl font-black text-white text-rose-400">{formatCurrency(stats.totalDebt)}</p>
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
                            {stats.toolProfitability.slice(0, 5).map(item => (
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
                            {Object.entries(stats.revenueByCategory).map(([cat, rev]) => {
                                const revenue = rev as number;
                                const maxRevenue = Math.max(...(Object.values(stats.revenueByCategory) as number[]), 1);
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
    );
};
