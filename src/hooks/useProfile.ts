'use client';

import { useState, useEffect } from 'react';

interface ProfileData {
    id: number;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    profileImage?: string;
    createdAt: string;
    role: string;
    status: string;
    member?: {
        id: number;
        points: number;
        joinDate: string;
        status: string;
        type?: string;
        package?: string;
        benefits?: string;
    } | null;
}

interface BookingHistory {
    id: number;
    bookingCode: string;
    totalAmount: number;
    paymentStatus: string;
    bookingStatus: string;
    bookingDate: string;
    customerInfo: {
        name: string;
        email: string;
        phone: string;
    };
    movie: {
        title: string;
        posterImage: string;
        duration: number;
        ageRestriction: string;
    };
    showtime: {
        startTime: string;
        showDate: string;
        format: string;
        language: string;
        subtitle: string;
    };
    cinema: {
        name: string;
        address: string;
        screen: string;
    };
    seats: string[];
    seatCount: number;
    products: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>;
}

interface MembershipData {
    member: {
        id: number;
        points: number;
        joinDate: string;
        status: string;
        fullName: string;
        email: string;
    };
    currentType?: {
        name: string;
        description: string;
        discountPercentage: number;
    } | null;
    currentPackage?: {
        name: string;
        price: number;
        durationMonths: number;
        benefits: string;
        description: string;
    } | null;
    availablePackages: any[];
    memberTypes: any[];
}

export function useProfile() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/profile', {
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                setProfile(data.data);
                setError(null);
            } else {
                setError(data.message || 'Lỗi khi lấy thông tin profile');
            }
        } catch (err) {
            setError('Lỗi kết nối server');
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (profileData: Partial<ProfileData>) => {
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (data.success) {
                await fetchProfile(); // Refresh profile data
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message };
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            return { success: false, message: 'Lỗi kết nối server' };
        }
    };

    const changePassword = async (passwordData: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }) => {
        try {
            const response = await fetch('/api/profile/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(passwordData),
            });

            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (err) {
            console.error('Error changing password:', err);
            return { success: false, message: 'Lỗi kết nối server' };
        }
    };

    const uploadAvatar = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch('/api/profile/upload-avatar', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                await fetchProfile(); // Refresh profile data
                return { success: true, message: data.message, profileImage: data.data.profileImage };
            } else {
                return { success: false, message: data.message };
            }
        } catch (err) {
            console.error('Error uploading avatar:', err);
            return { success: false, message: 'Lỗi kết nối server' };
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return {
        profile,
        loading,
        error,
        fetchProfile,
        updateProfile,
        changePassword,
        uploadAvatar
    };
}

export function useBookingHistory() {
    const [bookings, setBookings] = useState<BookingHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    });

    const fetchBookingHistory = async (page = 1, status?: string) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString()
            });

            if (status) {
                params.append('status', status);
            }

            const response = await fetch(`/api/profile/booking-history?${params}`, {
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                setBookings(data.data.bookings);
                setPagination(data.data.pagination);
                setError(null);
            } else {
                setError(data.message || 'Lỗi khi lấy lịch sử đặt vé');
            }
        } catch (err) {
            setError('Lỗi kết nối server');
            console.error('Error fetching booking history:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookingHistory();
    }, []);

    return {
        bookings,
        loading,
        error,
        pagination,
        fetchBookingHistory
    };
}

export function useMembership() {
    const [membership, setMembership] = useState<MembershipData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMembership = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/profile/membership', {
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                setMembership(data.data);
                setError(null);
            } else {
                setError(data.message || 'Lỗi khi lấy thông tin thành viên');
            }
        } catch (err) {
            setError('Lỗi kết nối server');
            console.error('Error fetching membership:', err);
        } finally {
            setLoading(false);
        }
    };

    const registerMembership = async (membershipId: number, memberTypeId?: number) => {
        try {
            const response = await fetch('/api/profile/membership', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ membershipId, memberTypeId }),
            });

            const data = await response.json();

            if (data.success) {
                await fetchMembership(); // Refresh membership data
            }

            return { success: data.success, message: data.message };
        } catch (err) {
            console.error('Error registering membership:', err);
            return { success: false, message: 'Lỗi kết nối server' };
        }
    };

    useEffect(() => {
        fetchMembership();
    }, []);

    return {
        membership,
        loading,
        error,
        fetchMembership,
        registerMembership
    };
}
