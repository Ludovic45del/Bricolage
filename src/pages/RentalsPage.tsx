import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { RentalsTab } from '@/components/features/rentals/components/RentalsTab';
import { OutletContextType } from '@/components/layouts/MainLayout/MainLayout';

export const RentalsPage = () => {
    const { users, tools, rentals, transactions, addRental, updateRental, updateTool, updateUser, addTransaction } = useStore();
    const { showAlert } = useOutletContext<OutletContextType>();
    return (
        <RentalsTab
            users={users}
            tools={tools}
            rentals={rentals}
            transactions={transactions}
            onAddRental={addRental}
            onUpdateRental={updateRental}
            onUpdateTool={updateTool}
            onUpdateUser={updateUser}
            onAddTransaction={addTransaction}
            showAlert={showAlert}
        />
    );
};
