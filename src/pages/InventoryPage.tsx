import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { InventoryTab } from '@/components/features/inventory/components/InventoryTab';
import { OutletContextType } from '@/components/layouts/MainLayout/MainLayout';

export const InventoryPage = () => {
    const { tools, categories, updateTool, addTool, updateCategories } = useStore();
    const { showAlert } = useOutletContext<OutletContextType>();
    return (
        <InventoryTab
            tools={tools}
            categories={categories}
            onUpdateTool={updateTool}
            onAddTool={addTool}
            onUpdateCategories={updateCategories}
            showAlert={showAlert}
        />
    );
};
