import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Member } from '@/types';
import { authApi } from '@/services/api/auth';

interface AuthContextType {
    currentUser: Member | null;
    login: (identifier: string, password: string) => Promise<Member>;
    logout: () => void;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<Member | null>(() => {
        try {
            const savedUser = localStorage.getItem('assomanager_user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch { return null; }
    });

    // Removed useEffect for hydrating purely from ID, as we persist the object now.
    // In a real app, we would validate the token on mount here via /me endpoint.

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('assomanager_user');
        setCurrentUser(null);
    };

    const login = async (identifier: string, password: string): Promise<Member> => {
        const response = await authApi.login({ identifier, password });

        if (!response.tokens || !response.tokens.accessToken) {
            throw new Error('Invalid response from server: Missing tokens');
        }

        localStorage.setItem('access_token', response.tokens.accessToken);
        localStorage.setItem('assomanager_user', JSON.stringify(response.user));

        // Map backend user to frontend Member type if needed
        const user = response.user as unknown as Member;

        setCurrentUser(user);
        return user;
    };



    const isAdmin = currentUser?.role === 'admin';

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};
