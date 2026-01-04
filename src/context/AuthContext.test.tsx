import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { authApi } from '@/services/api/auth';

// Mock the authApi module
vi.mock('@/services/api/auth', () => ({
    authApi: {
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
    },
}));

// Test component that uses the auth context
const TestComponent = () => {
    const { currentUser, login, logout, isAdmin } = useAuth();

    const handleLogin = async () => {
        try {
            await login('test@example.com', 'password123');
        } catch {
            // Error handled - prevents unhandled rejection
        }
    };

    return (
        <div>
            <div data-testid="current-user">{currentUser?.name || 'no-user'}</div>
            <div data-testid="is-admin">{isAdmin ? 'admin' : 'not-admin'}</div>
            <button
                data-testid="login-btn"
                onClick={handleLogin}
            >
                Login
            </button>
            <button data-testid="logout-btn" onClick={logout}>
                Logout
            </button>
        </div>
    );
};


describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('useAuth hook', () => {
        it('throws error when used outside AuthProvider', () => {
            // Suppress console.error for this test
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            expect(() => {
                render(<TestComponent />);
            }).toThrow('useAuth must be used within an AuthProvider');

            consoleSpy.mockRestore();
        });
    });

    describe('AuthProvider', () => {
        it('renders children correctly', () => {
            render(
                <AuthProvider>
                    <div data-testid="child">Hello</div>
                </AuthProvider>
            );

            expect(screen.getByTestId('child')).toHaveTextContent('Hello');
        });

        it('initializes with no user when localStorage is empty', () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByTestId('current-user')).toHaveTextContent('no-user');
            expect(screen.getByTestId('is-admin')).toHaveTextContent('not-admin');
        });

        it('loads user from localStorage on mount', () => {
            const savedUser = {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
                role: 'admin',
            };
            localStorage.setItem('assomanager_user', JSON.stringify(savedUser));

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByTestId('current-user')).toHaveTextContent('John Doe');
            expect(screen.getByTestId('is-admin')).toHaveTextContent('admin');
        });

        it('handles corrupted localStorage data gracefully', () => {
            localStorage.setItem('assomanager_user', 'invalid-json');

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByTestId('current-user')).toHaveTextContent('no-user');
        });
    });

    describe('login', () => {
        it('calls authApi.login and stores token', async () => {
            const mockUser = {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'member',
            };
            const mockResponse = {
                tokens: {
                    accessToken: 'test-access-token',
                    refreshToken: 'test-refresh-token',
                },
                user: mockUser,
            };

            vi.mocked(authApi.login).mockResolvedValue(mockResponse);

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            const loginBtn = screen.getByTestId('login-btn');
            await act(async () => {
                await userEvent.click(loginBtn);
            });

            await waitFor(() => {
                expect(authApi.login).toHaveBeenCalledWith({
                    identifier: 'test@example.com',
                    password: 'password123',
                });
            });

            expect(localStorage.getItem('access_token')).toBe('test-access-token');
            expect(screen.getByTestId('current-user')).toHaveTextContent('Test User');
        });

        it('does not set user when tokens are missing from response', async () => {
            const mockResponse = {
                tokens: null,
                user: { id: '1', name: 'Test', email: 'test@test.com', role: 'member' },
            };

            vi.mocked(authApi.login).mockResolvedValue(mockResponse as any);

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            const loginBtn = screen.getByTestId('login-btn');

            // Click triggers login which throws, but userEvent catches it
            await act(async () => {
                try {
                    await userEvent.click(loginBtn);
                } catch {
                    // Error is expected
                }
            });

            // User should remain null since login threw an error
            expect(screen.getByTestId('current-user')).toHaveTextContent('no-user');
            expect(localStorage.getItem('access_token')).toBeNull();
        });

    });

    describe('logout', () => {
        it('clears localStorage and sets currentUser to null', async () => {
            const savedUser = {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
                role: 'admin',
            };
            localStorage.setItem('access_token', 'test-token');
            localStorage.setItem('assomanager_user', JSON.stringify(savedUser));

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByTestId('current-user')).toHaveTextContent('John Doe');

            const logoutBtn = screen.getByTestId('logout-btn');
            await userEvent.click(logoutBtn);

            expect(localStorage.getItem('access_token')).toBeNull();
            expect(localStorage.getItem('assomanager_user')).toBeNull();
            expect(screen.getByTestId('current-user')).toHaveTextContent('no-user');
        });
    });

    describe('isAdmin', () => {
        it('returns true for admin role', () => {
            const adminUser = {
                id: '1',
                name: 'Admin',
                email: 'admin@example.com',
                role: 'admin',
            };
            localStorage.setItem('assomanager_user', JSON.stringify(adminUser));

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByTestId('is-admin')).toHaveTextContent('admin');
        });

        it('returns false for member role', () => {
            const memberUser = {
                id: '1',
                name: 'Member',
                email: 'member@example.com',
                role: 'member',
            };
            localStorage.setItem('assomanager_user', JSON.stringify(memberUser));

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByTestId('is-admin')).toHaveTextContent('not-admin');
        });
    });
});
