import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatDate, getMaintenanceExpiration } from '@/utils';
import { MaintenanceImportance } from '@/types';

interface ToolMaintenanceHealthProps {
    maintenanceImportance: MaintenanceImportance;
    lastMaintenanceDate: string;
    maintenanceInterval: number;
}

export const ToolMaintenanceHealth: React.FC<ToolMaintenanceHealthProps> = ({
    maintenanceImportance,
    lastMaintenanceDate,
    maintenanceInterval
}) => {
    return (
        <div className="relative group">
            <div className={`absolute -inset-1 rounded-[36px] blur-md opacity-20 group-hover:opacity-30 transition duration-1000 ${maintenanceImportance === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
            <div className="relative glass-card p-8 bg-slate-900/60 border border-white/10 rounded-[32px] overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-2xl backdrop-blur-2xl ${maintenanceImportance === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">État de Maintenance</span>
                        <div className="text-[10px] font-bold uppercase tracking-widest">
                            <span className={maintenanceImportance === 'high' ? 'text-rose-400' : 'text-amber-400'}>
                                Priorité {maintenanceImportance === 'high' ? 'Critique' : maintenanceImportance === 'medium' ? 'Moyenne' : 'Faible'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-6">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Dernière Révision</span>
                        <div className="text-sm font-bold text-white">{formatDate(lastMaintenanceDate || '')}</div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Prochaine Échéance</span>
                        <div className="text-sm font-bold text-purple-400">
                            {getMaintenanceExpiration(lastMaintenanceDate, maintenanceInterval)
                                ? formatDate(getMaintenanceExpiration(lastMaintenanceDate, maintenanceInterval)?.toISOString() || '')
                                : '--'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
