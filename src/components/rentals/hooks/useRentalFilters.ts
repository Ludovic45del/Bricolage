import { useMemo } from 'react';
import { Reservation, User, Tool } from '../../../types';
import { parseISO } from 'date-fns';

interface UseRentalFiltersOptions {
    rentals: Reservation[];
    users: User[];
    tools: Tool[];
}

interface RentalWithDetails extends Reservation {
    user?: User;
    tool?: Tool;
    isLate: boolean;
}

interface UseRentalFiltersReturn {
    // Filtered lists (memoized)
    pendingRentals: RentalWithDetails[];
    activeRentals: RentalWithDetails[];
    completedRentals: RentalWithDetails[];
    rejectedRentals: RentalWithDetails[];
    lateRentals: RentalWithDetails[];
    historyRentals: RentalWithDetails[];

    // Stats
    stats: {
        total: number;
        pending: number;
        active: number;
        late: number;
        completed: number;
    };

    // Helper
    getRentalWithDetails: (rental: Reservation) => RentalWithDetails;
}

/**
 * Custom hook for filtering rentals with memoization
 * Enriches rentals with user/tool data and computes late status
 */
export const useRentalFilters = (options: UseRentalFiltersOptions): UseRentalFiltersReturn => {
    const { rentals, users, tools } = options;

    // Helper to enrich rental with details
    const getRentalWithDetails = (rental: Reservation): RentalWithDetails => {
        const user = users.find(u => u.id === rental.user_id);
        const tool = tools.find(t => t.id === rental.tool_id);
        const isLate = rental.status === 'Active' && parseISO(rental.end_date) < new Date();

        return {
            ...rental,
            user,
            tool,
            isLate
        };
    };

    // All rentals with details (memoized)
    const allRentalsWithDetails = useMemo(() =>
        rentals.map(getRentalWithDetails),
        [rentals, users, tools]
    );

    // Pending rentals
    const pendingRentals = useMemo(() =>
        allRentalsWithDetails.filter(r => r.status === 'Pending'),
        [allRentalsWithDetails]
    );

    // Active rentals
    const activeRentals = useMemo(() =>
        allRentalsWithDetails.filter(r => r.status === 'Active'),
        [allRentalsWithDetails]
    );

    // Completed rentals
    const completedRentals = useMemo(() =>
        allRentalsWithDetails.filter(r => r.status === 'Completed'),
        [allRentalsWithDetails]
    );

    // Rejected rentals
    const rejectedRentals = useMemo(() =>
        allRentalsWithDetails.filter(r => r.status === 'Rejected'),
        [allRentalsWithDetails]
    );

    // Late rentals (active but past end date)
    const lateRentals = useMemo(() =>
        activeRentals.filter(r => r.isLate),
        [activeRentals]
    );

    // History (completed + rejected)
    const historyRentals = useMemo(() =>
        [...completedRentals, ...rejectedRentals].sort(
            (a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
        ),
        [completedRentals, rejectedRentals]
    );

    // Stats
    const stats = useMemo(() => ({
        total: rentals.length,
        pending: pendingRentals.length,
        active: activeRentals.length,
        late: lateRentals.length,
        completed: completedRentals.length
    }), [rentals.length, pendingRentals.length, activeRentals.length, lateRentals.length, completedRentals.length]);

    return {
        pendingRentals,
        activeRentals,
        completedRentals,
        rejectedRentals,
        lateRentals,
        historyRentals,
        stats,
        getRentalWithDetails
    };
};

export default useRentalFilters;
