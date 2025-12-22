import React, { createContext, useContext, ReactNode } from 'react';
import { Tool, Member, Rental, Transaction } from '@/types';
import { useAuth } from './AuthContext';
import { useMembers } from './MembersContext';
import { useInventory } from './InventoryContext';
import { useRentals } from './RentalsContext';
import { useFinance } from './FinanceContext';

/**
 * StoreContext acts as a compatibility layer for components still using the monolithic useStore hook.
 * It aggregates all specialized domain contexts (Auth, Members, Inventory, Rentals, Finance).
 */
interface StoreContextType {
    // Data
    users: Member[];
    tools: Tool[];
    rentals: Rental[];
    transactions: Transaction[];
    categories: string[];
    membershipCost: number;

    // Auth
    currentUser: Member | null;
    login: (identifier: string, password: string) => Promise<Member>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;

    // Actions
    addUser: (user: Member) => Promise<Member>;
    updateUser: (user: Member) => Promise<Member>;
    deleteUser: (userId: string) => Promise<void>;

    addTool: (tool: Tool) => Promise<Tool>;
    updateTool: (tool: Tool) => Promise<Tool>;
    deleteTool: (toolId: string) => Promise<void>;
    updateCategories: (categories: string[]) => Promise<void>;
    updateMembershipCost: (cost: number) => Promise<void>;

    addRental: (rental: Rental) => Promise<Rental>;
    updateRental: (rental: Rental) => Promise<Rental>;

    addTransaction: (transaction: Transaction) => Promise<Transaction>;
    updateTransaction: (transaction: Transaction) => Promise<Transaction>;

    refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};

interface StoreProviderProps {
    children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
    const { currentUser, login: authLogin, logout, isAdmin } = useAuth();
    const { users, addUser, updateUser, deleteUser } = useMembers();
    const { tools, categories, addTool, updateTool, deleteTool, updateCategories } = useInventory();
    const { rentals, addRental, updateRental } = useRentals();
    const { transactions, membershipCost, addTransaction, updateTransaction, updateMembershipCost } = useFinance();

    // Map Auth Login to the Store Login interface (which typically doesn't need allUsers passed)
    const login = async (identifier: string, password: string) => {
        return authLogin(identifier, password);
    };

    const refreshData = async () => {
        // No-op for now as logic is in contexts
    };

    const value: StoreContextType = {
        users,
        tools,
        rentals,
        transactions,
        categories,
        membershipCost,
        currentUser,
        login,
        logout,
        isAuthenticated: !!currentUser,
        isAdmin,
        addUser,
        updateUser,
        deleteUser,
        addTool,
        updateTool,
        deleteTool,
        updateCategories,
        updateMembershipCost,
        addRental,
        updateRental,
        addTransaction,
        updateTransaction,
        refreshData
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
};
