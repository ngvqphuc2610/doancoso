'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';

interface Booking {
  id_booking: number;
  booking_code: string;
  booking_date: string;
  booking_status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  total_amount: number;
  movie_title: string;
  cinema_name: string;
  screen_name: string;
  start_time: string;
  show_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  seats: string[];
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface EditBookingPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBookingPage({ params }: EditBookingPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    booking_status: '' as 'pending' | 'confirmed' | 'cancelled',
    payment_status: '' as 'unpaid' | 'paid' | 'refunded'
  });

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/admin/bookings/${id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch booking');
        }

        const result = await response.json();

        if (result.success) {
          setBooking(result.data);
          setFormData({
            booking_status: result.data.booking_status,
            payment_status: result.data.payment_status
          });
        } else {
          throw new Error(result.error || 'Failed to fetch booking');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleSave = async () => {
    if (!booking) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/bookings/${booking.id_booking}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      const result = await response.json();

      if (result.success) {
        router.push('/admin/bookings');
      } else {
        throw new Error(result.error || 'Failed to update booking');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/bookings');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đặt vé</h3>
          <p className="text-gray-600">Đặt vé với ID {id} không tồn tại.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={handleCancel}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa đặt vé</h1>
            <p className="text-gray-600">Mã đặt vé: {booking.booking_code}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đặt vé</h2>

          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Mã đặt vé:</span>
              <span className="ml-2 text-gray-900">{booking.booking_code}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Ngày đặt:</span>
              <span className="ml-2 text-gray-900">
                {new Date(booking.booking_date).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Phim:</span>
              <span className="ml-2 text-gray-900">{booking.movie_title}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Rạp:</span>
              <span className="ml-2 text-gray-900">{booking.cinema_name} - {booking.screen_name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Lịch chiếu:</span>
              <span className="ml-2 text-gray-900">
                {new Date(booking.show_date).toLocaleDateString('vi-VN')} - {booking.start_time}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Ghế:</span>
              <span className="ml-2 text-gray-900">{booking.seats?.join(', ') || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tổng tiền:</span>
              <span className="ml-2 text-gray-900 font-semibold">
                {booking.total_amount.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h2>

          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Tên:</span>
              <span className="ml-2 text-gray-900">{booking.customer_name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-900">{booking.customer_email}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Điện thoại:</span>
              <span className="ml-2 text-gray-900">{booking.customer_phone}</span>
            </div>
          </div>

          {/* Products */}
          {booking.products && booking.products.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-700 mb-2">Sản phẩm đã đặt:</h3>
              <div className="space-y-2">
                {booking.products.map((product, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{product.name} x{product.quantity}</span>
                    <span>{product.price.toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cập nhật trạng thái</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái đặt vé
              </label>
              <select
                value={formData.booking_status}
                onChange={(e) => setFormData({
                  ...formData,
                  booking_status: e.target.value as 'pending' | 'confirmed' | 'cancelled'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Chờ xử lý</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái thanh toán
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({
                  ...formData,
                  payment_status: e.target.value as 'unpaid' | 'paid' | 'refunded'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="unpaid">Chưa thanh toán</option>
                <option value="paid">Đã thanh toán</option>
                <option value="refunded">Đã hoàn tiền</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
