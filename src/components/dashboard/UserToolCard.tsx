import React from 'react';
import { Tool } from '../../api/types';
import { ArrowRight, Wrench } from 'lucide-react';
import { formatCurrency, getStatusLabel } from '../../utils';

interface UserToolCardProps {
    tool: Tool;
    viewMode: 'grid' | 'list';
    onClick: (tool: Tool) => void;
}

export const UserToolCard: React.FC<UserToolCardProps> = ({ tool, viewMode, onClick }) => {
    // Determine category display name
    const categoryName = tool.category?.name || tool.categoryId || 'Divers';
    const hasImage = tool.images && tool.images.length > 0;

    if (viewMode === 'grid') {
        return (
            <div
                className="glass-card overflow-hidden flex flex-col cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border-white/5 hover:border-white/20 group"
                onClick={() => onClick(tool)}
            >
                <div className="h-56 w-full relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                    {hasImage ? (
                        <img
                            src={tool.images![0].filePath}
                            alt={tool.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Wrench className="w-16 h-16 text-gray-700/30" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                    <div className={`absolute top-4 right-4 badge-liquid ${tool.status === 'available' ? 'badge-liquid-emerald' :
                        tool.status === 'maintenance' ? 'badge-liquid-amber' :
                            'badge-liquid-blue'
                        }`}>
                        {getStatusLabel(tool.status)}
                    </div>
                </div>
                <div className="p-6 flex-1 flex flex-col relative">
                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">{categoryName}</div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">{tool.title}</h3>
                    <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2 font-light leading-relaxed">{tool.description}</p>

                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Par semaine</span>
                            <span className="text-xl font-black text-white">{formatCurrency(tool.weeklyPrice)}</span>
                        </div>
                        <div className="p-2.5 rounded-xl glass-card border-white/10 group-hover:bg-white/10 transition-colors">
                            <ArrowRight className="w-5 h-5 text-purple-300" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="glass-card overflow-hidden flex flex-col md:flex-row cursor-pointer transition-all duration-500 hover:translate-x-2 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border-white/5 hover:border-white/20 group animate-fade-in"
            onClick={() => onClick(tool)}
        >
            <div className="h-48 md:h-auto md:w-64 relative overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                {hasImage ? (
                    <img
                        src={tool.images![0].filePath}
                        alt={tool.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Wrench className="w-12 h-12 text-gray-700/30" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-transparent"></div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">{categoryName}</div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">{tool.title}</h3>
                    </div>
                    <div className={`badge-liquid ${tool.status === 'available' ? 'badge-liquid-emerald' :
                        tool.status === 'maintenance' ? 'badge-liquid-amber' :
                            'badge-liquid-blue'
                        }`}>
                        {getStatusLabel(tool.status)}
                    </div>
                </div>
                <p className="text-sm text-gray-500 font-light leading-relaxed line-clamp-1 mb-4">{tool.description}</p>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Tarif Semaine</span>
                            <span className="text-xl font-black text-white">{formatCurrency(tool.weeklyPrice)}</span>
                        </div>
                        <div className="h-8 w-px bg-white/10"></div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Note</span>
                            <span className="text-[11px] text-gray-400 font-medium italic">
                                {tool.conditions?.[0]?.comment || "Aucun détail"}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">Voir détails</span>
                        <div className="p-3 rounded-xl glass-card border-white/10 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all duration-500 group-hover:scale-110 overflow-hidden">
                            <ArrowRight className="w-5 h-5 text-purple-300 group-hover:text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
