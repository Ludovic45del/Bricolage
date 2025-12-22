/**
 * Generate a unique UUID v4 identifier
 * Uses crypto.randomUUID() for cryptographic randomness
 */
export const generateId = (): string => {
    return crypto.randomUUID();
};

/**
 * Fallback for older browsers (pre ~2021)
 * Uses Math.random() - less secure but works everywhere
 */
export const generateIdLegacy = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * Check if crypto.randomUUID is available
 */
export const hasNativeCrypto = (): boolean => {
    return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function';
};
