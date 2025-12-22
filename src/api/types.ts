// API Types for Inventory Module
// These types match the database schema for API communication

export type ToolStatus = 'available' | 'rented' | 'maintenance' | 'unavailable';
export type MaintenanceImportance = 'low' | 'medium' | 'high';
export type DocumentType = 'invoice' | 'manual' | 'ce_cert' | 'other';

// ============================================
// Category
// ============================================
export interface Category {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryDTO {
    name: string;
    description?: string;
}

// ============================================
// Tool
// ============================================
export interface Tool {
    id: string;
    title: string;
    description?: string;
    categoryId?: string;
    weeklyPrice: number;
    purchasePrice?: number;
    purchaseDate?: string;
    status: ToolStatus;
    maintenanceImportance: MaintenanceImportance;
    maintenanceInterval?: number;
    lastMaintenanceDate?: string;
    createdAt: string;
    updatedAt: string;

    // Populated relations (from JOIN)
    category?: Category;
    images?: ToolImage[];
    documents?: ToolDocument[];
    conditions?: ToolCondition[];
}

export interface CreateToolDTO {
    title: string;
    description?: string;
    categoryId?: string;
    weeklyPrice: number;
    purchasePrice?: number;
    purchaseDate?: string;
    maintenanceImportance?: MaintenanceImportance;
    maintenanceInterval?: number;
}

export interface UpdateToolDTO extends Partial<CreateToolDTO> {
    status?: ToolStatus;
    lastMaintenanceDate?: string;
}

// ============================================
// Tool Image
// ============================================
export interface ToolImage {
    id: string;
    toolId: string;
    filePath: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    displayOrder: number;
    isPrimary: boolean;
    createdAt: string;
}

export interface UploadImageDTO {
    file: File;
    displayOrder?: number;
    isPrimary?: boolean;
}

// ============================================
// Tool Document
// ============================================
export interface ToolDocument {
    id: string;
    toolId: string;
    name: string;
    type: DocumentType;
    filePath: string;
    fileSize?: number;
    mimeType?: string;
    uploadedAt: string;
}

export interface UploadDocumentDTO {
    file: File;
    name?: string;
    type: DocumentType;
}

// ============================================
// Tool Condition (Maintenance history)
// ============================================
export interface ToolCondition {
    id: string;
    toolId: string;
    adminId: string;
    statusAtTime: ToolStatus;
    comment?: string;
    cost?: number;
    createdAt: string;

    // Related
    attachments?: ConditionAttachment[];
}

export interface CreateConditionDTO {
    statusAtTime: ToolStatus;
    comment?: string;
    cost?: number;
}

// ============================================
// Condition Attachment
// ============================================
export interface ConditionAttachment {
    id: string;
    conditionId: string;
    name: string;
    filePath: string;
    fileSize?: number;
    mimeType?: string;
    createdAt: string;
}

// ============================================
// API Response Types
// ============================================
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ApiError {
    message: string;
    code: string;
    details?: Record<string, string[]>;
}

// ============================================
// Query Parameters
// ============================================
export interface ToolsQueryParams {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: string;
    status?: ToolStatus;
    sortBy?: 'title' | 'createdAt' | 'weeklyPrice';
    sortOrder?: 'asc' | 'desc';
}
