import { apiClient } from './client';


// Re-defining interfaces here to avoid importing directly from backend source which might fail build
export interface LoginPayload {
    identifier: string; // email OR badgeNumber
    password: string;
}

export interface AuthResponse {
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
    user: {
        id: string;
        email: string;
        role: string;
        name: string;
    };
}

export const authApi = {
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', payload);
        return response.data;
    },

    register: async (payload: any) => {
        const response = await apiClient.post('/auth/register', payload);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('access_token');
    }
};
