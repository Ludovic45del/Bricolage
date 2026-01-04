import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rentalsApi } from '@/services/api/rentals.service';
import { Rental, CreateRentalDTO, RentalsQueryParams } from '@/types';

export const useRentalsQuery = (params?: RentalsQueryParams, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['rentals', params],
        queryFn: () => rentalsApi.findAll(params),
        staleTime: 0, // Always refetch
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        enabled: options?.enabled,
    });
};

export const useRentalMutations = () => {
    const queryClient = useQueryClient();

    const createRental = useMutation({
        mutationFn: (data: CreateRentalDTO) => rentalsApi.create(data),
        onSuccess: async () => {
            // Force immediate refetch for instant UI update
            await queryClient.refetchQueries({ queryKey: ['rentals'] });
            await queryClient.refetchQueries({ queryKey: ['tools'] });
        },
    });

    const updateRental = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Rental> }) => rentalsApi.update(id, data),
        onSuccess: async () => {
            await queryClient.refetchQueries({ queryKey: ['rentals'] });
            await queryClient.refetchQueries({ queryKey: ['tools'] });
            await queryClient.refetchQueries({ queryKey: ['transactions'] });
        },
    });

    const returnRental = useMutation({
        mutationFn: ({ id, returnData }: { id: string; returnData: { endDate: string; comment?: string } }) =>
            rentalsApi.returnRental(id, returnData),
        onSuccess: async () => {
            await queryClient.refetchQueries({ queryKey: ['rentals'] });
            await queryClient.refetchQueries({ queryKey: ['tools'] });
        },
    });

    const deleteRental = useMutation({
        mutationFn: (id: string) => rentalsApi.delete(id),
        onSuccess: async () => {
            await queryClient.refetchQueries({ queryKey: ['rentals'] });
            await queryClient.refetchQueries({ queryKey: ['tools'] });
            await queryClient.refetchQueries({ queryKey: ['transactions'] });
        },
    });

    return {
        createRental,
        updateRental,
        returnRental,
        deleteRental,
    };
};
