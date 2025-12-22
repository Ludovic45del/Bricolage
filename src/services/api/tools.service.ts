import { apiClient } from './client';
import { Tool, CreateToolDTO, ToolsQueryParams } from '@/types';

export const toolsApi = {
    findAll: async (params?: ToolsQueryParams): Promise<Tool[]> => {
        const response = await apiClient.get<{ data: Tool[] }>('/tools', { params });
        return response.data.data;
    },

    findOne: async (id: string): Promise<Tool> => {
        const response = await apiClient.get<Tool>(`/tools/${id}`);
        return response.data;
    },

    create: async (data: CreateToolDTO): Promise<Tool> => {
        const response = await apiClient.post<Tool>('/tools', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Tool>): Promise<Tool> => {
        const response = await apiClient.patch<Tool>(`/tools/${id}`, data);
        return response.data;
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
        formData.append('file', file);
        formData.append('type', type);
        await apiClient.post(`/tools/${toolId}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};
