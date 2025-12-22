import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { FinanceTab } from '@/components/features/finance/components/FinanceTab';
import { OutletContextType } from '@/components/layouts/MainLayout/MainLayout';

export const FinancePage = () => {
    const { users, transactions, addTransaction, updateTransaction, updateUser, membershipCost, updateMembershipCost } = useStore();
    const { showAlert } = useOutletContext<OutletContextType>();

    return (
        <FinanceTab
            users={users}
            transactions={transactions}
            onAddTransaction={addTransaction}
            onUpdateTransaction={updateTransaction}
            onUpdateUser={updateUser}
            showAlert={showAlert}
            membershipCost={membershipCost}
            onUpdateMembershipCost={updateMembershipCost}
        />
    );
};
