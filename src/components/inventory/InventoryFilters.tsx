import React, { useMemo } from 'react';
import { Search, LayoutGrid, List, Plus, Settings2 } from 'lucide-react';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface InventoryFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    categoryFilter: string;
    onCategoryFilterChange: (category: string) => void;
    categories: string[];
    statusFilter: string;
    onStatusFilterChange: (status: string) => void;
    maintenanceFilter: string;
    onMaintenanceFilterChange: (maintenance: string) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
    onAddTool: () => void;
    onManageCategories: () => void;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
    searchQuery,
    onSearchChange,
    categoryFilter,
    onCategoryFilterChange,
    categories,
    statusFilter,
    onStatusFilterChange,
    maintenanceFilter,
    onMaintenanceFilterChange,
    viewMode,
    onViewModeChange,
    onAddTool,
    onManageCategories
}) => {
    const uiCategories = useMemo(() => ['Toutes', ...categories], [categories]);

    return (
        <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center py-4 px-1">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto flex-1">
                <div className="relative w-full md:w-48">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        className="block w-full h-11 pl-10 pr-4 py-2.5 glass-input rounded-2xl text-sm font-medium transition-all focus:ring-0 placeholder-gray-500/50 text-white"
                        placeholder="Rechercher un outil..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="w-full md:w-44">
                    <Select
                        options={uiCategories.map(cat => ({ id: cat, name: cat }))}
                        value={categoryFilter}
                        onChange={onCategoryFilterChange}
                        placeholder="Toutes"
                    />
                </div>

                <div className="w-full md:w-44">
                    <Select
                        options={[
                            { id: 'Tous', name: 'Tous les statuts' },
                            { id: 'Available', name: 'Disponible' },
                            { id: 'Rented', name: 'Loué' },
                            { id: 'Maintenance', name: 'Maintenance' },
                            { id: 'Unavailable', name: 'Indisponible' }
                        ]}
                        value={statusFilter}
                        onChange={onStatusFilterChange}
                    />
                </div>

                <div className="w-full md:w-44">
                    <Select
                        options={[
                            { id: 'Tous', name: 'Maintenance: Tous' },
                            { id: 'Ok', name: 'À jour / Conforme' },
                            { id: 'Urgent', name: 'Proche (2 sem)' },
                            { id: 'Expired', name: 'Maintenance Expirée' },
                            { id: 'InMaintenance', name: 'En Révision' }
                        ]}
                        value={maintenanceFilter}
                        onChange={onMaintenanceFilterChange}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-end border-t xl:border-t-0 border-white/5 pt-4 xl:pt-0">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="md"
                        onClick={onManageCategories}
                        className="h-11 px-6 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
                    >
                        <Settings2 className="w-3.5 h-3.5 mr-2" />
                        Catégories
                    </Button>
                    <Button
                        size="md"
                        onClick={onAddTool}
                        className="h-11 px-6 bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 shadow-lg shadow-purple-500/5 text-xs font-bold uppercase tracking-widest"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nouveau
                    </Button>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 h-11">
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`px-3 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-purple-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        title="Vue Grille"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`px-3 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-purple-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        title="Vue Liste"
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
