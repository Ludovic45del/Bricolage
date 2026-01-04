import { apiClient } from './client';
import { Member } from '@/types';

export interface UsersQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
}

// Helper to safely convert Prisma Decimal values (strings) to numbers
const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(num) || !isFinite(num) ? 0 : num;
};

// Transform user data to ensure all numeric values are proper JavaScript numbers
const transformUser = (user: any): Member => ({
    ...user,
    totalDebt: safeNumber(user.totalDebt),
});

export const usersApi = {
    findAll: async (params?: UsersQueryParams): Promise<Member[]> => {
        // Backend returns { data: Member[], meta: ... }
        const response = await apiClient.get<{ data: any[] }>('/users', { params });
        return response.data.data.map(transformUser);
    },

    findOne: async (id: string): Promise<Member> => {
        const response = await apiClient.get<any>(`/users/${id}`);
        return transformUser(response.data);
    },

    create: async (data: Partial<Member>): Promise<Member> => {
        // Use the dedicated admin creation endpoint
        const response = await apiClient.post<any>('/users', data);
        return transformUser(response.data);
    },

    update: async (id: string, data: Partial<Member>): Promise<Member> => {
        const response = await apiClient.patch<any>(`/users/${id}`, data);
        return transformUser(response.data);
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },

    renewMembership: async (id: string, data: { amount: number; paymentMethod: 'card' | 'check' | 'cash'; durationMonths?: number }): Promise<Member> => {
        const response = await apiClient.post<any>(`/users/${id}/renew`, data);
        return transformUser(response.data);
    }
};
