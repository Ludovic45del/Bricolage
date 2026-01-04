import { apiClient } from './client';
import { Transaction, TransactionType } from '@/types';

export interface TransactionsQueryParams {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    type?: TransactionType;
}

// Helper to safely convert Prisma Decimal values (strings) to numbers
const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(num) || !isFinite(num) ? 0 : num;
};

// Transform transaction data to ensure all numeric values are proper JavaScript numbers
const transformTransaction = (tx: any): Transaction => ({
    ...tx,
    amount: safeNumber(tx.amount),
    // Transform nested user if present
    user: tx.user ? {
        ...tx.user,
    } : undefined,
});

export const financeApi = {
    findAllTransactions: async (params?: TransactionsQueryParams): Promise<Transaction[]> => {
        const response = await apiClient.get<{ data: any[] }>('/transactions', { params });
        return response.data.data.map(transformTransaction);
    },

    createTransaction: async (data: Partial<Transaction>): Promise<Transaction> => {
        const response = await apiClient.post<any>('/transactions', data);
        return transformTransaction(response.data);
    },

    updateTransaction: async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
        const response = await apiClient.patch<any>(`/transactions/${id}`, data);
        return transformTransaction(response.data);
    },

    // Optional: Get financial stats if backend supports it
    getStats: async (): Promise<any> => {
        const response = await apiClient.get('/finance/stats');
        return response.data;
    }
};
