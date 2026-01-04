import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi, LoginPayload, AuthResponse } from './auth';
import { apiClient } from './client';

// Mock the apiClient and tokenManager
vi.mock('./client', () => ({
    apiClient: {
        post: vi.fn(),
        get: vi.fn(),
    },
    tokenManager: {
        getAccessToken: vi.fn(),
        getRefreshToken: vi.fn(),
        setTokens: vi.fn(),
        clearTokens: vi.fn(),
        isAuthenticated: vi.fn(),
    },
}));

describe('authApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('login', () => {
        it('calls POST /auth/login with correct payload', async () => {
            const mockResponse: AuthResponse = {
                tokens: {
                    accessToken: 'test-access-token',
                    refreshToken: 'test-refresh-token',
                },
                user: {
                    id: '1',
                    email: 'test@example.com',
                    role: 'admin',
                    name: 'Test User',
                },
            };

            vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

            const payload: LoginPayload = {
                identifier: 'test@example.com',
                password: 'password123',
            };

            const result = await authApi.login(payload);

            expect(apiClient.post).toHaveBeenCalledWith('/auth/login', payload);
            expect(result).toEqual(mockResponse);
        });

        it('supports login with badge number', async () => {
            const mockResponse: AuthResponse = {
                tokens: {
                    accessToken: 'badge-token',
                    refreshToken: 'badge-refresh',
                },
                user: {
                    id: '2',
                    email: 'badge@example.com',
                    role: 'member',
                    name: 'Badge User',
                },
            };

            vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

            const payload: LoginPayload = {
                identifier: 'BADGE123',
                password: 'password456',
            };

            await authApi.login(payload);

            expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
                identifier: 'BADGE123',
                password: 'password456',
            });
        });

        it('propagates errors from API', async () => {
            const error = new Error('Invalid credentials');
            vi.mocked(apiClient.post).mockRejectedValue(error);

            await expect(
                authApi.login({ identifier: 'bad@email.com', password: 'wrong' })
            ).rejects.toThrow('Invalid credentials');
        });
    });

    describe('register', () => {
        it('calls POST /auth/register with user data', async () => {
            const mockUser = {
                id: '3',
                email: 'new@example.com',
                name: 'New User',
            };

            vi.mocked(apiClient.post).mockResolvedValue({ data: mockUser });

            const payload = {
                email: 'new@example.com',
                password: 'newpass123',
                name: 'New User',
                badgeNumber: 'NEW001',
            };

            const result = await authApi.register(payload);

            expect(apiClient.post).toHaveBeenCalledWith('/auth/register', payload);
            expect(result).toEqual(mockUser);
        });

        it('propagates registration errors', async () => {
            const error = new Error('Email already exists');
            vi.mocked(apiClient.post).mockRejectedValue(error);

            await expect(
                authApi.register({ email: 'existing@email.com', password: 'pass' })
            ).rejects.toThrow('Email already exists');
        });
    });

    describe('logout', () => {
        it('calls tokenManager.clearTokens to remove all auth data', async () => {
            const { tokenManager } = await import('./client');

            authApi.logout();

            expect(tokenManager.clearTokens).toHaveBeenCalled();
        });

        it('does not throw if no token exists', () => {
            expect(() => authApi.logout()).not.toThrow();
        });
    });
});
