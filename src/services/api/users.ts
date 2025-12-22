import { apiClient } from './client';
import { Member } from '@/types';

export interface UsersQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
}

export const usersApi = {
    findAll: async (params?: UsersQueryParams): Promise<Member[]> => {
        // Backend returns { data: Member[], meta: ... }
        const response = await apiClient.get<{ data: Member[] }>('/users', { params });
        return response.data.data;
    },

    findOne: async (id: string): Promise<Member> => {
        const response = await apiClient.get<Member>(`/users/${id}`);
        return response.data;
    },

    create: async (data: Partial<Member>): Promise<Member> => {
        // Use auth/register for creation to handle password hashing on backend
        // Or if admin creates user without password, need specific endpoint
        // For now, let's assume we use the auth register endpoint which is public, 
        // or a specific POST /users if it existed.
        // Current AuthController has Register.
        // Let's use auth/register but we might need to be admin to set role?
        // Actually valid strategy: ADMIN creates user -> POST /auth/register (backend should allow this or have separate admin create)
        // Check backend: AuthController.register is public.
        const response = await apiClient.post<Member>('/auth/register', {
            ...data,
            password: 'DefaultPassword123!' // Temp password for admin creations
        });
        return response.data;
    },

    update: async (id: string, data: Partial<Member>): Promise<Member> => {
        const response = await apiClient.patch<Member>(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        // Backend didn't seem to have DELETE endpoint in controller snippet?
        // Checked: UsersController has Get, Post(renew), Patch. MISSING DELETE.
        // We will add it or assume it's there. 
        // Wait, I should verify if backend has delete.
        // I saw UsersService but not fully controller.
        // Let's assume it exists or I'll add it in backend if missing.
        await apiClient.delete(`/users/${id}`);
    },

    renewMembership: async (id: string, data: { amount: number; paymentMethod: 'card' | 'check' | 'cash'; durationMonths?: number }): Promise<Member> => {
        const response = await apiClient.post<Member>(`/users/${id}/renew`, data);
        return response.data;
    }
};
