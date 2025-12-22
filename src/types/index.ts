// ============================================
// UNIFIED TYPES - Single Source of Truth
// ============================================

// ============================================
// ENUMS & STATUS TYPES
// ============================================

export type ToolStatus = 'available' | 'rented' | 'maintenance' | 'unavailable';
export type MaintenanceImportance = 'low' | 'medium' | 'high';
export type DocumentType = 'invoice' | 'manual' | 'ce_cert' | 'other';
export type MemberStatus = 'active' | 'suspended' | 'archived';
export type MemberRole = 'admin' | 'staff' | 'member';
export type RentalStatus = 'pending' | 'active' | 'completed' | 'late' | 'rejected';
export type RentalAction = 'created' | 'approved' | 'rejected' | 'returned' | 'overdue_notified' | 'price_adjusted';
export type PaymentMethod = 'Card' | 'Check' | 'Cash' | 'System';

export enum TransactionType {
    RENTAL = 'Rental',
    MEMBERSHIP_FEE = 'MembershipFee',
    REPAIR_COST = 'RepairCost',
    PAYMENT = 'Payment'
}

// ============================================
// CATEGORY
// ============================================

export interface Category {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

// ============================================
// MEMBER (User)
// ============================================

export interface Member {
    id: string;
    name: string;
    email: string;
    phone?: string;
    badgeNumber: string;
    employer?: string;
    membershipExpiry: string;
    totalDebt: number;
    role: MemberRole;
    status: MemberStatus;
    createdAt: string;
    updatedAt: string;
    passwordHash?: string;
}

// ============================================
// TOOL & RELATED
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

export interface ConditionAttachment {
    id: string;
    conditionId: string;
    name: string;
    filePath: string;
    fileSize?: number;
    mimeType?: string;
    createdAt: string;
}

export interface ToolCondition {
    id: string;
    toolId: string;
    adminId: string;
    statusAtTime: ToolStatus;
    comment?: string;
    cost?: number;
    createdAt: string;
    attachments?: ConditionAttachment[];
}

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
    category?: Category;
    images?: ToolImage[];
    documents?: ToolDocument[];
    conditions?: ToolCondition[];
}

// ============================================
// RENTAL
// ============================================

export interface Rental {
    id: string;
    userId: string;
    toolId: string;
    startDate: string;
    endDate: string;
    actualReturnDate?: string;
    status: RentalStatus;
    totalPrice?: number;
    returnComment?: string;
    createdAt: string;
    updatedAt: string;
    userName?: string;
    toolTitle?: string;
    toolWeeklyPrice?: number;
}

export interface RentalHistory {
    id: string;
    rentalId: string;
    adminId: string;
    action: RentalAction;
    comment?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    adminName?: string;
}

// ============================================
// TRANSACTION
// ============================================

export interface Transaction {
    id: string;
    userId: string;
    toolId?: string;
    amount: number;
    type: TransactionType;
    method: PaymentMethod;
    date: string;
    description?: string;
    status?: 'pending' | 'paid';
    workflowStep?: 'requested' | 'in_progress' | 'tool_returned' | 'completed';
    user?: {
        id: string;
        name: string;
        badgeNumber?: string;
    };
}

// ============================================
// MEMBERSHIP RENEWAL
// ============================================

export interface MembershipRenewal {
    id: string;
    memberId: string;
    previousExpiry: string;
    newExpiry: string;
    amount: number;
    paymentMethod: 'card' | 'check' | 'cash';
    renewedAt: string;
    renewedBy: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getMemberStatusLabel = (status: MemberStatus): string => {
    const labels: Record<MemberStatus, string> = {
        active: 'Actif',
        suspended: 'Suspendu',
        archived: 'Archivé'
    };
    return labels[status];
};

export const getMemberRoleLabel = (role: MemberRole): string => {
    const labels: Record<MemberRole, string> = {
        admin: 'Administrateur',
        staff: 'Personnel',
        member: 'Membre'
    };
    return labels[role];
};

export const getMemberStatusColor = (status: MemberStatus): { bg: string; text: string; border: string } => {
    const colors: Record<MemberStatus, { bg: string; text: string; border: string }> = {
        active: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20' },
        suspended: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20' },
        archived: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' }
    };
    return colors[status];
};

export const getRentalStatusLabel = (status: RentalStatus): string => {
    const labels: Record<RentalStatus, string> = {
        pending: 'En attente',
        active: 'En cours',
        completed: 'Terminé',
        late: 'En retard',
        rejected: 'Refusé'
    };
    return labels[status];
};

export const getRentalStatusColor = (status: RentalStatus): { bg: string; text: string; border: string } => {
    const colors: Record<RentalStatus, { bg: string; text: string; border: string }> = {
        pending: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20' },
        active: { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/20' },
        completed: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
        late: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/20' },
        rejected: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' }
    };
    return colors[status];
};

// Membership utilities moved to @/utils


export const isRentalOverdue = (rental: Rental): boolean => {
    if (rental.status !== 'active') return false;
    return new Date(rental.endDate) < new Date();
};

// ============================================
// API RESPONSE TYPES
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
// QUERY PARAMS
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

export interface MembersQueryParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: MemberStatus;
    membershipFilter?: 'all' | 'active' | 'expired' | 'expiring_soon';
    sortBy?: 'name' | 'createdAt' | 'membershipExpiry';
    sortOrder?: 'asc' | 'desc';
}

export interface RentalsQueryParams {
    page?: number;
    pageSize?: number;
    status?: RentalStatus | RentalStatus[];
    userId?: string;
    toolId?: string;
    startDateFrom?: string;
    startDateTo?: string;
    sortBy?: 'createdAt' | 'startDate' | 'totalPrice';
    sortOrder?: 'asc' | 'desc';
}

// ============================================
// DTOs
// ============================================

export interface CreateMemberDTO {
    name: string;
    email: string;
    phone?: string;
    badgeNumber: string;
    employer?: string;
    membershipExpiry: string;
    role?: MemberRole;
    password?: string;
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

export interface CreateRentalDTO {
    userId: string;
    toolId: string;
    startDate: string;
    endDate: string;
    totalPrice?: number;
}
