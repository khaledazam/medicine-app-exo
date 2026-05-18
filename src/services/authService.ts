import api, { tokenManager, AppApiError } from './api';

export interface User {
    id?: string;
    _id?: string;
    username: string;
    firstname?: string;
    lastname?: string;
    email?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    jwtToken?: string;
    user?: User;
}

export const authService = {
    login: async (username: string, password: string): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/auth/login', {
                username,
                password,
            });

            if (response.data.jwtToken) {
                await tokenManager.saveToken(response.data.jwtToken);
            }

            return response.data;
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Login failed');
        }
    },

    register: async (
        firstname: string,
        lastname: string,
        username: string,
        password: string,
        cpassword: string
    ): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/auth/register', {
                firstname,
                lastname,
                username,
                password,
                cpassword,
            });

            if (response.data.jwtToken) {
                await tokenManager.saveToken(response.data.jwtToken);
            }

            return response.data;
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Registration failed');
        }
    },

    getProfile: async (): Promise<{ user: User }> => {
        try {
            const response = await api.get('/auth/profile');
            return response.data;
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Failed to fetch profile');
        }
    },

    logout: async (): Promise<void> => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.warn('Logout API failed, clearing local token');
        } finally {
            await tokenManager.removeToken();
        }
    },
};
