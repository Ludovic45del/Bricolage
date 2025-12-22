import { Reservation as LegacyReservation } from '../types';

// ============================================
// Rental Status
// ============================================
export type RentalStatus = 'pending' | 'active' | 'completed' | 'late' | 'rejected';
export type RentalAction = 'created' | 'approved' | 'rejected' | 'returned' | 'overdue_notified' | 'price_adjusted';

// ============================================
// Rental
// ============================================
export interface Rental {
    id: string;
    userId: string;
    toolId: string;
    startDate: string; // ISO date (should be Friday)
    endDate: string;   // ISO date (should be Friday)
    actualReturnDate?: string;
    status: RentalStatus;
    totalPrice?: number;
    returnComment?: string;
    createdAt: string;
    updatedAt: string;

    // Populated from JOIN
    userName?: string;
    toolTitle?: string;
    toolWeeklyPrice?: number;
}

export interface CreateRentalDTO {
    userId: string;
    toolId: string;
    startDate: string;
    endDate: string;
    totalPrice?: number;
}

export interface UpdateRentalDTO {
    status?: RentalStatus;
    totalPrice?: number;
    actualReturnDate?: string;
    returnComment?: string;
}

// ============================================
// Rental History (Action logs)
// ============================================
export interface RentalHistory {
    id: string;
    rentalId: string;
    adminId: string;
    action: RentalAction;
    comment?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;

    // Populated
    adminName?: string;
}

export interface CreateHistoryDTO {
    action: RentalAction;
    comment?: string;
    metadata?: Record<string, unknown>;
}

// ============================================
// API Response Types
// ============================================
export interface RentalWithDetails extends Rental {
    historyCount: number;
}

// ============================================
// Query Parameters
// ============================================
export interface RentalsQueryParams {
    page?: number;
    pageSize?: number;
    status?: RentalStatus | RentalStatus[];
    userId?: string;
    toolId?: string;
    startDateFrom?: string;
    startDateTo?: string;
    sortBy?: 'createdAt' | 'startDate' | 'totalPrice';
    sortOrder?: 'asc' | 'desc';
}

// ============================================
// Frontend Helpers
// ============================================

/**
 * Convert legacy Reservation to new Rental format
 */
export const reservationToRental = (r: LegacyReservation): Rental => ({
    id: r.id,
    userId: r.user_id,
    toolId: r.tool_id,
    startDate: r.start_date,
    endDate: r.end_date,
    status: r.status.toLowerCase() as RentalStatus,
    totalPrice: r.total_price,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
});

/**
 * Check if a rental is overdue
 */
export const isRentalOverdue = (rental: Rental): boolean => {
    if (rental.status !== 'active') return false;
    return new Date(rental.endDate) < new Date();
};

/**
 * Get status display label
 */
export const getRentalStatusLabel = (status: RentalStatus): string => {
    const labels: Record<RentalStatus, string> = {
        pending: 'En attente',
        active: 'En cours',
        completed: 'Terminé',
        late: 'En retard',
        rejected: 'Refusé'
    };
    return labels[status];
};

/**
 * Get status color classes
 */
export const getRentalStatusColor = (status: RentalStatus): { bg: string; text: string; border: string } => {
    const colors: Record<RentalStatus, { bg: string; text: string; border: string }> = {
        pending: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20' },
        active: { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/20' },
        completed: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
        late: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/20' },
        rejected: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' }
    };
    return colors[status];
};
