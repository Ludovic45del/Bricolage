import { apiClient } from './client';
import { Transaction, TransactionType } from '@/types';

export interface TransactionsQueryParams {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    type?: TransactionType;
}

export const financeApi = {
    findAllTransactions: async (params?: TransactionsQueryParams): Promise<Transaction[]> => {
        const response = await apiClient.get<{ data: Transaction[] }>('/transactions', { params });
        return response.data.data;
    },

    createTransaction: async (data: Partial<Transaction>): Promise<Transaction> => {
        const response = await apiClient.post<Transaction>('/transactions', data);
        return response.data;
    },

    updateTransaction: async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
        const response = await apiClient.patch<Transaction>(`/transactions/${id}`, data);
        return response.data;
    },

    // Optional: Get financial stats if backend supports it
    getStats: async (): Promise<any> => {
        const response = await apiClient.get('/finance/stats');
        return response.data;
    }
};
