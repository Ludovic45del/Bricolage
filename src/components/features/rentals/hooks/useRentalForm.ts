import React, { useState, useCallback, useMemo } from 'react';
import { generateId } from '@/utils/ids';
import { Rental, Tool, Member, Transaction, TransactionType } from '@/types';
import { isDateFriday, isMaintenanceBlocked } from '@/utils';
import { differenceInDays, parseISO } from 'date-fns';

interface UseRentalFormOptions {
    users: Member[];
    tools: Tool[];
    onAddRental: (rental: Rental) => void;
    onUpdateTool: (tool: Tool) => void;
    onUpdateUser: (user: Member) => void;
    onAddTransaction: (tx: Transaction) => void;
    showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'confirm', onConfirm?: () => void) => void;
}

interface UseRentalFormReturn {
    // Form state
    selectedUserId: string;
    setSelectedUserId: (id: string) => void;
    selectedToolId: string;
    setSelectedToolId: (id: string) => void;
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
    manualPrice: string;
    setManualPrice: (price: string) => void;
    dateError: string;

    // Computed
    selectedUser: Member | undefined;
    selectedTool: Tool | undefined;
    estimatedPrice: number;
    isUserBlocked: boolean;
    isToolBlocked: boolean;
    availableTools: Tool[];

    // Actions
    handleSubmit: (e: React.FormEvent) => void;
    resetForm: () => void;

    // Validation
    isValid: boolean;
}

/**
 * Custom hook for managing rental form state and logic
 * Handles Friday validation, price calculation, and form submission
 */
export const useRentalForm = (options: UseRentalFormOptions): UseRentalFormReturn => {
    const { users, tools, onAddRental, onUpdateTool, onUpdateUser, onAddTransaction, showAlert } = options;

    // Form state
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedToolId, setSelectedToolId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [manualPrice, setManualPrice] = useState('');
    const [dateError, setDateError] = useState('');

    // Computed values
    const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId), [users, selectedUserId]);
    const selectedTool = useMemo(() => tools.find(t => t.id === selectedToolId), [tools, selectedToolId]);

    const availableTools = useMemo(() => tools.filter(t => t.status === 'available'), [tools]);

    const isUserBlocked = useMemo(() => {
        if (!selectedUser) return false;
        return new Date(selectedUser.membershipExpiry) < new Date();
    }, [selectedUser]);

    const isToolBlocked = useMemo(() => {
        if (!selectedTool) return false;
        return isMaintenanceBlocked(selectedTool);
    }, [selectedTool]);

    const estimatedPrice = useMemo(() => {
        if (!startDate || !endDate || !selectedTool) return 0;
        const days = differenceInDays(parseISO(endDate), parseISO(startDate));
        if (days < 0) return 0;
        // Weekly price, so divide days by 7
        const weeks = Math.ceil(days / 7);
        return weeks * selectedTool.weeklyPrice;
    }, [startDate, endDate, selectedTool]);

    const isValid = useMemo(() => {
        return !!(selectedUserId && selectedToolId && startDate && endDate && !isUserBlocked && !isToolBlocked);
    }, [selectedUserId, selectedToolId, startDate, endDate, isUserBlocked, isToolBlocked]);

    // Reset form
    const resetForm = useCallback(() => {
        setSelectedUserId('');
        setSelectedToolId('');
        setStartDate('');
        setEndDate('');
        setManualPrice('');
        setDateError('');
    }, []);

    // Submit handler
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setDateError('');

        if (!selectedUserId || !selectedToolId || !startDate || !endDate) return;

        // Check maintenance block
        if (selectedTool && isMaintenanceBlocked(selectedTool)) {
            showAlert(
                "Maintenance Expirée",
                `Cet outil (${selectedTool.title}) ne peut pas être loué car sa maintenance est expirée.`,
                'warning'
            );
            return;
        }

        // Validate Friday dates
        if (!isDateFriday(startDate) || !isDateFriday(endDate)) {
            setDateError('Les locations doivent impérativement commencer et finir un Vendredi.');
            return;
        }

        // Validate date order
        if (parseISO(startDate) >= parseISO(endDate)) {
            setDateError('La date de fin doit être après la date de début.');
            return;
        }

        const finalPrice = manualPrice ? parseFloat(manualPrice) : estimatedPrice;

        // Create rental
        const newRental: Rental = {
            id: generateId(),
            userId: selectedUserId,
            toolId: selectedToolId,
            startDate: startDate,
            endDate: endDate,
            status: 'active',
            totalPrice: finalPrice,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        onAddRental(newRental);

        // Update tool status
        if (selectedTool) {
            onUpdateTool({ ...selectedTool, status: 'rented' });
        }

        // Add debt and transaction
        if (selectedUser) {
            onUpdateUser({ ...selectedUser, totalDebt: selectedUser.totalDebt + finalPrice });

            const tx: Transaction = {
                id: generateId(),
                userId: selectedUser.id,
                amount: finalPrice,
                type: TransactionType.RENTAL,
                method: 'System',
                date: new Date().toISOString(),
                description: `Location de ${selectedTool?.title}`
            };
            onAddTransaction(tx);
        }

        resetForm();
    }, [
        selectedUserId, selectedToolId, startDate, endDate, manualPrice,
        selectedTool, selectedUser, estimatedPrice,
        onAddRental, onUpdateTool, onUpdateUser, onAddTransaction, showAlert, resetForm
    ]);

    return {
        selectedUserId,
        setSelectedUserId,
        selectedToolId,
        setSelectedToolId,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        manualPrice,
        setManualPrice,
        dateError,
        selectedUser,
        selectedTool,
        estimatedPrice,
        isUserBlocked,
        isToolBlocked,
        availableTools,
        handleSubmit,
        resetForm,
        isValid
    };
};

export default useRentalForm;
