import React, { useState, useMemo } from 'react';
import { Tool } from '@/services/api/types';
import { Member } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Wrench, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, getStatusLabel, isMaintenanceBlocked } from '@/utils';
import { differenceInDays, parseISO } from 'date-fns';

interface ToolDetailModalProps {
    tool: Tool | null;
    onClose: () => void;
    currentUser: Member;
    isActiveMember: boolean;
    startDate: string;
    endDate: string;
    onDateChange: (start: string, end: string) => void;
    dateError: string;
    onReserve: (estimatedPrice: number) => void;
}

export const ToolDetailModal: React.FC<ToolDetailModalProps> = ({
    tool,
    onClose,
    currentUser,
    isActiveMember,
    startDate,
    endDate,
    onDateChange,
    dateError,
    onReserve
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    const estimatedPrice = useMemo(() => {
        if (!startDate || !endDate || !tool) return 0;
        const days = differenceInDays(parseISO(endDate), parseISO(startDate));
        if (days < 0) return 0;
        return (tool.weeklyPrice / 7) * days;
    }, [startDate, endDate, tool]);

    if (!tool) return null;

    const maintenanceBlocked = isMaintenanceBlocked({ ...tool, maintenanceImportance: tool.maintenanceImportance });

    return (
        <>
            <Modal
                isOpen={true}
                onClose={onClose}
                title="Détails de l'Outil"
                size="6xl"
            >
                <div className="max-w-[1400px] mx-auto pb-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        <div className="space-y-6">
                            <div
                                className="relative group/img h-[450px] w-full rounded-[40px] overflow-hidden shadow-2xl border border-white/10 cursor-zoom-in bg-gradient-to-br from-gray-800/50 to-gray-900/50"
                                onClick={() => tool.images && tool.images.length > 0 && setZoomImage(tool.images[currentImageIndex]?.filePath)}
                            >
                                {tool.images && tool.images.length > 0 ? (
                                    <img
                                        src={tool.images[currentImageIndex]?.filePath}
                                        alt={tool.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Wrench className="w-24 h-24 text-gray-700/30" />
                                    </div>
                                )}
                                {tool.images && tool.images.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (tool.images && prev === 0 ? tool.images.length - 1 : prev - 1)); }}
                                            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-xl rounded-full text-white opacity-0 group-hover/img:opacity-100 transition-all hover:bg-black/60"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (tool.images && prev === tool.images.length - 1 ? 0 : prev + 1)); }}
                                            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-xl rounded-full text-white opacity-0 group-hover/img:opacity-100 transition-all hover:bg-black/60"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6 lg:sticky lg:top-0">
                            <div className="glass-card p-10 bg-white/5 border border-white/10 rounded-[48px] shadow-inner space-y-8">
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-5xl font-black text-white tracking-tighter leading-tight">{tool.title}</h3>
                                        <div className={`px-4 py-1.5 rounded-full inline-flex self-start ${tool.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                            {getStatusLabel(tool.status)}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-lg font-light leading-relaxed">{tool.description}</p>
                                </div>

                                <div className="flex items-center justify-between p-8 bg-white/5 border border-white/10 rounded-[32px] shadow-xl">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tarif Locatif</div>
                                        <div className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Par Semaine</div>
                                    </div>
                                    <div className="text-5xl font-black text-white tracking-tighter">
                                        {formatCurrency(tool.weeklyPrice)}
                                    </div>
                                </div>

                                {tool.status === 'available' ? (
                                    <div className="space-y-6 pt-4">
                                        {/* DateRangePicker here */}
                                        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center text-rose-300 font-bold">
                                            {/* Simplified for placeholder, should import DateRangePicker */}
                                            Période de réservation (utiliser le sélecteur)
                                        </div>

                                        {startDate && endDate && (
                                            <div className="text-white font-bold text-center text-xl">
                                                Total Estimé: {formatCurrency(estimatedPrice)}
                                            </div>
                                        )}

                                        <Button
                                            type="button"
                                            onClick={() => onReserve(estimatedPrice)}
                                            disabled={!isActiveMember || maintenanceBlocked}
                                            className="w-full py-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg"
                                        >
                                            Réserver
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center text-rose-300 font-bold">
                                        Indisponible
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {zoomImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in cursor-zoom-out p-4 md:p-10"
                    onClick={() => setZoomImage(null)}
                >
                    <img src={zoomImage} className="max-h-full max-w-full rounded-xl" alt="Zoom" />
                </div>
            )}
        </>
    );
};
