import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// We need to test the interceptors, so we'll mock axios.create
const mockInterceptors = {
    request: {
        use: vi.fn(),
    },
    response: {
        use: vi.fn(),
    },
};

const mockAxiosInstance = {
    interceptors: mockInterceptors,
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
};

vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => mockAxiosInstance),
    },
}));

describe('apiClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // Reset modules to get fresh imports
        vi.resetModules();
    });

    describe('creation', () => {
        it('creates axios instance with correct baseURL', async () => {
            // Import the module to trigger axios.create
            await import('./client');

            expect(axios.create).toHaveBeenCalledWith({
                baseURL: expect.stringContaining('localhost:4000'),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        });
    });

    describe('request interceptor', () => {
        it('registers a request interceptor', async () => {
            await import('./client');

            expect(mockInterceptors.request.use).toHaveBeenCalledTimes(1);
        });

        it('adds Authorization header when token exists', async () => {
            await import('./client');

            // Get the request interceptor function
            const [successHandler] = mockInterceptors.request.use.mock.calls[0];

            localStorage.setItem('access_token', 'test-token-123');

            const config = { headers: {} as Record<string, string> };
            const result = successHandler(config);

            expect(result.headers.Authorization).toBe('Bearer test-token-123');
        });

        it('does not add Authorization header when no token', async () => {
            await import('./client');

            const [successHandler] = mockInterceptors.request.use.mock.calls[0];

            const config = { headers: {} as Record<string, string> };
            const result = successHandler(config);

            expect(result.headers.Authorization).toBeUndefined();
        });
    });

    describe('response interceptor', () => {
        it('registers a response interceptor', async () => {
            await import('./client');

            expect(mockInterceptors.response.use).toHaveBeenCalledTimes(1);
        });

        it('passes through successful responses', async () => {
            await import('./client');

            const [successHandler] = mockInterceptors.response.use.mock.calls[0];

            const response = { data: { message: 'success' } };
            const result = successHandler(response);

            expect(result).toBe(response);
        });

        it('handles 401 error by attempting refresh, then clearing localStorage if no refresh token', async () => {
            await import('./client');

            const [, errorHandler] = mockInterceptors.response.use.mock.calls[0];

            localStorage.setItem('access_token', 'old-token');
            localStorage.setItem('assomanager_user', '{"name": "Test"}');
            // Note: No refresh_token set - this triggers direct logout

            const error = {
                response: { status: 401 },
                config: { headers: {}, url: '/api/test' }, // Mock config for retry logic
            };

            // Mock window.location.pathname
            Object.defineProperty(window, 'location', {
                value: { pathname: '/members', href: '' },
                writable: true,
            });

            await expect(errorHandler(error)).rejects.toBeDefined();

            // Without refresh token, should clear and redirect
            expect(localStorage.getItem('access_token')).toBeNull();
            expect(localStorage.getItem('refresh_token')).toBeNull();
            expect(window.location.href).toBe('/login');
        });

        it('does not redirect if already on login page', async () => {
            await import('./client');

            const [, errorHandler] = mockInterceptors.response.use.mock.calls[0];

            Object.defineProperty(window, 'location', {
                value: { pathname: '/login', href: '' },
                writable: true,
            });

            const error = {
                response: { status: 401 },
            };

            await expect(errorHandler(error)).rejects.toBeDefined();

            // Should not redirect
            expect(window.location.href).toBe('');
        });

        it('propagates non-401 errors', async () => {
            await import('./client');

            const [, errorHandler] = mockInterceptors.response.use.mock.calls[0];

            const error = {
                response: { status: 500 },
                message: 'Internal Server Error',
            };

            await expect(errorHandler(error)).rejects.toEqual(error);
        });
    });
});
