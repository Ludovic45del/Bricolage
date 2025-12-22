import React, { useState } from 'react';
import { Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import { ROUTES } from './routes';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MembersPage } from '@/pages/MembersPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { RentalsPage } from '@/pages/RentalsPage';
import { FinancePage } from '@/pages/FinancePage';
import { ReportsPage } from '@/pages/ReportsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Shared
import { ToolDetailModal } from '@/components/features/inventory/components/ToolDetailModal';
import { useStore } from '@/context/StoreContext';

export const AppRouter = () => {
    const { tools, updateTool, categories } = useStore();

    // Managing global tool modal state here or in a Portal
    // Ideally this should be in a specific ToolModalProvider or URL-based state
    const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleToolClick = (toolId: string) => {
        setSelectedToolId(toolId);
        setIsModalOpen(true);
    };

    const selectedTool = tools.find(t => t.id === selectedToolId);

    return (
        <>
            <Routes>
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />

                {/* Member Route */}
                <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

                {/* User Home Redirect */}
                <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.LOGIN} />} />

                {/* Admin Routes with Layout */}
                <Route path={ROUTES.ROOT} element={<MainLayout />}>
                    <Route path="members" element={
                        <ProtectedRoute requireAdmin={true}><MembersPage /></ProtectedRoute>
                    } />
                    <Route path="inventory" element={
                        <ProtectedRoute requireAdmin={true}><InventoryPage /></ProtectedRoute>
                    } />
                    <Route path="rentals" element={
                        <ProtectedRoute requireAdmin={true}><RentalsPage /></ProtectedRoute>
                    } />
                    <Route path="finance" element={
                        <ProtectedRoute requireAdmin={true}><FinancePage /></ProtectedRoute>
                    } />
                    <Route path="reports" element={
                        <ProtectedRoute requireAdmin={true}><ReportsPage onToolClick={handleToolClick} /></ProtectedRoute>
                    } />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>

            {/* Global Tool Detail Modal for Reports or other views */}
            {selectedTool && (
                <ToolDetailModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    tool={selectedTool}
                    onUpdateTool={updateTool}
                    categories={categories}
                />
            )}
        </>
    );
};
