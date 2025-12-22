import { apiClient } from './client';
import { Rental, CreateRentalDTO, RentalsQueryParams } from '@/types';

export const rentalsApi = {
    findAll: async (params?: RentalsQueryParams): Promise<Rental[]> => {
        const response = await apiClient.get<{ data: Rental[] }>('/rentals', { params });
        return response.data.data;
    },

    findOne: async (id: string): Promise<Rental> => {
        const response = await apiClient.get<Rental>(`/rentals/${id}`);
        return response.data;
    },

    create: async (data: CreateRentalDTO): Promise<Rental> => {
        const response = await apiClient.post<Rental>('/rentals', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Rental>): Promise<Rental> => {
        const response = await apiClient.patch<Rental>(`/rentals/${id}`, data);
        return response.data;
    },

    returnRental: async (id: string, returnData: { endDate: string; comment?: string }): Promise<Rental> => {
        const response = await apiClient.post<Rental>(`/rentals/${id}/return`, returnData);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/rentals/${id}`);
    }
};
