import { differenceInDays, isFriday, parseISO, format } from 'date-fns';

export const isDateFriday = (dateString: string): boolean => {
    if (!dateString) return false;
    try {
        const date = parseISO(dateString);
        return isFriday(date);
    } catch (e) {
        return false;
    }
};

export const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
        // Return standard European format if possible
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
};

export const isMembershipActive = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) > new Date();
};

export const isRentalOverdue = (rental: { endDate: string; status: string }) => {
    if (!rental || rental.status !== 'active') return false;
    return new Date(rental.endDate) < new Date();
};
