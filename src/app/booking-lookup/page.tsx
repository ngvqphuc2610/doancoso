'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

export default function BookingLookupPage() {
    const [bookingCode, setBookingCode] = useState('');
    const [bookingData, setBookingData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLookup = async () => {
        if (!bookingCode.trim()) {
            setError('Vui lòng nhập mã đặt vé');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const response = await fetch(`/api/bookings?bookingCode=${encodeURIComponent(bookingCode.trim())}`);
            const result = await response.json();

            if (result.success) {
                setBookingData(result.booking);
            } else {
                setError(result.error || 'Không tìm thấy thông tin đặt vé');
                setBookingData(null);
            }
        } catch (error) {
            console.error('Lookup error:', error);
            setError('Có lỗi xảy ra khi tra cứu. Vui lòng thử lại.');
            setBookingData(null);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'text-green-400';
            case 'pending': return 'text-yellow-400';
            case 'cancelled': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Đã xác nhận';
            case 'pending': return 'Đang xử lý';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    return (
        <Layout>
            <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 py-8">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-4">TRA CỨU ĐẶT VÉ</h1>
                        <p className="text-gray-300">Nhập mã đặt vé để xem thông tin chi tiết</p>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        {/* Search Form */}
                        <div className="bg-gray-800 rounded-lg p-6 mb-8">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={bookingCode}
                                    onChange={(e) => setBookingCode(e.target.value)}
                                    placeholder="Nhập mã đặt vé (ví dụ: BK123ABC)"
                                    className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
                                    onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
                                />
                                <Button
                                    onClick={handleLookup}
                                    disabled={loading}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3"
                                >
                                    {loading ? 'Đang tìm...' : 'TRA CỨU'}
                                </Button>
                            </div>
                            {error && (
                                <p className="text-red-400 mt-2 text-sm">{error}</p>
                            )}
                        </div>

                        {/* Booking Details */}
                        {bookingData && (
                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-white">Thông tin đặt vé</h2>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(bookingData.booking_status)}`}>
                                        {getStatusText(bookingData.booking_status)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Booking Info */}
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-yellow-400 mb-3">Thông tin đặt vé</h3>
                                        <div className="space-y-2 text-sm">
                                            <p><strong className="text-white">Mã đặt vé:</strong> <span className="text-yellow-400 font-mono">{bookingData.booking_code}</span></p>
                                            <p><strong className="text-white">Ngày đặt:</strong> <span className="text-gray-300">{formatDate(bookingData.booking_date)}</span></p>
                                            <p><strong className="text-white">Tổng tiền:</strong> <span className="text-green-400">{parseFloat(bookingData.total_amount).toLocaleString('vi-VN')}₫</span></p>
                                            <p><strong className="text-white">Trạng thái thanh toán:</strong> <span className={getStatusColor(bookingData.payment_status)}>{getStatusText(bookingData.payment_status)}</span></p>
                                        </div>
                                    </div>

                                    {/* Movie Info */}
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-yellow-400 mb-3">Thông tin phim</h3>
                                        <div className="space-y-2 text-sm">
                                            <p><strong className="text-white">Phim:</strong> <span className="text-gray-300">{bookingData.movie_title}</span></p>
                                            <p><strong className="text-white">Rạp:</strong> <span className="text-gray-300">{bookingData.cinema_name}</span></p>
                                            <p><strong className="text-white">Địa chỉ:</strong> <span className="text-gray-300">{bookingData.cinema_address}</span></p>
                                            <p><strong className="text-white">Phòng chiếu:</strong> <span className="text-gray-300">{bookingData.screen_name}</span></p>
                                            <p><strong className="text-white">Ngày chiếu:</strong> <span className="text-gray-300">{new Date(bookingData.show_date).toLocaleDateString('vi-VN')}</span></p>
                                            <p><strong className="text-white">Giờ chiếu:</strong> <span className="text-gray-300">{bookingData.start_time}</span></p>
                                            <p><strong className="text-white">Định dạng:</strong> <span className="text-gray-300">{bookingData.format}</span></p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tickets */}
                                {bookingData.tickets && bookingData.tickets.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-bold text-yellow-400 mb-3">Thông tin vé</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {bookingData.tickets.map((ticket: any, index: number) => (
                                                <div key={index} className="bg-gray-700 rounded-lg p-4">
                                                    <div className="text-sm space-y-1">
                                                        <p><strong className="text-white">Mã vé:</strong> <span className="text-yellow-400 font-mono">{ticket.ticket_code}</span></p>
                                                        <p><strong className="text-white">Ghế:</strong> <span className="text-gray-300">{ticket.seat_row}{ticket.seat_number}</span></p>
                                                        <p><strong className="text-white">Loại vé:</strong> <span className="text-gray-300">{ticket.ticket_type}</span></p>
                                                        <p><strong className="text-white">Giá:</strong> <span className="text-green-400">{parseFloat(ticket.price).toLocaleString('vi-VN')}₫</span></p>
                                                        <p><strong className="text-white">Trạng thái:</strong> <span className={getStatusColor(ticket.status)}>{getStatusText(ticket.status)}</span></p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Products */}
                                {bookingData.products && bookingData.products.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-bold text-yellow-400 mb-3">Bắp nước</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {bookingData.products.map((product: any, index: number) => (
                                                <div key={index} className="bg-gray-700 rounded-lg p-4">
                                                    <div className="text-sm space-y-1">
                                                        <p><strong className="text-white">Sản phẩm:</strong> <span className="text-gray-300">{product.product_name}</span></p>
                                                        <p><strong className="text-white">Số lượng:</strong> <span className="text-gray-300">{product.quantity}</span></p>
                                                        <p><strong className="text-white">Giá:</strong> <span className="text-green-400">{parseFloat(product.price).toLocaleString('vi-VN')}₫</span></p>
                                                        <p><strong className="text-white">Trạng thái:</strong> <span className={getStatusColor(product.order_status)}>{getStatusText(product.order_status)}</span></p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Payment Info */}
                                {bookingData.payment && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-bold text-yellow-400 mb-3">Thông tin thanh toán</h3>
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <div className="text-sm space-y-2">
                                                <p><strong className="text-white">Phương thức:</strong> <span className="text-gray-300">{bookingData.payment.payment_method}</span></p>
                                                <p><strong className="text-white">Mã giao dịch:</strong> <span className="text-yellow-400 font-mono">{bookingData.payment.transaction_id}</span></p>
                                                <p><strong className="text-white">Ngày thanh toán:</strong> <span className="text-gray-300">{formatDate(bookingData.payment.payment_date)}</span></p>
                                                <p><strong className="text-white">Số tiền:</strong> <span className="text-green-400">{parseFloat(bookingData.payment.amount).toLocaleString('vi-VN')}₫</span></p>
                                                <p><strong className="text-white">Trạng thái:</strong> <span className={getStatusColor(bookingData.payment.status)}>{getStatusText(bookingData.payment.status)}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 text-center">
                                    <Button
                                        onClick={() => window.location.href = '/'}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3"
                                    >
                                        VỀ TRANG CHỦ
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </Layout>
    );
}
