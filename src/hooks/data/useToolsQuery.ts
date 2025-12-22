import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toolsApi } from '@/services/api/tools.service';
import { Tool, CreateToolDTO, ToolsQueryParams } from '@/types';

export const useToolsQuery = (params?: ToolsQueryParams, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['tools', params],
        queryFn: () => toolsApi.findAll(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: options?.enabled,
    });
};

export const useToolQuery = (id: string) => {
    return useQuery({
        queryKey: ['tools', id],
        queryFn: () => toolsApi.findOne(id),
        enabled: !!id,
    });
};

export const useToolMutations = () => {
    const queryClient = useQueryClient();

    const createTool = useMutation({
        mutationFn: (data: CreateToolDTO) => toolsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tools'] });
        },
    });

    const updateTool = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Tool> }) => toolsApi.update(id, data),
        onSuccess: (updatedTool) => {
            queryClient.invalidateQueries({ queryKey: ['tools'] });
            queryClient.invalidateQueries({ queryKey: ['tools', updatedTool.id] });
            // Also invalidate reports or other related queries if needed
        },
    });

    const deleteTool = useMutation({
        mutationFn: (id: string) => toolsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tools'] });
        },
    });

    return {
        createTool,
        updateTool,
        deleteTool,
    };
};
