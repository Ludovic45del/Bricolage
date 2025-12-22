import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction } from '@/types';
import { useTransactionsQuery, useFinanceMutations } from '@/hooks/data/useFinanceQuery';
import { MEMBERSHIP_COST } from '@/config/constants.config';
import { useAuth } from './AuthContext';

interface FinanceContextType {
    transactions: Transaction[];
    membershipCost: number;
    addTransaction: (tx: Transaction) => Promise<Transaction>;
    updateTransaction: (tx: Transaction) => Promise<Transaction>;
    updateMembershipCost: (cost: number) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (!context) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAdmin } = useAuth();
    const { data: transactions = [] } = useTransactionsQuery(undefined, { enabled: isAdmin });
    const { createTransaction, updateTransaction } = useFinanceMutations();

    // Membership Cost remains local state or could be moved to backend settings endpoint
    // For now keeping it local/mocked as per original context behavior, or simple state
    const [membershipCost, setMembershipCost] = useState<number>(MEMBERSHIP_COST);

    const addTransactionFn = async (tx: Transaction) => {
        return createTransaction.mutateAsync(tx);
    };

    const updateTransactionFn = async (updatedTx: Transaction) => {
        return updateTransaction.mutateAsync({ id: updatedTx.id, data: updatedTx });
    };

    const updateMembershipCostFn = async (cost: number) => {
        setMembershipCost(cost);
        // Might want to persist this to backend later
    };

    return (
        <FinanceContext.Provider value={{
            transactions,
            membershipCost,
            addTransaction: addTransactionFn,
            updateTransaction: updateTransactionFn,
            updateMembershipCost: updateMembershipCostFn
        }}>
            {children}
        </FinanceContext.Provider>
    );
};
