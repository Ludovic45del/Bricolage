import React from 'react';
import { History } from 'lucide-react';
import { ToolCondition } from '@/types';
import { formatDate, formatCurrency } from '@/utils';

interface ToolMaintenanceHistoryProps {
    conditions: ToolCondition[];
}

export const ToolMaintenanceHistory: React.FC<ToolMaintenanceHistoryProps> = ({ conditions }) => {
    return (
        <div className="space-y-3 pt-3 border-t border-white/5">
            <h5 className="text-[9px] font-black text-gray-500 uppercase tracking-wider px-2 flex items-center gap-1.5">
                <History className="w-3 h-3" /> Historique & Suivi
            </h5>
            <div className="relative ml-3 space-y-4 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-white/5 max-h-[250px] overflow-y-auto no-scrollbar pr-3">
                {conditions && conditions.length > 0 ? (
                    conditions.map((c) => (
                        <div key={c.id} className="relative pl-6 group/item">
                            <div className="absolute left-0 top-1 w-2 h-2 -translate-x-1/2 rounded-full bg-slate-900 border-2 border-white/10 group-hover/item:border-purple-500 group-hover/item:scale-125 transition-all duration-300"></div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-wide">{formatDate(c.createdAt)}</span>
                                <span className={`badge-liquid ${c.statusAtTime === 'available' ? 'badge-liquid-emerald' : 'badge-liquid-amber'} !text-[7px] !px-1 !py-0`}>
                                    {c.statusAtTime === 'available' ? 'RETOUR' : 'MAINTENANCE'}
                                </span>
                                {c.cost && c.cost > 0 && (
                                    <span className="text-[8px] font-black text-rose-400">
                                        -{formatCurrency(c.cost)}
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-300 font-light leading-relaxed italic group-hover/item:text-white transition-colors">
                                "{c.comment || 'Aucun commentaire.'}"
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-[9px] text-gray-600 italic pl-6">Aucun historique disponible.</div>
                )}
            </div>
        </div>
    );
};
