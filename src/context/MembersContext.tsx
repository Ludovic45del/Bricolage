import React, { createContext, useContext, ReactNode } from 'react';
import { Member } from '@/types';
import { useUsersQuery, useUserMutations } from '@/hooks/data/useUsersQuery';
import { useAuth } from './AuthContext';

interface MembersContextType {
    users: Member[];
    addUser: (user: Member) => Promise<Member>;
    updateUser: (user: Member) => Promise<Member>;
    deleteUser: (userId: string) => Promise<void>;
}

const MembersContext = createContext<MembersContextType | undefined>(undefined);

export const useMembers = () => {
    const context = useContext(MembersContext);
    if (!context) {
        throw new Error('useMembers must be used within a MembersProvider');
    }
    return context;
};

export const MembersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAdmin } = useAuth();
    const { data: users = [] } = useUsersQuery(undefined, { enabled: isAdmin });
    const { createUser, updateUser, deleteUser } = useUserMutations();

    const addUser = async (user: Member) => {
        return createUser.mutateAsync(user);
    };

    const updateUserFn = async (user: Member) => {
        return updateUser.mutateAsync({ id: user.id, data: user });
    };

    const deleteUserFn = async (userId: string) => {
        return deleteUser.mutateAsync(userId);
    };

    const value = {
        users,
        addUser,
        updateUser: updateUserFn,
        deleteUser: deleteUserFn
    };

    return (
        <MembersContext.Provider value={value}>
            {children}
        </MembersContext.Provider>
    );
};
