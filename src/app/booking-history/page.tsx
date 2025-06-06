'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useBookingHistory } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Calendar, MapPin, Clock, Users, Package, CreditCard, Filter } from 'lucide-react';
import Link from 'next/link';

export default function BookingHistoryPage() {
    const { isAuthenticated } = useAuth();
    const { bookings, loading, error, pagination, fetchBookingHistory } = useBookingHistory();
    const [statusFilter, setStatusFilter] = useState('');

    if (!isAuthenticated()) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Vui lòng đăng nhập
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Bạn cần đăng nhập để xem lịch sử đặt vé
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

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        fetchBookingHistory(1, status || undefined);
    };

    const handlePageChange = (page: number) => {
        fetchBookingHistory(page, statusFilter || undefined);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'unpaid':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch sử đặt vé</h1>
                        <p className="text-gray-600">Quản lý và theo dõi các vé đã đặt</p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex items-center space-x-4">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleStatusFilter('')}
                                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                        statusFilter === '' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Tất cả
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('pending')}
                                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                        statusFilter === 'pending' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Chờ xử lý
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('confirmed')}
                                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                        statusFilter === 'confirmed' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Đã xác nhận
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('cancelled')}
                                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                        statusFilter === 'cancelled' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Đã hủy
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Chưa có lịch sử đặt vé
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Bạn chưa đặt vé nào. Hãy khám phá các bộ phim đang chiếu!
                            </p>
                            <Link
                                href="/"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Đặt vé ngay
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Booking List */}
                            <div className="space-y-4">
                                {bookings.map((booking) => (
                                    <div key={booking.id} className="bg-white rounded-lg shadow-sm p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                            {/* Movie Info */}
                                            <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                                                <div className="w-16 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                    {booking.movie.posterImage ? (
                                                        <img
                                                            src={booking.movie.posterImage}
                                                            alt={booking.movie.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                        {booking.movie.title}
                                                    </h3>
                                                    <div className="space-y-1 text-sm text-gray-600">
                                                        <div className="flex items-center">
                                                            <MapPin className="w-4 h-4 mr-1" />
                                                            <span>{booking.cinema.name} - {booking.cinema.screen}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            <span>
                                                                {new Date(booking.showtime.showDate).toLocaleDateString('vi-VN')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Clock className="w-4 h-4 mr-1" />
                                                            <span>{booking.showtime.startTime}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Users className="w-4 h-4 mr-1" />
                                                            <span>Ghế: {booking.seats.join(', ')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Booking Details */}
                                            <div className="text-right">
                                                <div className="mb-2">
                                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                                                        {booking.bookingStatus === 'pending' ? 'Chờ xử lý' :
                                                         booking.bookingStatus === 'confirmed' ? 'Đã xác nhận' :
                                                         booking.bookingStatus === 'cancelled' ? 'Đã hủy' : booking.bookingStatus}
                                                    </span>
                                                </div>
                                                <div className="mb-2">
                                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                                        {booking.paymentStatus === 'paid' ? 'Đã thanh toán' :
                                                         booking.paymentStatus === 'unpaid' ? 'Chưa thanh toán' :
                                                         booking.paymentStatus === 'refunded' ? 'Đã hoàn tiền' : booking.paymentStatus}
                                                    </span>
                                                </div>
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {booking.totalAmount.toLocaleString('vi-VN')}đ
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Mã: {booking.bookingCode}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Products */}
                                        {booking.products.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">Sản phẩm đã đặt:</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {booking.products.map((product, index) => (
                                                        <div key={index} className="flex justify-between text-sm">
                                                            <span className="text-gray-600">
                                                                {product.name} x{product.quantity}  
                                                            </span>
                                                            <span className="text-gray-900">
                                                                {product.totalPrice.toLocaleString('vi-VN')}đ 
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="mt-8 flex justify-center">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={!pagination.hasPrev}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Trước
                                        </button>
                                        
                                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-3 py-2 border rounded-lg text-sm ${
                                                    page === pagination.page
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        
                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={!pagination.hasNext}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
