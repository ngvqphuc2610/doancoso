'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ChangePassword from '@/components/profile/ChangePassword';
import AvatarUpload from '@/components/profile/AvatarUpload';
import { User, Lock, Camera, CreditCard, History } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, isAuthenticated } = useAuth();
    const { profile, loading, error } = useProfile();
    const [activeTab, setActiveTab] = useState('info');

    if (!isAuthenticated()) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Vui lòng đăng nhập
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Bạn cần đăng nhập để xem thông tin cá nhân
                        </p>
                        <Link
                            href="/login"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h1>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
            </Layout>
        );
    }

    const tabs = [
        { id: 'info', label: 'Thông tin cá nhân', icon: User },
        { id: 'avatar', label: 'Ảnh đại diện', icon: Camera },
        { id: 'password', label: 'Đổi mật khẩu', icon: Lock },
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                {profile?.profileImage ? (
                                    <img
                                        src={profile.profileImage}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-8 h-8 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {profile?.fullName || 'Người dùng'}
                                </h1>
                                <p className="text-gray-600">{profile?.email}</p>
                                {profile?.member && (
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                            Thành viên
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {profile.member.points} điểm
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Link
                            href="/booking-history"
                            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center space-x-3"
                        >
                            <History className="w-6 h-6 text-blue-600" />
                            <div>
                                <h3 className="font-medium text-gray-900">Lịch sử đặt vé</h3>
                                <p className="text-sm text-gray-600">Xem các vé đã đặt</p>
                            </div>
                        </Link>
                        <Link
                            href="/membership"
                            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center space-x-3"
                        >
                            <CreditCard className="w-6 h-6 text-green-600" />
                            <div>
                                <h3 className="font-medium text-gray-900">Thành viên</h3>
                                <p className="text-sm text-gray-600">Quản lý thành viên</p>
                            </div>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <nav className="space-y-2">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === tab.id
                                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="font-medium">{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                {activeTab === 'info' && <ProfileInfo profile={profile} />}
                                {activeTab === 'avatar' && <AvatarUpload profile={profile} />}
                                {activeTab === 'password' && <ChangePassword />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}