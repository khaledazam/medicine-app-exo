import axios, {
    AxiosInstance,
    AxiosError,
    InternalAxiosRequestConfig
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';
const TOKEN_KEY = 'authToken';

export class AppApiError extends Error {
    constructor(
        public message: string,
        public status?: number,
        public data?: any
    ) {
        super(message);
        this.name = 'AppApiError';
    }
}

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '15000'),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add token to all requests
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log(`🔑 Token added to ${config.method?.toUpperCase()} ${config.url}`);
            }
        } catch (error) {
            console.error('❌ Error getting token:', error);
        }
        return config;
    }
);

// Response Interceptor: Handle errors and token expiry
api.interceptors.response.use(
    (response) => {
        console.log(`✅ ${response.status}: ${response.config.url}`);
        return response;
    },
    async (error: AxiosError<any>) => {
        const message = error.response?.data?.message || error.message || 'Unknown error';
        const status = error.response?.status;

        console.error(`❌ API Error ${status}:`, message);

        // Handle 401 Unauthorized
        if (status === 401) {
            await AsyncStorage.removeItem(TOKEN_KEY);
        }

        throw new AppApiError(message, status, error.response?.data);
    }
);

// Token Management
export const tokenManager = {
    saveToken: async (token: string) => {
        await AsyncStorage.setItem(TOKEN_KEY, token);
    },
    getToken: async () => {
        return await AsyncStorage.getItem(TOKEN_KEY);
    },
    removeToken: async () => {
        await AsyncStorage.removeItem(TOKEN_KEY);
    },
};

export default api;
