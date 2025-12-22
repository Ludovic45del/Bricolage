import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi, TransactionsQueryParams } from '@/services/api/finance.service';
import { Transaction } from '@/types';

export const useTransactionsQuery = (params?: TransactionsQueryParams, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['transactions', params],
        queryFn: () => financeApi.findAllTransactions(params),
        staleTime: 1000 * 60 * 5,
        enabled: options?.enabled,
    });
};

export const useFinanceMutations = () => {
    const queryClient = useQueryClient();

    const createTransaction = useMutation({
        mutationFn: (data: Partial<Transaction>) => financeApi.createTransaction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });

    const updateTransaction = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Transaction> }) => financeApi.updateTransaction(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });

    return {
        createTransaction,
        updateTransaction,
    };
};
