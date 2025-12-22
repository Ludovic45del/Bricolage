import React from 'react';
import { History } from 'lucide-react';
import { ToolCondition } from '@/types';
import { formatDate, formatCurrency } from '@/utils';

interface ToolMaintenanceHistoryProps {
    conditions: ToolCondition[];
}

export const ToolMaintenanceHistory: React.FC<ToolMaintenanceHistoryProps> = ({ conditions }) => {
    return (
        <div className="space-y-6 pt-6 border-t border-white/5">
            <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                <History className="w-3.5 h-3.5" /> Historique & Suivi
            </h5>
            <div className="relative ml-4 space-y-6 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-white/5 max-h-[350px] overflow-y-auto no-scrollbar pr-4">
                {conditions && conditions.length > 0 ? (
                    conditions.map((c) => (
                        <div key={c.id} className="relative pl-8 group/item">
                            <div className="absolute left-0 top-1.5 w-2.5 h-2.5 -translate-x-1/2 rounded-full bg-slate-900 border-2 border-white/10 group-hover/item:border-purple-500 group-hover/item:scale-125 transition-all duration-300"></div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{formatDate(c.createdAt)}</span>
                                <span className={`badge-liquid ${c.statusAtTime === 'available' ? 'badge-liquid-emerald' : 'badge-liquid-amber'} !text-[7px] !px-1.5 !py-0`}>
                                    {c.statusAtTime === 'available' ? 'RETOUR' : 'MAINTENANCE'}
                                </span>
                                {c.cost && c.cost > 0 && (
                                    <span className="text-[10px] font-black text-rose-400">
                                        -{formatCurrency(c.cost)}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-300 font-light leading-relaxed italic group-hover/item:text-white transition-colors">
                                "{c.comment || 'Aucun commentaire.'}"
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-[10px] text-gray-600 italic pl-8">Aucun historique disponible.</div>
                )}
            </div>
        </div>
    );
};
