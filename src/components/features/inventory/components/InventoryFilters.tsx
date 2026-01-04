import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, LayoutGrid, List, Plus, Settings2, Filter } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Category } from '@/hooks/data/useCategoriesQuery';

interface InventoryFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    categoryFilter: string;
    onCategoryFilterChange: (category: string) => void;
    categories: Category[];
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
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const filterButtonRef = useRef<HTMLButtonElement>(null);

    const uiCategories = useMemo(() => [
        { id: 'Toutes', name: 'Toutes les catégories' },
        ...categories.map(cat => ({ id: cat.id, name: cat.name }))
    ], [categories]);

    // Count active filters (excluding defaults)
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (categoryFilter !== 'Toutes') count++;
        if (statusFilter !== 'Tous') count++;
        if (maintenanceFilter !== 'Tous') count++;
        return count;
    }, [categoryFilter, statusFilter, maintenanceFilter]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterButtonRef.current && !filterButtonRef.current.contains(event.target as Node)) {
                const portal = document.getElementById('filter-popover');
                const selectPortal = document.getElementById('select-portal');
                if (portal && portal.contains(event.target as Node)) return;
                if (selectPortal && selectPortal.contains(event.target as Node)) return;
                setIsFilterOpen(false);
            }
        };

        if (isFilterOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isFilterOpen]);

    const updatePosition = () => {
        if (filterButtonRef.current) {
            const rect = filterButtonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 8,
                left: rect.left,
                width: 320
            });
        }
    };

    return (
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center py-4 px-1">
            <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto flex-1">
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

                <button
                    ref={filterButtonRef}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`relative h-11 px-4 rounded-2xl glass-input text-sm font-medium transition-all flex items-center gap-2 ${isFilterOpen ? 'border-purple-500/50 bg-white/10' : 'hover:bg-white/5'
                        }`}
                >
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Filtres</span>
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {isFilterOpen && createPortal(
                    <div
                        id="filter-popover"
                        style={{
                            position: 'fixed',
                            top: coords.top,
                            left: coords.left,
                            width: coords.width
                        }}
                        className="z-[99999] liquid-glass rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-fade-in py-3 border border-white/10 backdrop-blur-3xl"
                    >
                        <div className="px-4 pb-2">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-3">Filtres avancés</h3>
                        </div>

                        <div className="space-y-3 px-4">
                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Catégorie</label>
                                <Select
                                    options={uiCategories}
                                    value={categoryFilter}
                                    onChange={onCategoryFilterChange}
                                    placeholder="Toutes"
                                />
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Statut</label>
                                <Select
                                    options={[
                                        { id: 'Tous', name: 'Tous les statuts' },
                                        { id: 'available', name: 'Disponible' },
                                        { id: 'rented', name: 'Loué' },
                                        { id: 'maintenance', name: 'Maintenance' },
                                        { id: 'unavailable', name: 'Indisponible' }
                                    ]}
                                    value={statusFilter}
                                    onChange={onStatusFilterChange}
                                />
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Maintenance</label>
                                <Select
                                    options={[
                                        { id: 'Tous', name: 'Tous' },
                                        { id: 'Ok', name: 'À jour / Conforme' },
                                        { id: 'Urgent', name: 'Proche (2 sem)' },
                                        { id: 'Expired', name: 'Expirée' },
                                        { id: 'InMaintenance', name: 'En Révision' }
                                    ]}
                                    value={maintenanceFilter}
                                    onChange={onMaintenanceFilterChange}
                                />
                            </div>
                        </div>

                        {activeFilterCount > 0 && (
                            <div className="px-4 pt-3 mt-3 border-t border-white/5">
                                <button
                                    onClick={() => {
                                        onCategoryFilterChange('Toutes');
                                        onStatusFilterChange('Tous');
                                        onMaintenanceFilterChange('Tous');
                                    }}
                                    className="w-full py-2 text-[10px] font-bold text-purple-400 hover:text-white transition-colors uppercase tracking-wider"
                                >
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        )}
                    </div>,
                    document.body
                )}
            </div>

            <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-end border-t xl:border-t-0 border-white/5 pt-4 xl:pt-0">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="md"
                        onClick={onManageCategories}
                        className="h-11 px-4 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
                    >
                        <Settings2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline ml-2">Catégories</span>
                    </Button>
                    <Button
                        size="md"
                        onClick={onAddTool}
                        className="h-11 px-4 bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 shadow-lg shadow-purple-500/5 text-xs font-bold uppercase tracking-widest"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline ml-2">Nouveau</span>
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
