import { useState, useMemo } from 'react';
import { getYear, getMonth, parseISO } from 'date-fns';

export type FilterMode = 'year' | 'semester';
export type Semester = 'S1' | 'S2';

export interface FilterState {
    mode: FilterMode;
    year: number;
    semester: Semester;
    toolId?: string;
}

export interface SortState<T> {
    key: keyof T | null;
    direction: 'asc' | 'desc';
}

export function useHistoryFilters<T>(
    data: T[],
    getDate: (item: T) => string | Date,
    getToolId?: (item: T) => string
) {
    const currentYear = new Date().getFullYear();
    const [filter, setFilter] = useState<FilterState>({
        mode: 'year',
        year: currentYear,
        semester: 'S1',
        toolId: ''
    });

    const [sort, setSort] = useState<SortState<T>>({
        key: null,
        direction: 'desc'
    });

    // Helper to toggle sort
    const requestSort = (key: keyof T) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sort.key === key && sort.direction === 'asc') {
            direction = 'desc';
        }
        setSort({ key, direction });
    };

    const filteredData = useMemo(() => {
        let result = [...data];

        // 1. Filter
        result = result.filter(item => {
            const dateStr = getDate(item);
            if (!dateStr) return false;

            const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
            const itemYear = getYear(date);
            const itemMonth = getMonth(date); // 0-11

            if (itemYear !== filter.year) return false;

            if (filter.mode === 'semester') {
                // S1: Jan (0) - Jun (5)
                // S2: Jul (6) - Dec (11)
                const isS1 = itemMonth <= 5;
                if (filter.semester === 'S1' && !isS1) return false;
                if (filter.semester === 'S2' && isS1) return false;
            }

            // TOOL FILTER
            if (filter.toolId && getToolId) {
                const itemId = getToolId(item);
                if (itemId !== filter.toolId) return false;
            }

            return true;
        });

        // 2. Sort
        if (sort.key) {
            result.sort((a, b) => {
                const valA = a[sort.key!];
                const valB = b[sort.key!];

                if (valA === valB) return 0;

                // Handle different types (string, number, boolean)
                if (typeof valA === 'string' && typeof valB === 'string') {
                    return sort.direction === 'asc'
                        ? valA.localeCompare(valB)
                        : valB.localeCompare(valA);
                }

                if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sort.direction === 'asc' ? 1 : -1;

                return 0;
            });
        }

        return result;

    }, [data, filter, sort, getDate, getToolId]);

    // Available years for dropdown (derived from data)
    const availableYears = useMemo(() => {
        const years = new Set<number>();
        years.add(currentYear); // Always include current year
        data.forEach(item => {
            const dateStr = getDate(item);
            if (dateStr) {
                const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
                years.add(getYear(date));
            }
        });
        return Array.from(years).sort((a, b) => b - a); // Descending
    }, [data, getDate, currentYear]);

    return {
        filter,
        setFilter,
        sort,
        requestSort,
        filteredData,
        availableYears
    };
}
