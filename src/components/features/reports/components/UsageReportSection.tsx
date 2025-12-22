import React from 'react';
import { Package, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Tool } from '@/services/api/types';

interface UsageReportSectionProps {
    stats: {
        totalVolume: number;
        top5: Array<{ id: string; title: string; count: number }>;
        flop5: Array<{ id: string; title: string; count: number }>;
    };
    tools: Tool[];
    onToolClick: (toolId: string) => void;
}

export const UsageReportSection: React.FC<UsageReportSectionProps> = ({ stats, tools, onToolClick }) => {
    return (
        <section className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center tracking-tight">
                <div className="w-1 h-6 bg-purple-500/50 rounded-full mr-4"></div>
                Volet statistiques d'Usage
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-white/5">
                    <Package className="w-5 h-5 text-gray-500 mb-3" />
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Volume d'activité</p>
                    <p className="text-3xl font-black text-white">{stats.totalVolume} <span className="text-sm font-normal text-gray-500 tracking-normal">Locations</span></p>
                </div>
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
                            {stats.top5.map((item, idx) => (
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
                            {stats.flop5.map((item, idx) => (
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
    );
};
