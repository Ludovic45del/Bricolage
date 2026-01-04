import React from 'react';
import { History, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils';

interface MaintenanceReportSectionProps {
    stats: {
        availabilityRate: number;
        totalRepairCosts: number;
        complianceList: Array<{
            id: string;
            title: string;
            lastMaintenance: string | null;
            isCompliant: boolean;
        }>;
    };
    onToolClick: (toolId: string) => void;
}

export const MaintenanceReportSection: React.FC<MaintenanceReportSectionProps> = ({ stats, onToolClick }) => {
    return (
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
                                strokeDasharray={`${stats.availabilityRate * 2.51} 251`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-white">{Math.round(stats.availabilityRate)}%</span>
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
                        <p className="text-3xl font-black text-white">{formatCurrency(stats.totalRepairCosts)}</p>
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
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/5">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-gray-600 uppercase">Machine</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-gray-600 uppercase">Dernier Contrôle</th>
                                    <th className="px-6 py-3 text-right text-[10px] font-black text-gray-600 uppercase">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats.complianceList.map(item => (
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
            </div>
        </section>
    );
};
