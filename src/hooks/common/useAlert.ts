import { useState, useCallback } from 'react';

export type AlertType = 'info' | 'success' | 'warning' | 'confirm';

export interface AlertConfig {
    isOpen: boolean;
    title?: string;
    message?: string;
    type?: AlertType;
    onConfirm?: () => void;
}

/**
 * Hook for managing AlertModal state
 * Replaces duplicated alertConfig state across components
 */
export const useAlert = () => {
    const [config, setConfig] = useState<AlertConfig>({ isOpen: false });

    const showAlert = useCallback((
        title: string,
        message: string,
        type: AlertType = 'info',
        onConfirm?: () => void
    ) => {
        setConfig({ isOpen: true, title, message, type, onConfirm });
    }, []);

    const closeAlert = useCallback(() => {
        setConfig(prev => ({ ...prev, isOpen: false }));
    }, []);

    const confirm = useCallback((title: string, message: string, onConfirm: () => void) => {
        showAlert(title, message, 'confirm', onConfirm);
    }, [showAlert]);

    const success = useCallback((title: string, message: string) => {
        showAlert(title, message, 'success');
    }, [showAlert]);

    const warning = useCallback((title: string, message: string) => {
        showAlert(title, message, 'warning');
    }, [showAlert]);

    return {
        config,
        showAlert,
        closeAlert,
        confirm,
        success,
        warning,
    };
};

export default useAlert;
