import { parseISO, isBefore } from 'date-fns';

export type MaintenanceStatusInfo = {
    label: string;
    colorClass: string;
};

export const getMaintenanceExpiration = (lastMaintenanceDate: string | undefined, intervalMonths: number | undefined): Date | null => {
    if (!lastMaintenanceDate || !intervalMonths) return null;
    const lastDate = parseISO(lastMaintenanceDate);
    const expiryDate = new Date(lastDate);
    expiryDate.setMonth(expiryDate.getMonth() + intervalMonths);
    return expiryDate;
};

export const isMaintenanceUrgent = (lastMaintenanceDate: string | undefined, intervalMonths: number | undefined): boolean => {
    const expiryDate = getMaintenanceExpiration(lastMaintenanceDate, intervalMonths);
    if (!expiryDate) return false;

    const today = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(today.getDate() + 14);

    return isBefore(expiryDate, twoWeeksFromNow);
};

export const isMaintenanceExpired = (lastMaintenanceDate: string | undefined, intervalMonths: number | undefined): boolean => {
    const expiryDate = getMaintenanceExpiration(lastMaintenanceDate, intervalMonths);
    if (!expiryDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isBefore(expiryDate, today);
};

export const getMaintenanceStatus = (tool: { status: string; lastMaintenanceDate?: string; maintenanceInterval?: number }): MaintenanceStatusInfo => {
    if (tool.status === 'maintenance') {
        return { label: 'En Révision', colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    }

    const isExpired = isMaintenanceExpired(tool.lastMaintenanceDate, tool.maintenanceInterval);
    if (isExpired) {
        return { label: 'Maintenance Expirée', colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
    }

    const isUrgent = isMaintenanceUrgent(tool.lastMaintenanceDate, tool.maintenanceInterval);
    if (isUrgent) {
        return { label: 'Proche (2 sem)', colorClass: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
    }

    return { label: 'À jour / Conforme', colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
};

export const isMaintenanceBlocked = (tool: { status: string; lastMaintenanceDate?: string; maintenanceInterval?: number; maintenanceImportance: 'low' | 'medium' | 'high' }): boolean => {
    if (tool.maintenanceImportance === 'low') return false;
    return isMaintenanceExpired(tool.lastMaintenanceDate, tool.maintenanceInterval);
};
