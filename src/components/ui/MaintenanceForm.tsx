import React, { useState, useMemo } from 'react';
import { Tool, ToolCondition, ToolStatus, MaintenanceImportance, ConditionAttachment } from '../../api/types';
import { Transaction, TransactionType } from '../../constants';
import { Button } from './Button';
import { Wrench, CheckCircle, AlertTriangle, FileText, Calendar, XCircle, Paperclip, Trash2, History, Upload, DollarSign } from 'lucide-react';
import { formatDate } from '../../utils';
import { DatePicker } from './DatePicker';
import { Select } from './Select';
import { parseISO, addMonths, isValid, format } from 'date-fns';
import { useStore } from '../../context/StoreContext';

interface MaintenanceFormProps {
    tool: Tool;
    onUpdate: (tool: Tool) => void;
    adminName: string; // Kept for API compatibility but used for display if needed
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ tool, onUpdate, adminName }) => {
    const { currentUser, addTransaction } = useStore();

    const [status, setStatus] = useState<ToolStatus>(tool.status);
    const [comment, setComment] = useState('');
    const [lastMaintenanceDate, setLastMaintenanceDate] = useState(tool.lastMaintenanceDate || new Date().toISOString());
    const [maintenanceInterval, setMaintenanceInterval] = useState(tool.maintenanceInterval || 6);
    const [maintenanceImportance, setMaintenanceImportance] = useState<MaintenanceImportance>(tool.maintenanceImportance || 'low');
    const [cost, setCost] = useState<string>('');

    // Local state for new attachments
    const [documents, setDocuments] = useState<{ name: string; url: string; date: string }[]>([]);

    const nextMaintenanceDate = useMemo(() => {
        if (!lastMaintenanceDate) return null;
        const date = parseISO(lastMaintenanceDate);
        if (!isValid(date)) return null;
        return addMonths(date, maintenanceInterval);
    }, [lastMaintenanceDate, maintenanceInterval]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file: File) => {
                const reader = new FileReader();
                reader.onload = () => {
                    if (reader.result) {
                        setDocuments(prev => [...prev, {
                            name: file.name,
                            url: reader.result as string,
                            date: new Date().toISOString()
                        }]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const attachments: ConditionAttachment[] = documents.map(d => ({
            id: Date.now().toString() + Math.random(),
            conditionId: '', // Assigned later or unused in simplified local handling
            name: d.name,
            filePath: d.url,
            createdAt: d.date
        }));

        const newCondition: ToolCondition = {
            id: Date.now().toString(),
            toolId: tool.id,
            adminId: currentUser?.id || 'unknown',
            createdAt: new Date().toISOString(),
            comment: comment.trim() || "Mise à jour état",
            statusAtTime: status,
            attachments: attachments
        };

        const updatedTool: Tool = {
            ...tool,
            status: status,
            conditions: [newCondition, ...(tool.conditions || [])],
            lastMaintenanceDate: lastMaintenanceDate,
            maintenanceInterval: maintenanceInterval,
            maintenanceImportance: maintenanceImportance,
        };

        const parsedCost = parseFloat(cost) || 0;
        if (parsedCost > 0) {
            newCondition.cost = parsedCost;

            addTransaction({
                id: Date.now().toString() + "-tx",
                userId: currentUser?.id || 'admin',
                toolId: tool.id,
                amount: parsedCost,
                type: TransactionType.REPAIR_COST,
                method: 'System',
                date: new Date().toISOString(),
                description: `Maintenance/Réparation: ${tool.title}`
            });
        }

        onUpdate(updatedTool);
        setComment('');
        setDocuments([]);
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1400px] mx-auto">
            {/* LEFT COLUMN: Maintenance & Status */}
            <div className="space-y-5">
                {/* Status Card */}
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

                {/* Importance & Scheduling */}
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
            </div>

            {/* RIGHT COLUMN: Documents & History Tracking */}
            <div className="flex flex-col h-full space-y-5">
                {/* Attachments for this update */}
                <div className="glass-card p-5 bg-white/5 border border-white/10 rounded-[32px] flex flex-col h-full">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                        <Paperclip className="w-3.5 h-3.5" /> Pièces Jointes & Rapports
                    </h4>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                            {documents.map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-2xl group transition-all">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="p-1.5 bg-purple-500/10 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                                            <FileText className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-bold text-white truncate">{doc.name}</span>
                                            <span className="text-[8px] text-gray-600 font-medium">{formatDate(doc.date)}</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeDocument(idx)}
                                        className="p-1.5 text-gray-600 hover:text-rose-400 transition-colors opacity-40 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <label className="cursor-pointer flex flex-col items-center justify-center gap-2 p-6 bg-white/5 border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 rounded-3xl transition-all group">
                            <Upload className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                            <div className="text-center">
                                <p className="text-[9px] font-black text-gray-400 group-hover:text-purple-300 uppercase tracking-widest">Ajouter un document</p>
                                <p className="text-[8px] text-gray-600 mt-0.5 uppercase tracking-tighter">PDF, Images</p>
                            </div>
                            <input
                                type="file"
                                multiple
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                    </div>

                    <div className="flex items-center justify-end pt-6 mt-auto">
                        <Button
                            type="submit"
                            className="w-full py-4 rounded-[20px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_15px_30px_-10px_rgba(16,185,129,0.5)] transition-all hover:scale-[1.01] active:scale-95 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" /> Enregistrer les Modifications
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
};
