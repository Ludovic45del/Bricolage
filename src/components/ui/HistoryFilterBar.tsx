import React from 'react';
import { FilterState, Semester } from '@/hooks/data/useHistoryFilters';
import { Filter, ChevronDown, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface HistoryFilterBarProps {
    filter: FilterState;
    setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
    availableYears: number[];
    tools?: { id: string; name: string }[];
}

export const HistoryFilterBar: React.FC<HistoryFilterBarProps> = ({
    filter,
    setFilter,
    availableYears,
    tools
}) => {
    const [isYearOpen, setIsYearOpen] = useState(false);
    const [isToolOpen, setIsToolOpen] = useState(false);

    const selectedToolName = tools?.find(t => t.id === filter.toolId)?.name || 'Tous les outils';

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mr-4 shrink-0">
                <Filter className="w-4 h-4" />
                Filtres
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar">
                {/* Year Selection */}
                <div className="relative z-50 shrink-0">
                    <button
                        onClick={() => setIsYearOpen(!isYearOpen)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${isYearOpen
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/50'
                            : 'bg-[#0f172a] text-white border-white/10 hover:border-purple-500/30'
                            }`}
                    >
                        <span className="text-gray-400">Année:</span>
                        <span className="font-bold">{filter.year}</span>
                        <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${isYearOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    <AnimatePresence>
                        {isYearOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsYearOpen(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-0 mt-2 w-full min-w-[120px] bg-[#1e293b] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 py-1"
                                >
                                    {availableYears.map(year => (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                setFilter(prev => ({ ...prev, year }));
                                                setIsYearOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${filter.year === year
                                                ? 'bg-purple-500 text-white font-bold'
                                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Tool Selection (Optional) */}
                {tools && (
                    <div className="relative z-40 shrink-0">
                        <button
                            onClick={() => setIsToolOpen(!isToolOpen)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all whitespace-nowrap ${isToolOpen || filter.toolId
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/50'
                                : 'bg-[#0f172a] text-white border-white/10 hover:border-blue-500/30'
                                }`}
                        >
                            <Wrench className="w-3.5 h-3.5" />
                            <span className="font-bold max-w-[150px] truncate">{selectedToolName}</span>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform duration-300 ${isToolOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        <AnimatePresence>
                            {isToolOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setIsToolOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full left-0 mt-2 w-[250px] max-h-[300px] overflow-y-auto bg-[#1e293b] border border-white/10 rounded-xl shadow-xl z-50 py-1 custom-scrollbar"
                                    >
                                        <button
                                            onClick={() => {
                                                setFilter(prev => ({ ...prev, toolId: '' }));
                                                setIsToolOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-white/5 ${!filter.toolId
                                                ? 'bg-blue-500 text-white font-bold'
                                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            Tous les outils
                                        </button>
                                        {tools.map(tool => (
                                            <button
                                                key={tool.id}
                                                onClick={() => {
                                                    setFilter(prev => ({ ...prev, toolId: tool.id }));
                                                    setIsToolOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${filter.toolId === tool.id
                                                    ? 'bg-blue-500 text-white font-bold'
                                                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                {tool.name}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Mode Toggle */}
                <div className="flex bg-[#0f172a] p-1 rounded-xl border border-white/10 shrink-0">
                    <button
                        onClick={() => setFilter(prev => ({ ...prev, mode: 'year' }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter.mode === 'year'
                            ? 'bg-purple-500 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'}`}
                    >
                        Année
                    </button>
                    <button
                        onClick={() => setFilter(prev => ({ ...prev, mode: 'semester' }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter.mode === 'semester'
                            ? 'bg-purple-500 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'}`}
                    >
                        Semestre
                    </button>
                </div>

                {/* Semester Selection (Conditional) */}
                {filter.mode === 'semester' && (
                    <div className="flex bg-[#0f172a] p-1 rounded-xl border border-white/10 animate-fade-in shrink-0">
                        <button
                            onClick={() => setFilter(prev => ({ ...prev, semester: 'S1' }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter.semester === 'S1'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'}`}
                        >
                            S1 (Jan-Juin)
                        </button>
                        <button
                            onClick={() => setFilter(prev => ({ ...prev, semester: 'S2' }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter.semester === 'S2'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'}`}
                        >
                            S2 (Juil-Déc)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
