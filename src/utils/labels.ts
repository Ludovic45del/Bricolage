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
