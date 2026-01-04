/**
 * Generate a unique UUID v4 identifier
 * Uses crypto.randomUUID() for cryptographic randomness
 */
export const generateId = (): string => {
    return crypto.randomUUID();
};
