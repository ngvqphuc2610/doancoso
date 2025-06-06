'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Clock,
  Users,
  Package,
  Download,
  RefreshCw
} from 'lucide-react';

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



interface SearchFilters {
  query: string;
  status: string;
  paymentStatus: string;
  dateFrom: string;
  dateTo: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: '',
    paymentStatus: '',
    dateFrom: '',
    dateTo: ''
  });

  const [selectedBookings, setSelectedBookings] = useState<number[]>([]);

  // Fetch bookings from API
  const fetchBookings = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.query && { search: filters.query }),
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      });

      const response = await fetch(`/api/admin/bookings?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();

      if (data.success) {
        setBookings(data.data || []);
        setPagination(prev => ({
          ...prev,
          page: data.pagination?.page || 1,
          totalPages: data.pagination?.totalPages || 1,
          total: data.pagination?.total || 0
        }));
      } else {
        throw new Error(data.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };



  // Delete booking
  const deleteBooking = async (bookingId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đặt vé này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }

      const result = await response.json();
      if (result.success) {
        fetchBookings(pagination.page);
      } else {
        throw new Error(result.error || 'Failed to delete booking');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete booking');
    }
  };

  // Bulk operations
  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedBookings.length === 0) {
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn cập nhật trạng thái ${selectedBookings.length} đặt vé?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingIds: selectedBookings,
          booking_status: status
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bookings');
      }

      const result = await response.json();
      if (result.success) {
        fetchBookings(pagination.page);
        setSelectedBookings([]);
      } else {
        throw new Error(result.error || 'Failed to update bookings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bookings');
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedBookings.length === 0) {
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedBookings.length} đặt vé? Hành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingIds: selectedBookings
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete bookings');
      }

      const result = await response.json();
      if (result.success) {
        fetchBookings(pagination.page);
        setSelectedBookings([]);
      } else {
        throw new Error(result.error || 'Failed to delete bookings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bookings');
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    fetchBookings(1);
  };

  const handleReset = () => {
    setFilters({
      query: '',
      status: '',
      paymentStatus: '',
      dateFrom: '',
      dateTo: ''
    });
    setTimeout(() => fetchBookings(1), 100);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Mã đặt vé',
      'Khách hàng',
      'Email',
      'Điện thoại',
      'Phim',
      'Rạp',
      'Ngày chiếu',
      'Giờ chiếu',
      'Ghế',
      'Tổng tiền',
      'Trạng thái đặt vé',
      'Trạng thái thanh toán',
      'Ngày đặt'
    ];

    const csvContent = [
      headers.join(','),
      ...bookings.map(booking => [
        booking.booking_code,
        booking.customer_name,
        booking.customer_email,
        booking.customer_phone,
        booking.movie_title,
        `${booking.cinema_name} - ${booking.screen_name}`,
        booking.show_date,
        booking.start_time,
        booking.seats?.join('; ') || '',
        booking.total_amount,
        booking.booking_status,
        booking.payment_status,
        new Date(booking.booking_date).toLocaleDateString('vi-VN')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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
    <div className="p-6 text-dark">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý đặt vé</h1>
        <p className="text-gray-600">Quản lý tất cả đặt vé trong hệ thống</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm theo mã đặt vé, tên khách hàng, email, phone, phim..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả thanh toán</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date To */}
          <div>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Search className="w-4 h-4 mr-2" />
            Tìm kiếm
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Đặt lại
          </button>
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất CSV
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedBookings.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              Đã chọn {selectedBookings.length} đặt vé
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkStatusUpdate('confirmed')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Xác nhận
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('cancelled')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Hủy
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-red-800 text-white px-3 py-1 rounded text-sm hover:bg-red-900"
              >
                Xóa
              </button>
              <button
                onClick={() => setSelectedBookings([])}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Table/List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đặt vé nào</h3>
          <p className="text-gray-600">Không tìm thấy đặt vé phù hợp với bộ lọc hiện tại.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBookings(bookings.map(b => b.id_booking));
                        } else {
                          setSelectedBookings([]);
                        }
                      }}
                      checked={selectedBookings.length === bookings.length && bookings.length > 0}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Mã đặt vé</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Phim</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Lịch chiếu</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Ghế</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Tổng tiền</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id_booking} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedBookings.includes(booking.id_booking)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBookings([...selectedBookings, booking.id_booking]);
                          } else {
                            setSelectedBookings(selectedBookings.filter(id => id !== booking.id_booking));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{booking.booking_code}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(booking.booking_date).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{booking.customer_name}</div>
                      <div className="text-xs text-gray-500">{booking.customer_email}</div>
                      <div className="text-xs text-gray-500">{booking.customer_phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{booking.movie_title}</div>
                      <div className="text-xs text-gray-500">
                        {booking.cinema_name} - {booking.screen_name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.show_date).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-xs text-gray-500">{booking.start_time}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {booking.seats?.join(', ') || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.total_amount.toLocaleString('vi-VN')}đ
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.booking_status)}`}>
                          {booking.booking_status === 'pending' ? 'Chờ xử lý' :
                            booking.booking_status === 'confirmed' ? 'Đã xác nhận' :
                              booking.booking_status === 'cancelled' ? 'Đã hủy' : booking.booking_status}
                        </span>
                        <br />
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
                          {booking.payment_status === 'paid' ? 'Đã thanh toán' :
                            booking.payment_status === 'unpaid' ? 'Chưa thanh toán' :
                              booking.payment_status === 'refunded' ? 'Đã hoàn tiền' : booking.payment_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => window.location.href = `/admin/bookings/edit/${booking.id_booking}`}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBooking(booking.id_booking)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4 p-4">
            {bookings.map((booking) => (
              <div key={booking.id_booking} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedBookings.includes(booking.id_booking)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBookings([...selectedBookings, booking.id_booking]);
                        } else {
                          setSelectedBookings(selectedBookings.filter(id => id !== booking.id_booking));
                        }
                      }}
                      className="rounded border-gray-300 mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{booking.booking_code}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(booking.booking_date).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => window.location.href = `/admin/bookings/edit/${booking.id_booking}`}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteBooking(booking.id_booking)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Khách hàng:</span> {booking.customer_name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {booking.customer_email}
                  </div>
                  <div>
                    <span className="font-medium">Điện thoại:</span> {booking.customer_phone}
                  </div>
                  <div>
                    <span className="font-medium">Phim:</span> {booking.movie_title}
                  </div>
                  <div>
                    <span className="font-medium">Rạp:</span> {booking.cinema_name} - {booking.screen_name}
                  </div>
                  <div>
                    <span className="font-medium">Lịch chiếu:</span> {new Date(booking.show_date).toLocaleDateString('vi-VN')} - {booking.start_time}
                  </div>
                  <div>
                    <span className="font-medium">Ghế:</span> {booking.seats?.join(', ') || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Tổng tiền:</span> {booking.total_amount.toLocaleString('vi-VN')}đ
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.booking_status)}`}>
                      {booking.booking_status === 'pending' ? 'Chờ xử lý' :
                        booking.booking_status === 'confirmed' ? 'Đã xác nhận' :
                          booking.booking_status === 'cancelled' ? 'Đã hủy' : booking.booking_status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
                      {booking.payment_status === 'paid' ? 'Đã thanh toán' :
                        booking.payment_status === 'unpaid' ? 'Chưa thanh toán' :
                          booking.payment_status === 'refunded' ? 'Đã hoàn tiền' : booking.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => fetchBookings(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>

            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
              return (
                <button
                  key={page}
                  onClick={() => fetchBookings(page)}
                  className={`px-3 py-2 border rounded-lg text-sm ${page === pagination.page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => fetchBookings(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Hiển thị {bookings.length} trong tổng số {pagination.total} đặt vé
      </div>
    </div>
  );
}
