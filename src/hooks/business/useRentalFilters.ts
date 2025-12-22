import { useState, useMemo } from 'react';
import { Rental } from '@/types';
import { isRentalOverdue } from '@/utils';

export const useRentalFilters = (rentals: Rental[] = []) => {
    const [statusFilter, setStatusFilter] = useState('Tous');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRentals = useMemo(() => {
        return rentals.filter(rental => {
            const matchesSearch = !searchQuery ||
                (rental.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (rental.toolTitle || '').toLowerCase().includes(searchQuery.toLowerCase());

            let matchesStatus = true;
            if (statusFilter !== 'Tous') {
                if (statusFilter === 'Retard') {
                    matchesStatus = isRentalOverdue(rental);
                } else {
                    matchesStatus = rental.status === statusFilter.toLowerCase(); // Assuming simple mapping
                }
            }

            return matchesSearch && matchesStatus;
        });
    }, [rentals, statusFilter, searchQuery]);

    return {
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        filteredRentals
    };
};
