import React from 'react';
import { History, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ToolStatus } from '@/types';

interface MaintenanceStatusCardProps {
    status: ToolStatus;
    setStatus: (status: ToolStatus) => void;
    comment: string;
    setComment: (comment: string) => void;
}

export const MaintenanceStatusCard: React.FC<MaintenanceStatusCardProps> = ({
    status,
    setStatus,
    comment,
    setComment
}) => {
    return (
        <div className="glass-card p-5 bg-white/5 border border-white/10 rounded-[32px] space-y-4">
            <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-2">
                <History className="w-3.5 h-3.5" /> État Actuel & Disponibilité
            </h4>

            <div className="grid grid-cols-3 gap-4">
                <button
                    type="button"
                    onClick={() => setStatus('available')}
                    className={`group flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all gap-1.5 ${status === 'available'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                        : 'border-white/5 bg-white/5 text-gray-500 hover:border-white/20 hover:bg-white/10'
                        }`}
                >
                    <div className={`p-1.5 rounded-xl ${status === 'available' ? 'bg-emerald-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                        <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Disponible</span>
                </button>
                <button
                    type="button"
                    onClick={() => setStatus('unavailable')}
                    className={`group flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all gap-1.5 ${status === 'unavailable'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
                        : 'border-white/5 bg-white/5 text-gray-500 hover:border-white/20 hover:bg-white/10'
                        }`}
                >
                    <div className={`p-1.5 rounded-xl ${status === 'unavailable' ? 'bg-rose-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                        <XCircle className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Indisponible</span>
                </button>
                <button
                    type="button"
                    onClick={() => setStatus('maintenance')}
                    className={`group flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all gap-1.5 ${status === 'maintenance'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                        : 'border-white/5 bg-white/5 text-gray-500 hover:border-white/20 hover:bg-white/10'
                        }`}
                >
                    <div className={`p-1.5 rounded-xl ${status === 'maintenance' ? 'bg-amber-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                        <AlertTriangle className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Maintenance</span>
                </button>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Commentaire de mise à jour</label>
                <textarea
                    className="block w-full rounded-2xl glass-input p-4 text-sm text-white resize-none leading-relaxed placeholder:text-gray-600"
                    rows={2}
                    placeholder="Détails sur l'état, raison du changement de statut..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                />
            </div>
        </div>
    );
};
