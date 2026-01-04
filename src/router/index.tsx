import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import { ROUTES } from './routes';
import { ProtectedRoute } from './ProtectedRoute';

// Pages - Lazy loaded for code splitting
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const MembersPage = lazy(() => import('@/pages/MembersPage').then(m => ({ default: m.MembersPage })));
const InventoryPage = lazy(() => import('@/pages/InventoryPage').then(m => ({ default: m.InventoryPage })));
const RentalsPage = lazy(() => import('@/pages/RentalsPage').then(m => ({ default: m.RentalsPage })));
const FinancePage = lazy(() => import('@/pages/FinancePage').then(m => ({ default: m.FinancePage })));
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then(m => ({ default: m.ReportsPage })));

// Shared
import { ToolDetailModal } from '@/components/features/inventory/components/ToolDetailModal';
import { useStore } from '@/context/StoreContext';

// Loading fallback component
const PageLoader = () => (
    <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
);


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
                        <ProtectedRoute requireAdmin={true}>
                            <Suspense fallback={<PageLoader />}><MembersPage /></Suspense>
                        </ProtectedRoute>
                    } />
                    <Route path="inventory" element={
                        <ProtectedRoute requireAdmin={true}>
                            <Suspense fallback={<PageLoader />}><InventoryPage /></Suspense>
                        </ProtectedRoute>
                    } />
                    <Route path="rentals" element={
                        <ProtectedRoute requireAdmin={true}>
                            <Suspense fallback={<PageLoader />}><RentalsPage /></Suspense>
                        </ProtectedRoute>
                    } />
                    <Route path="finance" element={
                        <ProtectedRoute requireAdmin={true}>
                            <Suspense fallback={<PageLoader />}><FinancePage /></Suspense>
                        </ProtectedRoute>
                    } />
                    <Route path="reports" element={
                        <ProtectedRoute requireAdmin={true}>
                            <Suspense fallback={<PageLoader />}><ReportsPage onToolClick={handleToolClick} /></Suspense>
                        </ProtectedRoute>
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
