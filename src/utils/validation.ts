import { parseISO, isBefore } from 'date-fns';



export const isMembershipExpiringSoon = (expiryDate: string): boolean => {
    if (!expiryDate) return false;
    const expiry = parseISO(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return !isBefore(expiry, today) && isBefore(expiry, thirtyDaysFromNow);
};
