import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, UsersQueryParams } from '@/services/api/users';
import { Member } from '@/types';

export const useUsersQuery = (params?: UsersQueryParams, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: () => usersApi.findAll(params),
        // Keep previous data while fetching new page for smoother transition
        placeholderData: (previousData) => previousData,
        enabled: options?.enabled,
    });
};

export const useUserQuery = (id: string) => {
    return useQuery({
        queryKey: ['users', id],
        queryFn: () => usersApi.findOne(id),
        enabled: !!id,
    });
};

export const useUserMutations = () => {
    const queryClient = useQueryClient();

    const createUser = useMutation({
        mutationFn: usersApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const updateUser = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Member> }) =>
            usersApi.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['users', data.id] });
        },
    });

    const deleteUser = useMutation({
        mutationFn: usersApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const renewMembership = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { amount: number; paymentMethod: 'card' | 'check' | 'cash'; durationMonths?: number } }) =>
            usersApi.renewMembership(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['users', data.id] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });

    return {
        createUser,
        updateUser,
        deleteUser,
        renewMembership,
    };
};
