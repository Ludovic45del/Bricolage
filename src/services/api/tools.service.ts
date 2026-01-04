import { apiClient } from './client';
import { Tool, CreateToolDTO, ToolsQueryParams } from '@/types';

// Helper to safely convert Prisma Decimal values (strings) to numbers
const safeNumber = (value: any): number | undefined => {
    if (value === null || value === undefined) return undefined;
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(num) || !isFinite(num) ? undefined : num;
};

// Transform tool data to ensure all numeric values are proper JavaScript numbers
const transformTool = (tool: any): Tool => ({
    ...tool,
    weeklyPrice: safeNumber(tool.weeklyPrice) ?? 0,
    purchasePrice: safeNumber(tool.purchasePrice),
    expectedLifespan: safeNumber(tool.expectedLifespan),
    maintenanceInterval: safeNumber(tool.maintenanceInterval),
    // Transform nested category if present
    category: tool.category ? {
        ...tool.category,
    } : undefined,
    // Transform conditions costs if present
    conditions: tool.conditions?.map((c: any) => ({
        ...c,
        cost: safeNumber(c.cost),
    })),
});

export const toolsApi = {
    findAll: async (params?: ToolsQueryParams): Promise<Tool[]> => {
        const response = await apiClient.get<{ data: any[] }>('/tools', { params });
        return response.data.data.map(transformTool);
    },

    findOne: async (id: string): Promise<Tool> => {
        const response = await apiClient.get<any>(`/tools/${id}`);
        return transformTool(response.data);
    },

    create: async (data: CreateToolDTO): Promise<Tool> => {
        const response = await apiClient.post<any>('/tools', data);
        return transformTool(response.data);
    },

    update: async (id: string, data: Partial<Tool>): Promise<Tool> => {
        const response = await apiClient.patch<any>(`/tools/${id}`, data);
        return transformTool(response.data);
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/tools/${id}`);
    },

    // Specific endpoints for uploading files if separate from create/update
    uploadImage: async (toolId: string, file: File): Promise<void> => {
        const formData = new FormData();
        formData.append('file', file);
        await apiClient.post(`/tools/${toolId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    uploadDocument: async (toolId: string, file: File, type: string): Promise<void> => {
        const formData = new FormData();
        formData.append('files', file); // Backend expects 'files'
        formData.append('type', type);
        await apiClient.post(`/tools/${toolId}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    removeImage: async (toolId: string, imageId: string): Promise<void> => {
        await apiClient.delete(`/tools/${toolId}/images/${imageId}`);
    },

    removeDocument: async (toolId: string, docId: string): Promise<void> => {
        await apiClient.delete(`/tools/${toolId}/documents/${docId}`);
    },

    addCondition: async (toolId: string, data: { statusAtTime: string; comment?: string; cost?: number }): Promise<any> => {
        const response = await apiClient.post(`/tools/${toolId}/conditions`, data);
        return response.data;
    }
};
