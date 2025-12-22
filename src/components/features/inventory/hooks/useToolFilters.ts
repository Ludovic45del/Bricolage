import { useMemo, useState, useCallback } from 'react';
import { Tool } from '@/types';

interface UseToolFiltersOptions {
    tools: Tool[];
    categories: string[];
}

interface UseToolFiltersReturn {
    // Filter state
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    selectedStatus: string;
    setSelectedStatus: (status: string) => void;

    // Results
    filteredTools: Tool[];

    // Stats
    stats: {
        total: number;
        available: number;
        rented: number;
        maintenance: number;
        unavailable: number;
    };

    // Actions
    clearFilters: () => void;
    hasActiveFilters: boolean;
}

/**
 * Custom hook for filtering and searching tools
 * Memoizes filtered results for performance
 */
export const useToolFilters = (options: UseToolFiltersOptions): UseToolFiltersReturn => {
    const { tools, categories } = options;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // Memoized filtered tools
    const filteredTools = useMemo(() => {
        return tools.filter(tool => {
            // Search filter
            const matchesSearch = searchQuery === '' ||
                tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.description?.toLowerCase().includes(searchQuery.toLowerCase());

            // Category filter
            const matchesCategory = selectedCategory === '' ||
                tool.categoryId === selectedCategory;

            // Status filter
            const matchesStatus = selectedStatus === '' ||
                tool.status === selectedStatus;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [tools, searchQuery, selectedCategory, selectedStatus]);

    // Memoized stats
    const stats = useMemo(() => ({
        total: tools.length,
        available: tools.filter(t => t.status === 'available').length,
        rented: tools.filter(t => t.status === 'rented').length,
        maintenance: tools.filter(t => t.status === 'maintenance').length,
        unavailable: tools.filter(t => t.status === 'unavailable').length
    }), [tools]);

    // Has active filters
    const hasActiveFilters = searchQuery !== '' || selectedCategory !== '' || selectedStatus !== '';

    // Clear all filters
    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedCategory('');
        setSelectedStatus('');
    }, []);

    return {
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedStatus,
        setSelectedStatus,
        filteredTools,
        stats,
        clearFilters,
        hasActiveFilters
    };
};

export default useToolFilters;
