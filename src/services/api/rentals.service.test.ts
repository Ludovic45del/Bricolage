import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rentalsApi } from './rentals.service';
import { apiClient } from './client';
import { Rental, CreateRentalDTO } from '@/types';

// Mock the apiClient
vi.mock('./client', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('rentalsApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockRental: Rental = {
        id: '1',
        userId: 'user-1',
        toolId: 'tool-1',
        startDate: '2025-12-27', // Friday
        endDate: '2026-01-03',
        status: 'pending',
        totalPrice: 20,
        createdAt: '2025-12-23T10:00:00Z',
        updatedAt: '2025-12-23T10:00:00Z',
        userName: 'John Doe',
        toolTitle: 'Perceuse',
    };

    describe('findAll', () => {
        it('fetches all rentals from /rentals', async () => {
            const mockRentals = [mockRental];
            vi.mocked(apiClient.get).mockResolvedValue({
                data: { data: mockRentals },
            });

            const result = await rentalsApi.findAll();

            expect(apiClient.get).toHaveBeenCalledWith('/rentals', { params: undefined });
            expect(result).toEqual(mockRentals);
        });

        it('passes query params correctly', async () => {
            vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [] } });

            await rentalsApi.findAll({
                status: 'active',
                userId: 'user-1',
                page: 1,
                pageSize: 10,
            });

            expect(apiClient.get).toHaveBeenCalledWith('/rentals', {
                params: {
                    status: 'active',
                    userId: 'user-1',
                    page: 1,
                    pageSize: 10,
                },
            });
        });

        it('handles empty response', async () => {
            vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [] } });

            const result = await rentalsApi.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('fetches a single rental by id', async () => {
            vi.mocked(apiClient.get).mockResolvedValue({ data: mockRental });

            const result = await rentalsApi.findOne('1');

            expect(apiClient.get).toHaveBeenCalledWith('/rentals/1');
            expect(result).toEqual(mockRental);
        });

        it('propagates 404 error', async () => {
            const error = { response: { status: 404, data: { message: 'Not found' } } };
            vi.mocked(apiClient.get).mockRejectedValue(error);

            await expect(rentalsApi.findOne('nonexistent')).rejects.toEqual(error);
        });
    });

    describe('create', () => {
        it('creates a new rental', async () => {
            const createData: CreateRentalDTO = {
                userId: 'user-1',
                toolId: 'tool-1',
                startDate: '2025-12-27',
                endDate: '2026-01-03',
                totalPrice: 20,
            };

            vi.mocked(apiClient.post).mockResolvedValue({ data: mockRental });

            const result = await rentalsApi.create(createData);

            expect(apiClient.post).toHaveBeenCalledWith('/rentals', createData);
            expect(result).toEqual(mockRental);
        });

        it('propagates validation errors', async () => {
            const error = {
                response: {
                    status: 400,
                    data: { message: 'Start date must be a Friday' },
                },
            };
            vi.mocked(apiClient.post).mockRejectedValue(error);

            await expect(
                rentalsApi.create({
                    userId: 'user-1',
                    toolId: 'tool-1',
                    startDate: '2025-12-25', // Thursday
                    endDate: '2026-01-01',
                })
            ).rejects.toEqual(error);
        });
    });

    describe('update', () => {
        it('updates a rental with PATCH', async () => {
            const updateData = { status: 'active' as const };
            const updatedRental = { ...mockRental, status: 'active' as const };

            vi.mocked(apiClient.patch).mockResolvedValue({ data: updatedRental });

            const result = await rentalsApi.update('1', updateData);

            expect(apiClient.patch).toHaveBeenCalledWith('/rentals/1', updateData);
            expect(result.status).toBe('active');
        });
    });

    describe('returnRental', () => {
        it('returns a rental with POST to /return endpoint', async () => {
            const returnData = {
                endDate: '2026-01-03',
                comment: 'Tool returned in good condition',
            };
            const returnedRental = {
                ...mockRental,
                status: 'completed' as const,
                actualReturnDate: '2026-01-03',
                returnComment: 'Tool returned in good condition',
            };

            vi.mocked(apiClient.post).mockResolvedValue({ data: returnedRental });

            const result = await rentalsApi.returnRental('1', returnData);

            expect(apiClient.post).toHaveBeenCalledWith('/rentals/1/return', returnData);
            expect(result.status).toBe('completed');
            expect(result.returnComment).toBe('Tool returned in good condition');
        });

        it('handles return without comment', async () => {
            const returnData = { endDate: '2026-01-03' };

            vi.mocked(apiClient.post).mockResolvedValue({
                data: { ...mockRental, status: 'completed' },
            });

            await rentalsApi.returnRental('1', returnData);

            expect(apiClient.post).toHaveBeenCalledWith('/rentals/1/return', returnData);
        });
    });

    describe('delete', () => {
        it('deletes a rental', async () => {
            vi.mocked(apiClient.delete).mockResolvedValue({});

            await rentalsApi.delete('1');

            expect(apiClient.delete).toHaveBeenCalledWith('/rentals/1');
        });

        it('propagates error when rental cannot be deleted', async () => {
            const error = {
                response: {
                    status: 400,
                    data: { message: 'Cannot delete active rental' },
                },
            };
            vi.mocked(apiClient.delete).mockRejectedValue(error);

            await expect(rentalsApi.delete('1')).rejects.toEqual(error);
        });
    });
});
