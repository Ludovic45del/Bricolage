import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base API URL from environment variables or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============================================
// REFRESH TOKEN QUEUE MANAGEMENT
// ============================================

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

// ============================================
// TOKEN MANAGEMENT UTILITIES
// ============================================

export const tokenManager = {
    getAccessToken: () => localStorage.getItem('access_token'),
    getRefreshToken: () => localStorage.getItem('refresh_token'),

    setTokens: (accessToken: string, refreshToken: string) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
    },

    clearTokens: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('assomanager_user');
    },

    isAuthenticated: () => !!localStorage.getItem('access_token'),
};

// ============================================
// REQUEST INTERCEPTOR
// ============================================

apiClient.interceptors.request.use(
    (config) => {
        const token = tokenManager.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ============================================
// RESPONSE INTERCEPTOR WITH REFRESH TOKEN
// ============================================

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If not a 401 error, reject immediately
        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }

        // If already on login page, don't try to refresh
        if (window.location.pathname.includes('/login')) {
            return Promise.reject(error);
        }

        // If this is a refresh token request that failed, logout
        if (originalRequest.url?.includes('/auth/refresh')) {
            tokenManager.clearTokens();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // If we've already retried this request, don't try again
        if (originalRequest._retry) {
            tokenManager.clearTokens();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // If already refreshing, queue the request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalRequest);
            }).catch(err => {
                return Promise.reject(err);
            });
        }

        // Start refresh process
        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = tokenManager.getRefreshToken();

        if (!refreshToken) {
            isRefreshing = false;
            tokenManager.clearTokens();
            window.location.href = '/login';
            return Promise.reject(new Error('No refresh token available'));
        }

        try {
            // Make refresh request with a new axios instance to avoid interceptors
            const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            // Store new tokens
            tokenManager.setTokens(accessToken, newRefreshToken);

            // Process queued requests
            processQueue(null, accessToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
        } catch (refreshError) {
            // Refresh failed, logout user
            processQueue(refreshError, null);
            tokenManager.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

