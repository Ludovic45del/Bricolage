export const getStatusLabel = (status: string | undefined | null) => {
    if (!status) return 'Disponible'; // Default fallback
    switch (status.toLowerCase()) {
        case 'available': return 'Disponible';
        case 'rented': return 'Loué';
        case 'maintenance': return 'Maintenance';
        case 'unavailable': return 'Indisponible';
        default: return status;
    }
};

export const getImportanceLabel = (importance: string | undefined | null) => {
    switch (importance?.toLowerCase()) {
        case 'low': return 'Faible';
        case 'medium': return 'Moyenne';
        case 'high': return 'Haute';
        default: return importance;
    }
};

export const getPaymentMethodLabel = (method: string | undefined | null) => {
    switch (method?.toLowerCase()) {
        case 'card': return 'Carte';
        case 'check': return 'Chèque';
        case 'cash': return 'Espèces';
        case 'system': return 'Système';
        default: return method;
    }
};
