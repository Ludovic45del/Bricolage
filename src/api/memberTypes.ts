import { User as LegacyUser } from '../types';

// ============================================
// Member Status
// ============================================
export type MemberStatus = 'active' | 'suspended' | 'archived';
export type MemberRole = 'admin' | 'staff' | 'member';

// ============================================
// Member
// ============================================
export interface Member {
    id: string;
    name: string;
    email: string;
    phone?: string;
    badgeNumber: string;
    employer?: string;
    membershipExpiry: string; // ISO date
    totalDebt: number;
    role: MemberRole;
    status: MemberStatus;
    createdAt: string;
    updatedAt: string;

    // Auth (only for admin)
    passwordHash?: string;
}

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

export interface UpdateMemberDTO extends Partial<CreateMemberDTO> {
    status?: MemberStatus;
    totalDebt?: number;
}

// ============================================
// Membership Renewal
// ============================================
export interface MembershipRenewal {
    id: string;
    memberId: string;
    previousExpiry: string;
    newExpiry: string;
    amount: number;
    paymentMethod: 'card' | 'check' | 'cash';
    renewedAt: string;
    renewedBy: string; // Admin ID
}

export interface CreateRenewalDTO {
    memberId: string;
    amount: number;
    paymentMethod: 'card' | 'check' | 'cash';
    durationMonths?: number; // Default: 12
}

// ============================================
// API Response Types
// ============================================
export interface MembersQueryParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: MemberStatus;
    membershipFilter?: 'all' | 'active' | 'expired' | 'expiring_soon';
    sortBy?: 'name' | 'createdAt' | 'membershipExpiry';
    sortOrder?: 'asc' | 'desc';
}

// ============================================
// Frontend Helpers
// ============================================

/**
 * Check if membership is active
 */
export const isMembershipActive = (expiryDate: string): boolean => {
    return new Date(expiryDate) > new Date();
};

/**
 * Check if membership is expiring soon (within 30 days)
 */
export const isMembershipExpiringSoon = (expiryDate: string): boolean => {
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry > new Date() && expiry <= thirtyDaysFromNow;
};

/**
 * Get status display label
 */
export const getMemberStatusLabel = (status: MemberStatus): string => {
    const labels: Record<MemberStatus, string> = {
        active: 'Actif',
        suspended: 'Suspendu',
        archived: 'Archivé'
    };
    return labels[status];
};

/**
 * Get role display label
 */
export const getMemberRoleLabel = (role: MemberRole): string => {
    const labels: Record<MemberRole, string> = {
        admin: 'Administrateur',
        staff: 'Personnel',
        member: 'Membre'
    };
    return labels[role];
};

/**
 * Get status color classes
 */
export const getMemberStatusColor = (status: MemberStatus): { bg: string; text: string; border: string } => {
    const colors: Record<MemberStatus, { bg: string; text: string; border: string }> = {
        active: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20' },
        suspended: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20' },
        archived: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' }
    };
    return colors[status];
};

/**
 * Convert legacy User to Member format
 */
export const userToMember = (u: LegacyUser): Member => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    badgeNumber: u.badge_number,
    employer: u.employer,
    membershipExpiry: u.membership_expiry,
    totalDebt: u.total_debt,
    role: u.role.toLowerCase() as MemberRole,
    status: u.status.toLowerCase() as MemberStatus,
    createdAt: u.created_at,
    updatedAt: u.updated_at
});
