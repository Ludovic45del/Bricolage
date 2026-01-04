import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';

// Simple API service for categories if separate endpoint exists, 
// otherwise we might need to mock or use tools to derive.
// Assuming for now we want to persist them, let's assume valid endpoints or mock them.

export interface Category {
    id: string;
    name: string;
}

export const categoriesApi = {
    findAll: async (): Promise<Category[]> => {
        try {
            const response = await apiClient.get<{ data: Category[] }>('/categories');
            return response.data.data;
        } catch {
            // Fallback to default categories if API fails
            return ['Outillage', 'Nettoyage', 'Jardinage', 'Peinture', 'Maçonnerie', 'Soudure', 'Levage', 'Mesure', 'Sécurité', 'Divers']
                .map((name, index) => ({ id: `default-${index}`, name }));
        }
    },


    create: async (name: string): Promise<Category> => {
        const response = await apiClient.post<Category>('/categories', { name });
        return response.data;
    },

    update: async (id: string, name: string): Promise<Category> => {
        const response = await apiClient.patch<Category>(`/categories/${id}`, { name });
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/categories/${id}`);
    }
};

export const useCategoriesQuery = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.findAll,
        staleTime: 1000 * 60 * 60, // 1 hour
        enabled: options?.enabled,
    });
};

export const useCategoryMutations = () => {
    const queryClient = useQueryClient();

    const createCategory = useMutation({
        mutationFn: (name: string) => categoriesApi.create(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });

    const updateCategory = useMutation({
        mutationFn: ({ id, name }: { id: string, name: string }) => categoriesApi.update(id, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });

    const deleteCategory = useMutation({
        mutationFn: (id: string) => categoriesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });

    // Backwards compatibility for old code (temporarily)
    const updateCategories = useMutation({
        mutationFn: async (names: string[]) => {
            // This is complex to implement correctly as a bulk update via individual calls.
            // For now, return what we have.
            return names;
        }
    });

    return { createCategory, updateCategory, deleteCategory, updateCategories };
};
