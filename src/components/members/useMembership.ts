import { useState, useMemo, useCallback, useEffect } from 'react';
import { Member as User, MemberRole, MemberStatus, isMembershipActive } from '../../api/memberTypes';
import { Transaction, TransactionType } from '../../constants';
import { addYears, parseISO } from 'date-fns';

export interface UseMembershipProps {
    users: User[];
    onUpdateUser: (user: User) => Promise<User>;
    onAddUser: (user: User) => Promise<User>;
    onDeleteUser: (userId: string) => Promise<void>;
    onAddTransaction: (tx: Transaction) => Promise<Transaction>;
    showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'confirm', onConfirm?: () => void) => void;
}

export const useMembership = ({
    users,
    onUpdateUser,
    onAddUser,
    onDeleteUser,
    onAddTransaction,
    showAlert
}: UseMembershipProps) => {
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
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
        user: User | null;
    }>({
        isOpen: false,
        user: null
    });

    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended' | 'Archived'>('All');
    const [membershipFilter, setMembershipFilter] = useState<'All' | 'Active' | 'Expired'>('All');

    const filteredUsers = useMemo(() => {
        let result = users;

        // Apply account status filter
        if (statusFilter !== 'All') {
            result = result.filter(user => user.status.toLowerCase() === statusFilter.toLowerCase());
        }

        // Apply membership filter
        if (membershipFilter === 'Active') {
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
        setEditingUser({ id: 'new' } as User);
    }, []);

    const handleOpenEdit = useCallback((user: User) => {
        setEditingUser(user);
        setViewingUser(null); // Close detail if editing from there
    }, []);

    const handleSaveUser = useCallback(async (userData: Partial<User>) => {
        const now = new Date().toISOString();
        if (editingUser && editingUser.id !== 'new') {
            await onUpdateUser({
                ...editingUser,
                ...userData,
                updatedAt: now
            } as User);
        } else {
            const newUser: User = {
                id: Date.now().toString(),
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
            } as User;
            await onAddUser(newUser);
        }
        setEditingUser(null);
    }, [editingUser, onUpdateUser, onAddUser]);

    const handleDeleteUser = useCallback((user: User) => {
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

    const handleOpenRenew = useCallback((user: User) => {
        setRenewalConfig({ isOpen: true, user });
        setViewingUser(null); // Close detail if renewing from there
    }, []);

    const confirmRenewal = useCallback(async (price: number) => {
        const user = renewalConfig.user;
        if (!user) return;

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
            id: Date.now().toString(),
            userId: user.id,
            amount: price,
            type: TransactionType.MEMBERSHIP_FEE,
            method: 'System',
            date: new Date().toISOString(),
            description: 'Renouvellement Adhésion (1 an)'
        };
        await onAddTransaction(tx);
        setRenewalConfig({ isOpen: false, user: null });
        showAlert("Succès", `Adhésion de ${user.name} renouvelée avec succès.`, 'success');
    }, [renewalConfig, onUpdateUser, onAddTransaction, showAlert]);

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
