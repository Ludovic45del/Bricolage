import { describe, it, expect } from 'vitest';
import {
    isDateFriday,
    formatCurrency,
    formatDate,
    calculateRentalCost,
    getStatusLabel,
    isMaintenanceExpired,
    isMaintenanceBlocked,
} from './utils';

describe('utils', () => {
    describe('isDateFriday', () => {
        it('returns true for a Friday date', () => {
            expect(isDateFriday('2025-12-26')).toBe(true); // Friday
        });

        it('returns false for a non-Friday date', () => {
            expect(isDateFriday('2025-12-25')).toBe(false); // Thursday
        });

        it('returns false for empty string', () => {
            expect(isDateFriday('')).toBe(false);
        });
    });

    describe('formatCurrency', () => {
        it('formats positive amounts correctly', () => {
            const result = formatCurrency(1234.56);
            expect(result).toContain('1');
            expect(result).toContain('234');
            expect(result).toContain('€');
        });

        it('formats zero correctly', () => {
            const result = formatCurrency(0);
            expect(result).toContain('0');
            expect(result).toContain('€');
        });

        it('formats negative amounts', () => {
            const result = formatCurrency(-50);
            expect(result).toContain('50');
            expect(result).toContain('€');
        });
    });

    describe('formatDate', () => {
        it('formats a valid ISO date string', () => {
            expect(formatDate('2025-12-22')).toBe('22/12/2025');
        });

        it('returns dash for empty string', () => {
            expect(formatDate('')).toBe('-');
        });
    });

    describe('calculateRentalCost', () => {
        it('calculates cost for multi-day rental', () => {
            const cost = calculateRentalCost('2025-01-01', '2025-01-08', 10);
            expect(cost).toBe(70); // 7 days * 10€
        });

        it('returns 0 for empty dates', () => {
            expect(calculateRentalCost('', '', 10)).toBe(0);
        });

        it('returns 0 for negative duration', () => {
            expect(calculateRentalCost('2025-01-08', '2025-01-01', 10)).toBe(0);
        });
    });

    describe('getStatusLabel', () => {
        it('translates available to Disponible', () => {
            expect(getStatusLabel('available')).toBe('Disponible');
        });

        it('translates rented to Loué', () => {
            expect(getStatusLabel('rented')).toBe('Loué');
        });

        it('translates maintenance', () => {
            expect(getStatusLabel('maintenance')).toBe('Maintenance');
        });

        it('returns original for unknown status', () => {
            expect(getStatusLabel('unknown')).toBe('unknown');
        });
    });

    describe('isMaintenanceExpired', () => {
        it('returns false when no maintenance date', () => {
            expect(isMaintenanceExpired(undefined, 6)).toBe(false);
        });

        it('returns false when no interval', () => {
            expect(isMaintenanceExpired('2024-01-01', undefined)).toBe(false);
        });

        it('returns true for expired maintenance', () => {
            // Maintenance done 1 year ago with 6 month interval
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            expect(isMaintenanceExpired(oneYearAgo.toISOString(), 6)).toBe(true);
        });
    });

    describe('isMaintenanceBlocked', () => {
        it('returns false for low importance tools', () => {
            const tool = {
                status: 'available',
                lastMaintenanceDate: '2020-01-01',
                maintenanceInterval: 6,
                maintenanceImportance: 'low' as const,
            };
            expect(isMaintenanceBlocked(tool)).toBe(false);
        });

        it('returns true for high importance expired tools', () => {
            const tool = {
                status: 'available',
                lastMaintenanceDate: '2020-01-01',
                maintenanceInterval: 6,
                maintenanceImportance: 'high' as const,
            };
            expect(isMaintenanceBlocked(tool)).toBe(true);
        });
    });
});
