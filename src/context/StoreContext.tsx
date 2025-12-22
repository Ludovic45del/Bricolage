import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tool } from '../api/types';
import { Member as User } from '../api/memberTypes';
import { Rental as Reservation } from '../api/rentalTypes';
import { Transaction, INITIAL_USERS, INITIAL_TOOLS, INITIAL_RENTALS, INITIAL_TRANSACTIONS } from '../constants';

interface StoreContextType {
    // Data
    users: User[];
    tools: Tool[];
    rentals: Reservation[];
    transactions: Transaction[];
    categories: string[];
    membershipCost: number;

    // Auth
    currentUser: User | null;
    login: (email: string, badge: string) => Promise<User>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;

    // Actions
    addUser: (user: User) => Promise<User>;
    updateUser: (user: User) => Promise<User>;
    deleteUser: (userId: string) => Promise<void>;

    addTool: (tool: Tool) => Promise<Tool>;
    updateTool: (tool: Tool) => Promise<Tool>;
    deleteTool: (toolId: string) => Promise<void>;
    updateCategories: (categories: string[]) => Promise<void>;
    updateMembershipCost: (cost: number) => Promise<void>;

    addRental: (rental: Reservation) => Promise<Reservation>;
    updateRental: (rental: Reservation) => Promise<Reservation>;

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
    // --- Initialization with V2 keys ---
    const [users, setUsers] = useState<User[]>(() => {
        try {
            const saved = localStorage.getItem('assomanager_v2_users');
            return saved ? JSON.parse(saved) : INITIAL_USERS;
        } catch { return INITIAL_USERS; }
    });

    const [tools, setTools] = useState<Tool[]>(() => {
        try {
            const saved = localStorage.getItem('assomanager_v2_tools');
            return saved ? JSON.parse(saved) : INITIAL_TOOLS;
        } catch { return INITIAL_TOOLS; }
    });

    const [rentals, setRentals] = useState<Reservation[]>(() => {
        try {
            const saved = localStorage.getItem('assomanager_v2_rentals');
            return saved ? JSON.parse(saved) : INITIAL_RENTALS;
        } catch { return INITIAL_RENTALS; }
    });

    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        try {
            const saved = localStorage.getItem('assomanager_v2_transactions');
            return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
        } catch { return INITIAL_TRANSACTIONS; }
    });

    const [categories, setCategories] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('assomanager_v2_categories');
            if (saved) return JSON.parse(saved);
            // Reset categories for V2 since tools structures changed
            return ['Outillage', 'Nettoyage', 'Scies', 'Jardinage'].sort();
        } catch { return []; }
    });

    const [membershipCost, setMembershipCost] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('assomanager_v2_membershipCost');
            return saved ? JSON.parse(saved) : 50;
        } catch { return 50; }
    });

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const savedId = localStorage.getItem('assomanager_v2_session_userId');
            if (savedId) {
                return users.find(u => u.id === savedId) || null;
            }
            return null;
        } catch { return null; }
    });

    // --- Persistence ---
    useEffect(() => localStorage.setItem('assomanager_v2_users', JSON.stringify(users)), [users]);
    useEffect(() => localStorage.setItem('assomanager_v2_tools', JSON.stringify(tools)), [tools]);
    useEffect(() => localStorage.setItem('assomanager_v2_rentals', JSON.stringify(rentals)), [rentals]);
    useEffect(() => localStorage.setItem('assomanager_v2_transactions', JSON.stringify(transactions)), [transactions]);
    useEffect(() => localStorage.setItem('assomanager_v2_categories', JSON.stringify(categories)), [categories]);
    useEffect(() => localStorage.setItem('assomanager_v2_membershipCost', JSON.stringify(membershipCost)), [membershipCost]);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('assomanager_v2_session_userId', currentUser.id);
        } else {
            localStorage.removeItem('assomanager_v2_session_userId');
        }
    }, [currentUser]);

    // --- Actions ---
    const login = async (email: string, badge: string): Promise<User> => {
        const user = users.find(u =>
            (u.email.toLowerCase() === email.toLowerCase() || u.badgeNumber.toLowerCase() === badge.toLowerCase())
        );
        if (!user) throw new Error("Utilisateur introuvable");
        setCurrentUser(user);
        return user;
    };

    const logout = () => setCurrentUser(null);

    const refreshData = async () => { };

    const addUser = async (newUser: User) => {
        const userWithId = { ...newUser, id: newUser.id || Date.now().toString() };
        setUsers(prev => [...prev, userWithId]);
        return userWithId;
    };

    const updateUser = async (updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
        return updatedUser;
    };

    const deleteUser = async (userId: string) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
    };

    const addTool = async (newTool: Tool) => {
        const toolWithId = { ...newTool, id: newTool.id || Date.now().toString() };
        setTools(prev => [...prev, toolWithId]);
        return toolWithId;
    };

    const updateTool = async (updatedTool: Tool) => {
        setTools(prev => prev.map(t => t.id === updatedTool.id ? updatedTool : t));
        return updatedTool;
    };

    const deleteTool = async (toolId: string) => {
        setTools(prev => prev.filter(t => t.id !== toolId));
    };

    const updateCategories = async (newCats: string[]) => setCategories(newCats);

    const updateMembershipCost = async (cost: number) => setMembershipCost(cost);

    const addRental = async (newRental: Reservation) => {
        const rentalWithId = { ...newRental, id: newRental.id || Date.now().toString() };
        setRentals(prev => [...prev, rentalWithId]);
        return rentalWithId;
    };

    const updateRental = async (updatedRental: Reservation) => {
        setRentals(prev => prev.map(r => r.id === updatedRental.id ? updatedRental : r));
        return updatedRental;
    };

    const addTransaction = async (newTx: Transaction) => {
        const txWithId = { ...newTx, id: newTx.id || Date.now().toString() };
        setTransactions(prev => [...prev, txWithId]);
        return txWithId;
    };

    const updateTransaction = async (updatedTx: Transaction) => {
        setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
        return updatedTx;
    };

    return (
        <StoreContext.Provider value={{
            users, tools, rentals, transactions, categories, currentUser,
            login, logout, isAuthenticated: !!currentUser, isAdmin: currentUser?.role === 'admin',
            addUser, updateUser, deleteUser,
            addTool, updateTool, deleteTool, updateCategories,
            addRental, updateRental,
            addTransaction, updateTransaction, refreshData,
            membershipCost, updateMembershipCost
        }}>
            {children}
        </StoreContext.Provider>
    );
};
