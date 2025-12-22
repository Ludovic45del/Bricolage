import React from 'react';
import { useStore } from '@/context/StoreContext';
import { ReportsTab } from '@/components/features/reports/components/ReportsTab';

// Note: onToolClick usually passed from parent or Context to open global modal.
// We'll need to handle this via Context or prop drilling from Router/Layout.
// For now, let's accept it as prop if passed, or use Context.
interface ReportsPageProps {
    onToolClick?: (id: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onToolClick }) => {
    const { users, tools, rentals, transactions } = useStore();
    return (
        <ReportsTab
            users={users}
            tools={tools}
            rentals={rentals}
            transactions={transactions}
            onToolClick={onToolClick || (() => { })}
        />
    );
};
