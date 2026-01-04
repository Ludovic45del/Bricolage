import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import { Select } from '@/components/ui/Select';

interface UserCatalogFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    categoryFilter: string;
    onCategoryChange: (category: string) => void;
    categories: string[];
    showAvailableOnly: boolean;
    onToggleAvailable: (available: boolean) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
}

export const UserCatalogFilters: React.FC<UserCatalogFiltersProps> = ({
    searchQuery,
    onSearchChange,
    categoryFilter,
    onCategoryChange,
    categories,
    showAvailableOnly,
    onToggleAvailable,
    viewMode,
    onViewModeChange
}) => {
    return (
        <div className="glass-card p-4 mb-8 flex flex-col xl:flex-row gap-4 items-center justify-between border-white/5 relative z-30">
            <div className="relative w-full lg:w-[350px]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-500" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-4 h-[42px] glass-input rounded-xl text-sm transition-all focus:ring-0"
                    placeholder="Chercher..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center w-full xl:w-auto">
                <Select
                    options={categories.map((cat: any) => ({
                        id: cat.name || cat,
                        name: cat.name || cat
                    }))}
                    value={categoryFilter}
                    onChange={onCategoryChange}
                    className="w-full sm:w-48"
                />

                <label className="flex items-center justify-center cursor-pointer whitespace-nowrap group bg-white/5 px-4 h-[42px] rounded-xl border border-white/5 transition-all hover:bg-white/10 w-full sm:w-auto">
                    <div className="relative">
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={showAvailableOnly}
                            onChange={(e) => onToggleAvailable(e.target.checked)}
                        />
                        <div className={`block w-9 h-5 rounded-full transition-all duration-500 ${showAvailableOnly ? 'bg-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-white/10'}`}></div>
                        <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-all duration-500 ${showAvailableOnly ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3 text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors">Disponibles</span>
                </label>

                <div className="h-8 w-px bg-white/10 hidden sm:block mx-1"></div>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 h-[42px] items-center">
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-purple-500/20 text-purple-400 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        title="Vue Grandes Icones"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-purple-500/20 text-purple-400 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        title="Vue Lignes"
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
