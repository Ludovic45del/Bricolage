import { useState, useMemo, useCallback, useEffect } from 'react';
import { generateId } from '@/utils/ids';
import { isMembershipActive } from '@/utils';
import { Member, MemberRole, MemberStatus } from '@/types';
import { Transaction, TransactionType } from '@/types';
import { addYears, parseISO } from 'date-fns';

export interface UseMembershipProps {
    users: Member[];
    onUpdateUser: (user: Member) => Promise<Member>;
    onAddUser: (user: Member) => Promise<Member>;
    onDeleteUser: (userId: string) => Promise<void>;
    onAddTransaction: (tx: Transaction) => Promise<Transaction>;
    onRenewMembership?: (id: string, data: { amount: number; paymentMethod: 'card' | 'check' | 'cash'; durationMonths?: number }) => Promise<Member>;
    showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'confirm', onConfirm?: () => void) => void;
}

export const useMembership = ({
    users,
    onUpdateUser,
    onAddUser,
    onDeleteUser,
    onAddTransaction,
    onRenewMembership,
    showAlert
}: UseMembershipProps) => {
    const [editingUser, setEditingUser] = useState<Member | null>(null);
    const [viewingUser, setViewingUser] = useState<Member | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // Debounce search query to optimize filtering
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const [renewalConfig, setRenewalConfig] = useState<{
        isOpen: boolean;
        user: Member | null;
    }>({
        isOpen: false,
        user: null
    });

    const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'Suspended' | 'Archived'>('All');
    const [membershipFilter, setMembershipFilter] = useState<'All' | 'active' | 'Expired'>('All');

    const filteredUsers = useMemo(() => {
        let result = users;

        if (!result || !Array.isArray(result)) return [];

        // Apply account status filter
        if (statusFilter !== 'All') {
            result = result.filter(user => user.status.toLowerCase() === statusFilter.toLowerCase());
        }

        // Apply membership filter
        if (membershipFilter === 'active') {
            result = result.filter(user => isMembershipActive(user.membershipExpiry));
        } else if (membershipFilter === 'Expired') {
            result = result.filter(user => !isMembershipActive(user.membershipExpiry));
        }

        if (!debouncedSearchQuery) return result;

        const lowerQuery = debouncedSearchQuery.toLowerCase();
        return result.filter(user =>
            user.name.toLowerCase().includes(lowerQuery) ||
            user.email.toLowerCase().includes(lowerQuery) ||
            user.badgeNumber.toLowerCase().includes(lowerQuery)
        );
    }, [users, debouncedSearchQuery, statusFilter, membershipFilter]);

    const handleOpenAdd = useCallback(() => {
        setEditingUser({ id: 'new' } as Member);
    }, []);

    const handleOpenEdit = useCallback((user: Member) => {
        setEditingUser(user);
        setViewingUser(null); // Close detail if editing from there
    }, []);

    const handleSaveUser = useCallback(async (userData: Partial<Member>) => {
        const now = new Date().toISOString();
        if (editingUser && editingUser.id !== 'new') {
            await onUpdateUser({
                ...editingUser,
                ...userData,
                updatedAt: now
            } as Member);
        } else {
            const newUser: Member = {
                id: generateId(),
                name: '',
                badgeNumber: '',
                email: '',
                phone: '',
                employer: '',
                membershipExpiry: addYears(new Date(), 1).toISOString().split('T')[0],
                totalDebt: 0,
                status: 'active',
                role: 'member',
                createdAt: now,
                updatedAt: now,
                ...userData
            };
            await onAddUser(newUser);
        }
        setEditingUser(null);
    }, [editingUser, onUpdateUser, onAddUser]);

    const handleDeleteUser = useCallback((user: Member) => {
        showAlert(
            "Confirmer la suppression",
            `Êtes-vous sûr de vouloir supprimer définitivement le membre ${user.name} ? Cette action est irréversible.`,
            'confirm',
            async () => {
                await onDeleteUser(user.id);
                setViewingUser(null);
                showAlert("Succès", "Membre supprimé avec succès.", "success");
            }
        );
    }, [onDeleteUser, showAlert]);

    const handleOpenRenew = useCallback((user: Member) => {
        setRenewalConfig({ isOpen: true, user });
        setViewingUser(null); // Close detail if renewing from there
    }, []);

    const confirmRenewal = useCallback(async (price: number) => {
        const user = renewalConfig.user;
        if (!user) return;

        try {
            // Use dedicated renew API if available, otherwise fallback to legacy update
            if (onRenewMembership) {
                await onRenewMembership(user.id, {
                    amount: price,
                    paymentMethod: 'cash', // Default to cash for now
                    durationMonths: 12
                });
            } else {
                // Fallback: Try to update only allowed fields
                const currentExpiry = parseISO(user.membershipExpiry);
                const today = new Date();
                const baseDate = isMembershipActive(user.membershipExpiry) ? currentExpiry : today;
                const newExpiry = addYears(baseDate, 1).toISOString().split('T')[0];

                const updatedUser = {
                    ...user,
                    membershipExpiry: newExpiry,
                    totalDebt: user.totalDebt + price
                };
                await onUpdateUser(updatedUser);

                const tx: Transaction = {
                    id: generateId(),
                    userId: user.id,
                    amount: price,
                    type: TransactionType.MEMBERSHIP_FEE,
                    method: 'System',
                    date: new Date().toISOString(),
                    description: 'Renouvellement Adhésion (1 an)'
                };
                await onAddTransaction(tx);
            }
            setRenewalConfig({ isOpen: false, user: null });
            showAlert("Succès", `Adhésion de ${user.name} renouvelée avec succès.`, 'success');
        } catch (error) {
            console.error('Renewal failed:', error);
            showAlert("Erreur", "Le renouvellement a échoué. Veuillez réessayer.", 'warning');
        }
    }, [renewalConfig, onUpdateUser, onAddTransaction, onRenewMembership, showAlert]);

    return {
        state: {
            editingUser,
            viewingUser,
            searchQuery,
            renewalConfig,
            filteredUsers,
            statusFilter,
            membershipFilter
        },
        actions: {
            setSearchQuery,
            setEditingUser,
            setViewingUser,
            setRenewalConfig,
            handleOpenAdd,
            handleOpenEdit,
            handleSaveUser,
            handleOpenRenew,
            confirmRenewal,
            setStatusFilter,
            setMembershipFilter,
            handleDeleteUser
        }
    };
};
