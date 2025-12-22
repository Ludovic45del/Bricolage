import React from 'react';
import { Wrench, DollarSign, Calendar } from 'lucide-react';
import { MaintenanceImportance } from '@/types';
import { DatePicker } from './DatePicker';
import { Select } from './Select';
import { format } from 'date-fns';

interface MaintenanceSchedulingCardProps {
    maintenanceImportance: MaintenanceImportance;
    setMaintenanceImportance: (importance: MaintenanceImportance) => void;
    lastMaintenanceDate: string;
    setLastMaintenanceDate: (date: string) => void;
    maintenanceInterval: number;
    setMaintenanceInterval: (interval: number) => void;
    cost: string;
    setCost: (cost: string) => void;
    nextMaintenanceDate: Date | null;
}

export const MaintenanceSchedulingCard: React.FC<MaintenanceSchedulingCardProps> = ({
    maintenanceImportance,
    setMaintenanceImportance,
    lastMaintenanceDate,
    setLastMaintenanceDate,
    maintenanceInterval,
    setMaintenanceInterval,
    cost,
    setCost,
    nextMaintenanceDate
}) => {
    return (
        <div className="glass-card p-5 bg-white/5 border border-white/10 rounded-[32px] space-y-4">
            <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                <Wrench className="w-3.5 h-3.5" /> Planification & Importance
            </h4>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Importance</label>
                    <Select
                        options={[
                            { id: 'low', name: '🟢 Faible' },
                            { id: 'medium', name: '🟡 Moyenne' },
                            { id: 'high', name: '🔴 Critique' }
                        ]}
                        value={maintenanceImportance}
                        onChange={val => setMaintenanceImportance(val as MaintenanceImportance)}
                        className="w-full"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Dernière Maintenance</label>
                    <DatePicker
                        date={lastMaintenanceDate}
                        onChange={setLastMaintenanceDate}
                        placeholder="JJ/MM/AAAA"
                    />
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Intervalle de Révision</label>
                        <p className="text-[9px] text-gray-600">Périodicité recommandée entre deux entretiens</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            min="1"
                            max="60"
                            className="w-16 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center text-sm font-black text-white focus:ring-1 focus:ring-purple-500/50 transition-all outline-none"
                            value={maintenanceInterval}
                            onChange={e => setMaintenanceInterval(parseInt(e.target.value) || 0)}
                        />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mois</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coût de l'intervention</span>
                    </div>
                    <div className="flex items-center bg-black/20 px-3 py-1.5 rounded-xl border border-white/10 focus-within:border-emerald-500/50 transition-all">
                        <span className="text-emerald-400 mr-2 text-xs font-bold">€</span>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="w-20 bg-transparent border-none p-0 text-sm font-black text-white focus:outline-none text-right placeholder:text-gray-700"
                            value={cost}
                            onChange={e => setCost(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prochaine Échéance Estimée</span>
                    </div>
                    <span className="text-sm font-black text-purple-400 bg-purple-500/5 px-4 py-1 rounded-full border border-purple-500/20">
                        {nextMaintenanceDate ? format(nextMaintenanceDate, 'dd MMMM yyyy') : '---'}
                    </span>
                </div>
            </div>
        </div>
    );
};
