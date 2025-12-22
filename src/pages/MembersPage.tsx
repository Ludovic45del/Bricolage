import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { MembersTab } from '@/components/features/members/components/MembersTab';
import { OutletContextType } from '@/components/layouts/MainLayout/MainLayout';

export const MembersPage = () => {
    const { addTransaction } = useStore();
    const { showAlert } = useOutletContext<OutletContextType>();
    return (
        <MembersTab
            onAddTransaction={addTransaction}
            showAlert={showAlert}
        />
    );
};
