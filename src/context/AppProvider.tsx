import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { MembersProvider, useMembers } from './MembersContext';
import { InventoryProvider } from './InventoryContext';
import { RentalsProvider } from './RentalsContext';
import { FinanceProvider } from './FinanceContext';
import { StoreProvider } from './StoreContext';

/**
 * AppProvider wraps the application with all necessary domain-specific context providers.
 * It ensures the correct nesting and dependency injection (e.g., AuthProvider needs users from MembersProvider).
 */
interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    return (
        <AuthProvider>
            <MembersProvider>
                <InventoryProvider>
                    <RentalsProvider>
                        <FinanceProvider>
                            <StoreProvider>
                                {children}
                            </StoreProvider>
                        </FinanceProvider>
                    </RentalsProvider>
                </InventoryProvider>
            </MembersProvider>
        </AuthProvider>
    );
};
