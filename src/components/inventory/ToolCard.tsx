import React, { useState } from 'react';
import { Tool } from '../../api/types';
import { getPlaceholderImage, formatCurrency, getStatusLabel, isMaintenanceExpired, isMaintenanceUrgent } from '../../utils';
import { ChevronRight, ChevronLeft, Wrench, AlertTriangle } from 'lucide-react';

interface ToolCardProps {
    tool: Tool;
    onClick: (tool: Tool) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const isExpired = isMaintenanceExpired(tool.lastMaintenanceDate, tool.maintenanceInterval);
    const isUrgent = isMaintenanceUrgent(tool.lastMaintenanceDate, tool.maintenanceInterval);

    const images = tool.images && tool.images.length > 0 ? tool.images : [];
    const hasImages = images.length > 0;
    const hasMultipleImages = images.length > 1;

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div
            onClick={() => onClick(tool)}
            className="group glass-card border-white/5 hover:border-white/20 rounded-3xl p-4 shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>

            {/* Image & Badges */}
            <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                {hasImages ? (
                    <img
                        src={images[currentImageIndex]?.filePath}
                        alt={tool.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Wrench className="w-12 h-12 text-gray-700/50" />
                    </div>
                )}

                {/* Navigation Arrows */}
                {hasMultipleImages && (
                    <>
                        <button
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-purple-500 hover:border-purple-500/50 transition-all duration-300 z-10"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-purple-500 hover:border-purple-500/50 transition-all duration-300 z-10"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(idx);
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex
                                        ? 'bg-purple-500 w-4'
                                        : 'bg-white/30 hover:bg-white/60'
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}

                <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                    <span className={`badge-liquid ${tool.status === 'available' ? 'badge-liquid-emerald' :
                        tool.status === 'rented' ? 'badge-liquid-blue' :
                            tool.status === 'maintenance' ? 'badge-liquid-amber' :
                                'badge-liquid-rose'
                        }`}>
                        {getStatusLabel(tool.status)}
                    </span>
                    {(tool.status === 'maintenance' || isExpired || isUrgent) && (
                        <span className={`badge-liquid flex items-center gap-1 ${tool.status === 'maintenance' ? 'badge-liquid-amber' :
                            isExpired ? 'badge-liquid-rose' :
                                'badge-liquid-amber'
                            }`}>
                            {tool.status === 'maintenance' ? <Wrench className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {tool.status === 'maintenance' ? 'Atelier' : isExpired ? 'Expiré' : 'Bientôt'}
                        </span>
                    )}
                </div>
                <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest">
                        {tool.category?.name || tool.categoryId || 'Divers'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-3 px-1">
                <h3 className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors line-clamp-1 tracking-tight">
                    {tool.title}
                </h3>

                <div className="flex items-end justify-between border-t border-white/5 pt-4">
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-0.5">Semaine</p>
                        <p className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{formatCurrency(tool.weeklyPrice)}</p>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-500/50 transition-all duration-300 shadow-inner group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

