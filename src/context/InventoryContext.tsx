import React, { createContext, useContext, ReactNode } from 'react';
import { Tool } from '@/types';
import { useToolsQuery, useToolMutations } from '@/hooks/data/useToolsQuery';
import { useCategoriesQuery, useCategoryMutations } from '@/hooks/data/useCategoriesQuery';
import { useAuth } from './AuthContext';

interface InventoryContextType {
    tools: Tool[];
    categories: string[];
    addTool: (newTool: Tool) => Promise<Tool>;
    updateTool: (updatedTool: Tool) => Promise<Tool>;
    deleteTool: (toolId: string) => Promise<void>;
    updateCategories: (categories: string[]) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    // Fetch data using React Query
    const { data: tools = [] } = useToolsQuery(undefined, { enabled: isAuthenticated });
    const { data: categories = [] } = useCategoriesQuery({ enabled: isAuthenticated });

    // Mutations
    const { createTool, updateTool, deleteTool } = useToolMutations();
    const { updateCategories } = useCategoryMutations();

    // Adapter functions to match the Context interface expected by StoreContext
    const addToolFn = async (newTool: Tool) => {
        return createTool.mutateAsync(newTool);
    };

    const updateToolFn = async (updatedTool: Tool) => {
        return updateTool.mutateAsync({ id: updatedTool.id, data: updatedTool });
    };

    const deleteToolFn = async (toolId: string) => {
        return deleteTool.mutateAsync(toolId);
    };

    const updateCategoriesFn = async (newCategories: string[]) => {
        return updateCategories.mutateAsync(newCategories);
    }

    const value = {
        tools,
        categories,
        addTool: addToolFn,
        updateTool: updateToolFn,
        deleteTool: deleteToolFn,
        updateCategories: updateCategoriesFn,
    };

    return (
        <InventoryContext.Provider value={value}>
            {children}
        </InventoryContext.Provider>
    );
};
