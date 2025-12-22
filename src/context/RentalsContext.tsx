import React, { createContext, useContext, ReactNode } from 'react';
import { Rental } from '@/types';
import { useRentalsQuery, useRentalMutations } from '@/hooks/data/useRentalsQuery';
import { useAuth } from './AuthContext';

interface RentalsContextType {
    rentals: Rental[];
    addRental: (newRental: Rental) => Promise<Rental>;
    updateRental: (updatedRental: Rental) => Promise<Rental>;
}

const RentalsContext = createContext<RentalsContextType | undefined>(undefined);

export const useRentals = () => {
    const context = useContext(RentalsContext);
    if (!context) {
        throw new Error('useRentals must be used within a RentalsProvider');
    }
    return context;
};

export const RentalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const { data: rentals = [] } = useRentalsQuery(undefined, { enabled: isAuthenticated });
    const { createRental, updateRental } = useRentalMutations();

    const addRental = async (newRental: Rental) => {
        // Adapt to CreateRentalDTO if needed, for now casting or passing full object if backend handles it
        // The DTO likely expects specific fields
        const { userId, toolId, startDate, endDate, totalPrice } = newRental;
        return createRental.mutateAsync({ userId, toolId, startDate, endDate, totalPrice });
    };

    const updateRentalFn = async (updatedRental: Rental) => {
        return updateRental.mutateAsync({ id: updatedRental.id, data: updatedRental });
    };

    return (
        <RentalsContext.Provider value={{ rentals, addRental, updateRental: updateRentalFn }}>
            {children}
        </RentalsContext.Provider>
    );
};
