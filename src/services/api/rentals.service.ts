import { apiClient } from './client';
import { Rental, CreateRentalDTO, RentalsQueryParams } from '@/types';

// Helper to convert Prisma Decimal values (strings) to numbers
const transformRental = (rental: any): Rental => ({
    ...rental,
    totalPrice: rental.totalPrice ? parseFloat(String(rental.totalPrice)) : undefined,
    toolWeeklyPrice: rental.tool?.weeklyPrice ? parseFloat(String(rental.tool.weeklyPrice)) : undefined,
});

export const rentalsApi = {
    findAll: async (params?: RentalsQueryParams): Promise<Rental[]> => {
        const response = await apiClient.get<{ data: any[] }>('/rentals', { params });
        return response.data.data.map(transformRental);
    },

    findOne: async (id: string): Promise<Rental> => {
        const response = await apiClient.get<any>(`/rentals/${id}`);
        return transformRental(response.data);
    },

    create: async (data: CreateRentalDTO): Promise<Rental> => {
        const response = await apiClient.post<any>('/rentals', data);
        return transformRental(response.data);
    },

    update: async (id: string, data: Partial<Rental>): Promise<Rental> => {
        const response = await apiClient.patch<any>(`/rentals/${id}`, data);
        return transformRental(response.data);
    },

    returnRental: async (id: string, returnData: { endDate: string; comment?: string }): Promise<Rental> => {
        const response = await apiClient.post<any>(`/rentals/${id}/return`, returnData);
        return transformRental(response.data);
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/rentals/${id}`);
    }
};
