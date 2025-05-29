'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    requireRole?: 'admin' | 'user';
}

export default function AuthGuard({ children, fallback, requireRole }: AuthGuardProps) {
    const { user, loading, isAdmin, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated()) {
                router.push('/login');
                return;
            }

            if (requireRole === 'admin' && !isAdmin()) {
                router.push('/');
                return;
            }
        }
    }, [user, loading, router, isAuthenticated, isAdmin, requireRole]);

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Show fallback if not authenticated
    if (!isAuthenticated()) {
        return fallback || (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Yêu cầu đăng nhập
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Bạn cần đăng nhập để truy cập trang này.
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
                    >
                        Đăng nhập
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    // Show fallback if role requirement not met
    if (requireRole === 'admin' && !isAdmin()) {
        return fallback || (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Truy cập bị từ chối
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Bạn không có quyền truy cập vào trang này.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
