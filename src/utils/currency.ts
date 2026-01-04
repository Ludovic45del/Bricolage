export const formatCurrency = (amount: number | null | undefined) => {
    // Handle undefined, null, NaN, and non-finite numbers
    if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) {
        amount = 0;
    }
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
};
