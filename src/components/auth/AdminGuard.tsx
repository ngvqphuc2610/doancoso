'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AdminGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function AdminGuard({ children, fallback }: AdminGuardProps) {
    const { user, loading, isAdmin, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated()) {
                router.push('/login');
                return;
            }

            if (!isAdmin()) {
                router.push('/');
                return;
            }
        }
    }, [user, loading, router, isAuthenticated, isAdmin]);

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Show fallback if not authenticated or not admin
    if (!isAuthenticated() || !isAdmin()) {
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
