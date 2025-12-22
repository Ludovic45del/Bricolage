import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { UserDashboard } from '@/components/features/dashboard/components/UserDashboard';
import { AlertModal } from '@/components/ui/AlertModal';

export const DashboardPage = () => {
    const { currentUser, logout, tools, categories, rentals, addRental, updateUser } = useStore();
    const navigate = useNavigate();
    const [alertConfig, setAlertConfig] = useState<any>({ isOpen: false });

    const showAlert = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'confirm' = 'info', onConfirm?: () => void) => {
        setAlertConfig({ isOpen: true, title, message, type, onConfirm });
    };

    if (!currentUser) return <Navigate to="/login" />;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <UserDashboard
                currentUser={currentUser}
                tools={tools}
                categories={categories}
                myRentals={rentals.filter(r => r.userId === currentUser.id)}
                onLogout={handleLogout}
                onRequestRental={addRental}
                onUpdateUser={updateUser}
                showAlert={showAlert}
            />
            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                onConfirm={alertConfig.onConfirm}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </>
    );
};
