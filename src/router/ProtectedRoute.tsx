import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { ROUTES } from './routes';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
    const { isAuthenticated, isAdmin } = useStore();

    if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} />;

    if (requireAdmin && !isAdmin) {
        // Redirect non-admin trying to access admin route back to their dashboard
        return <Navigate to={ROUTES.DASHBOARD} />;
    }

    return <>{children}</>;
};
