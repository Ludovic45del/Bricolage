import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store original localStorage
const originalLocalStorage = global.localStorage;

describe('tokenManager', () => {
    let mockLocalStorage: { [key: string]: string };

    beforeEach(() => {
        mockLocalStorage = {};

        // Mock localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
                setItem: vi.fn((key: string, value: string) => {
                    mockLocalStorage[key] = value;
                }),
                removeItem: vi.fn((key: string) => {
                    delete mockLocalStorage[key];
                }),
                clear: vi.fn(() => {
                    mockLocalStorage = {};
                }),
            },
            writable: true,
        });

        // Reset modules to get fresh import
        vi.resetModules();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('getAccessToken returns token from localStorage', async () => {
        mockLocalStorage['access_token'] = 'test-access-token';

        const { tokenManager } = await import('./client');

        expect(tokenManager.getAccessToken()).toBe('test-access-token');
    });

    it('getRefreshToken returns refresh token from localStorage', async () => {
        mockLocalStorage['refresh_token'] = 'test-refresh-token';

        const { tokenManager } = await import('./client');

        expect(tokenManager.getRefreshToken()).toBe('test-refresh-token');
    });

    it('setTokens stores both tokens', async () => {
        const { tokenManager } = await import('./client');

        tokenManager.setTokens('new-access', 'new-refresh');

        expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'new-access');
        expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', 'new-refresh');
    });

    it('clearTokens removes all auth data', async () => {
        mockLocalStorage['access_token'] = 'token';
        mockLocalStorage['refresh_token'] = 'refresh';
        mockLocalStorage['assomanager_user'] = '{}';

        const { tokenManager } = await import('./client');

        tokenManager.clearTokens();

        expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
        expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
        expect(localStorage.removeItem).toHaveBeenCalledWith('assomanager_user');
    });

    it('isAuthenticated returns true when access token exists', async () => {
        mockLocalStorage['access_token'] = 'test-token';

        const { tokenManager } = await import('./client');

        expect(tokenManager.isAuthenticated()).toBe(true);
    });

    it('isAuthenticated returns false when no access token', async () => {
        const { tokenManager } = await import('./client');

        expect(tokenManager.isAuthenticated()).toBe(false);
    });
});
