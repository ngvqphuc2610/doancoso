'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    role: 'admin' | 'user';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
    register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    isAdmin: () => boolean;
    isAuthenticated: () => boolean;
}

interface RegisterData {
    fullname: string;
    birthday: string;
    phone: string;
    username: string;
    cmnd: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUser(data.data);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.data.user);

                // kiểm tra role nếu là admin vào admin còn không thì chỉ vào home
                if (data.data.user.role === 'admin') {
                    router.push('/');
                } else {
                    router.push('/');
                }
            }

            return {
                success: data.success,
                message: data.message
            };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                message: 'Đã xảy ra lỗi khi đăng nhập'
            };
        }
    };

    const register = async (userData: RegisterData) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            return {
                success: data.success,
                message: data.message
            };
        } catch (error) {
            console.error('Register failed:', error);
            return {
                success: false,
                message: 'Đã xảy ra lỗi khi đăng ký'
            };
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setUser(null);
            router.push('/');
        }
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const isAuthenticated = () => {
        return user !== null;
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        checkAuth,
        isAdmin,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
