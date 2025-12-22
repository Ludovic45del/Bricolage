import { isFriday, parseISO, isBefore, format, differenceInDays } from 'date-fns';

export const isDateFriday = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = parseISO(dateString);
  return isFriday(date);
};

export const isMembershipActive = (expiryDate: string): boolean => {
  if (!expiryDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  const expiry = parseISO(expiryDate);
  return !isBefore(expiry, today);
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  // European format: 31/12/2023
  return format(parseISO(dateString), 'dd/MM/yyyy');
};

export const getPlaceholderImage = (id: string) => {
  return `https://picsum.photos/seed/${id}/300/200`;
};

export const calculateRentalCost = (start: string, end: string, dailyPrice: number): number => {
  if (!start || !end) return 0;
  const days = differenceInDays(parseISO(end), parseISO(start));
  if (days < 0) return 0;
  return days * dailyPrice;
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

export type MaintenanceStatusInfo = {
  label: string;
  colorClass: string;
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

export const openDocument = (url: string, filename?: string) => {
  if (url.startsWith('data:')) {
    // Extract mime type from Data URL
    const mimeMatch = url.match(/^data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

    // Convert Data URL to Blob
    const byteString = atob(url.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);

    // If it's a PDF, open in new tab
    if (mimeType === 'application/pdf') {
      window.open(blobUrl, '_blank');
      return;
    }

    // For other file types, download with original filename
    const extMap: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/gif': '.gif',
      'image/webp': '.webp',
    };

    const ext = extMap[mimeType] || '';
    let downloadName = filename || 'document';

    // Add extension only if not already present
    if (ext && !downloadName.toLowerCase().endsWith(ext)) {
      downloadName += ext;
    }

    // Use Blob URL for download to ensure proper filename
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up blob URL after download
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  } else {
    // For regular URLs, open in new tab
    window.open(url, '_blank');
  }
};
