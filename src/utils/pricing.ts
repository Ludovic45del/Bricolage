import { differenceInDays, parseISO } from 'date-fns';

export const calculateRentalCost = (startDate: string, endDate: string, weeklyPrice: number): number => {
    if (!startDate || !endDate || weeklyPrice < 0) return 0;
    const days = differenceInDays(parseISO(endDate), parseISO(startDate));
    if (days < 0) return 0;
    // Calculate by weeks (rounded up)
    const weeks = Math.ceil(days / 7);
    return Math.max(1, weeks) * weeklyPrice;
};
