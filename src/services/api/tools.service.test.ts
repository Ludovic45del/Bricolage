import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toolsApi } from './tools.service';
import { apiClient } from './client';
import { Tool, CreateToolDTO, ToolStatus } from '@/types';

// Mock the apiClient
vi.mock('./client', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('toolsApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockTool: Tool = {
        id: 'tool-1',
        title: 'Perceuse Bosch',
        description: 'Perceuse à percussion 750W',
        categoryId: 'cat-1',
        weeklyPrice: 10,
        purchasePrice: 150,
        purchaseDate: '2024-01-15',
        status: 'available',
        maintenanceImportance: 'medium',
        maintenanceInterval: 6,
        lastMaintenanceDate: '2024-06-15',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-06-15T10:00:00Z',
    };

    describe('findAll', () => {
        it('fetches all tools from /tools', async () => {
            const mockTools = [mockTool];
            vi.mocked(apiClient.get).mockResolvedValue({
                data: { data: mockTools },
            });

            const result = await toolsApi.findAll();

            expect(apiClient.get).toHaveBeenCalledWith('/tools', { params: undefined });
            expect(result).toEqual(mockTools);
        });

        it('passes search and filter params', async () => {
            vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [] } });

            await toolsApi.findAll({
                search: 'perceuse',
                categoryId: 'cat-1',
                status: 'available',
                page: 1,
                pageSize: 20,
            });

            expect(apiClient.get).toHaveBeenCalledWith('/tools', {
                params: {
                    search: 'perceuse',
                    categoryId: 'cat-1',
                    status: 'available',
                    page: 1,
                    pageSize: 20,
                },
            });
        });

        it('handles empty tool list', async () => {
            vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [] } });

            const result = await toolsApi.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('fetches a single tool by id', async () => {
            vi.mocked(apiClient.get).mockResolvedValue({ data: mockTool });

            const result = await toolsApi.findOne('tool-1');

            expect(apiClient.get).toHaveBeenCalledWith('/tools/tool-1');
            expect(result).toEqual(mockTool);
        });
    });

    describe('create', () => {
        it('creates a new tool', async () => {
            const createData: CreateToolDTO = {
                title: 'Scie circulaire',
                description: 'Scie 1200W',
                categoryId: 'cat-2',
                weeklyPrice: 15,
                purchasePrice: 200,
                maintenanceImportance: 'high',
                maintenanceInterval: 3,
            };

            const newTool = { ...mockTool, id: 'tool-2', ...createData };
            vi.mocked(apiClient.post).mockResolvedValue({ data: newTool });

            const result = await toolsApi.create(createData);

            expect(apiClient.post).toHaveBeenCalledWith('/tools', createData);
            expect(result.title).toBe('Scie circulaire');
        });

        it('handles validation errors', async () => {
            const error = {
                response: {
                    status: 400,
                    data: { message: 'Title is required' },
                },
            };
            vi.mocked(apiClient.post).mockRejectedValue(error);

            await expect(
                toolsApi.create({ title: '', weeklyPrice: 10 })
            ).rejects.toEqual(error);
        });
    });

    describe('update', () => {
        it('updates a tool with PATCH', async () => {
            const updateData = {
                title: 'Perceuse Bosch Pro',
                weeklyPrice: 12,
            };
            const updatedTool = { ...mockTool, ...updateData };

            vi.mocked(apiClient.patch).mockResolvedValue({ data: updatedTool });

            const result = await toolsApi.update('tool-1', updateData);

            expect(apiClient.patch).toHaveBeenCalledWith('/tools/tool-1', updateData);
            expect(result.title).toBe('Perceuse Bosch Pro');
            expect(result.weeklyPrice).toBe(12);
        });

        it('can update status to maintenance', async () => {
            const updateData = { status: 'maintenance' as ToolStatus };

            vi.mocked(apiClient.patch).mockResolvedValue({
                data: { ...mockTool, status: 'maintenance' },
            });

            const result = await toolsApi.update('tool-1', updateData);

            expect(result.status).toBe('maintenance');
        });
    });

    describe('delete', () => {
        it('deletes a tool', async () => {
            vi.mocked(apiClient.delete).mockResolvedValue({});

            await toolsApi.delete('tool-1');

            expect(apiClient.delete).toHaveBeenCalledWith('/tools/tool-1');
        });

        it('propagates error when tool is rented', async () => {
            const error = {
                response: {
                    status: 400,
                    data: { message: 'Cannot delete tool with active rentals' },
                },
            };
            vi.mocked(apiClient.delete).mockRejectedValue(error);

            await expect(toolsApi.delete('tool-1')).rejects.toEqual(error);
        });
    });

    describe('uploadImage', () => {
        it('uploads an image with FormData', async () => {
            const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });

            vi.mocked(apiClient.post).mockResolvedValue({});

            await toolsApi.uploadImage('tool-1', file);

            expect(apiClient.post).toHaveBeenCalledWith(
                '/tools/tool-1/images',
                expect.any(FormData),
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            // Verify FormData contains the file
            const calledFormData = vi.mocked(apiClient.post).mock.calls[0][1] as FormData;
            expect(calledFormData.get('file')).toBe(file);
        });
    });

    describe('uploadDocument', () => {
        it('uploads a document with type', async () => {
            const file = new File(['pdf content'], 'manual.pdf', { type: 'application/pdf' });

            vi.mocked(apiClient.post).mockResolvedValue({});

            await toolsApi.uploadDocument('tool-1', file, 'manual');

            expect(apiClient.post).toHaveBeenCalledWith(
                '/tools/tool-1/documents',
                expect.any(FormData),
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            const calledFormData = vi.mocked(apiClient.post).mock.calls[0][1] as FormData;
            expect(calledFormData.get('file')).toBe(file);
            expect(calledFormData.get('type')).toBe('manual');
        });

        it('supports different document types', async () => {
            const file = new File(['cert'], 'ce.pdf', { type: 'application/pdf' });

            vi.mocked(apiClient.post).mockResolvedValue({});

            await toolsApi.uploadDocument('tool-1', file, 'ce_cert');

            const calledFormData = vi.mocked(apiClient.post).mock.calls[0][1] as FormData;
            expect(calledFormData.get('type')).toBe('ce_cert');
        });
    });
});
