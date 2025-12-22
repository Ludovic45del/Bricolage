import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rentalsApi } from '@/services/api/rentals.service';
import { Rental, CreateRentalDTO, RentalsQueryParams } from '@/types';

export const useRentalsQuery = (params?: RentalsQueryParams, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['rentals', params],
        queryFn: () => rentalsApi.findAll(params),
        staleTime: 1000 * 60 * 2, // 2 minutes
        enabled: options?.enabled,
    });
};

export const useRentalMutations = () => {
    const queryClient = useQueryClient();

    const createRental = useMutation({
        mutationFn: (data: CreateRentalDTO) => rentalsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rentals'] });
        },
    });

    const updateRental = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Rental> }) => rentalsApi.update(id, data),
        onSuccess: (updatedRental) => {
            queryClient.invalidateQueries({ queryKey: ['rentals'] });
            queryClient.invalidateQueries({ queryKey: ['rentals', updatedRental.id] });
        },
    });

    const returnRental = useMutation({
        mutationFn: ({ id, returnData }: { id: string; returnData: { endDate: string; comment?: string } }) =>
            rentalsApi.returnRental(id, returnData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rentals'] });
            queryClient.invalidateQueries({ queryKey: ['tools'] }); // Returning functionality might affect tools status
        },
    });

    return {
        createRental,
        updateRental,
        returnRental,
    };
};
