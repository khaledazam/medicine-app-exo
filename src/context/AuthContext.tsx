import React, { createContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { authService, User, AuthResponse } from '../services/authService';
import { tokenManager } from '../services/api';

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<AuthResponse>;
    register: (firstname: string, lastname: string, username: string, password: string, cpassword: string) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    // Check session on app start
    useEffect(() => {
        checkSession();
    }, []);

    // Navigation guard
    useEffect(() => {
        if (loading) return;
        const inAuthGroup = segments[0] === '(auth)';
        if (!user && !inAuthGroup) {
            router.replace('/(auth)/sign-in');
        } else if (user && inAuthGroup) {
            router.replace('/');
        }
    }, [user, segments, loading]);

    const checkSession = async () => {
        try {
            const token = await tokenManager.getToken();
            if (token) {
                const response = await authService.getProfile();
                setUser(response.user);
            }
        } catch (error) {
            console.error('Session check failed:', error);
            await tokenManager.removeToken();
        } finally {
            setLoading(false);
        }
    };

    const login = async (username: string, password: string): Promise<AuthResponse> => {
        const response = await authService.login(username, password);
        if (response.success && response.user) {
            setUser(response.user);
        }
        return response;
    };

    const register = async (
        firstname: string,
        lastname: string,
        username: string,
        password: string,
        cpassword: string
    ): Promise<AuthResponse> => {
        const response = await authService.register(firstname, lastname, username, password, cpassword);
        if (response.success && response.user) {
            setUser(response.user);
        }
        return response;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
