import React from 'react';
import { Tool } from '@/services/api/types';
import { formatCurrency, getStatusLabel, formatDate } from '@/utils';
import { ChevronRight, Calendar, Wrench } from 'lucide-react';

interface ToolListItemProps {
    tool: Tool;
    onClick: (tool: Tool) => void;
}

export const ToolListItem: React.FC<ToolListItemProps> = ({ tool, onClick }) => {
    const hasImage = tool.images && tool.images.length > 0;

    return (
        <div
            onClick={() => onClick(tool)}
            className="group glass-card border-white/5 hover:border-white/20 rounded-2xl p-4 shadow-md hover:shadow-xl hover:bg-white/5 transition-all duration-300 cursor-pointer flex items-center justify-between"
        >
            <div className="flex items-center gap-6">
                {/* Image */}
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {hasImage ? (
                        <img
                            src={tool.images![0].filePath}
                            alt={tool.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <Wrench className="w-8 h-8 text-gray-700/50" />
                    )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <div>
                        <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-lg">
                            {tool.category?.name || tool.categoryId || 'Divers'}
                        </span>
                        <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors mt-1 text-lg tracking-tight">
                            {tool.title}
                        </h3>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className={`badge-liquid ${tool.status === 'available' ? 'badge-liquid-emerald' :
                            tool.status === 'rented' ? 'badge-liquid-blue' :
                                tool.status === 'maintenance' ? 'badge-liquid-amber' :
                                    'badge-liquid-rose'
                            }`}>
                            {getStatusLabel(tool.status)}
                        </span>
                        {tool.lastMaintenanceDate && (
                            <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                                <Calendar className="w-3 h-3" />
                                Rev: {formatDate(tool.lastMaintenanceDate)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Action */}
            <div className="flex items-center gap-6 pr-4">
                <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-0.5">Semaine</p>
                    <p className="text-2xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">{formatCurrency(tool.weeklyPrice)}</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-500/50 transition-all duration-300 transform group-hover:translate-x-1 shadow-inner">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
