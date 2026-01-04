import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { LoginScreen } from '@/components/features/auth/components/LoginScreen';
import { AlertModal } from '@/components/ui/AlertModal';

export const LoginPage = () => {
    const { users, login, addUser } = useStore();
    const navigate = useNavigate();
    const [alertConfig, setAlertConfig] = useState<any>({ isOpen: false });

    const showAlert = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'confirm' = 'info', onConfirm?: () => void) => {
        setAlertConfig({ isOpen: true, title, message, type, onConfirm });
    };

    const handleLogin = async (identifier: string, password: string) => {
        try {
            const user = await login(identifier, password);
            const role = (user.role === 'admin' || user.role === 'staff') ? 'admin' : 'user';
            if (role === 'admin') navigate('/members');
            else navigate('/dashboard');
        } catch (error) {
            throw error;
        }
    };


    return (
        <>
            <LoginScreen
                onLogin={handleLogin}
                onRegister={(u) => addUser(u)}
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
