'use client';

import { useState } from 'react';
import QRPaymentForm from '@/components/checkout/QRPaymentForm';
import { usePayment } from '@/hooks/usePayment';

export default function TestQRPaymentPage() {
  const [showQRForm, setShowQRForm] = useState(false);
  const { generateBookingCode } = usePayment();

  const mockBookingInfo = {
    customerName: 'Nguyễn Vũ Quang Phúc',
    customerEmail: 'nguyenvqphuc1234@gmail.com',
    customerPhone: '0393102373',
    selectedSeats: ['A10', 'A11'],
    totalPrice: 180000,
    bookingCode: generateBookingCode(),
    movieTitle: 'Avengers: Endgame',
    cinemaName: 'CGV Vincom Center',
    showtime: '19:30 - 22:00, 15/12/2024',
    paymentMethod: 'momo'
  };

  const handlePaymentSuccess = () => {
    alert('Thanh toán thành công! Chuyển hướng đến trang xác nhận...');
    setShowQRForm(false);
  };

  const handlePaymentCancel = () => {
    if (confirm('Bạn có chắc muốn hủy thanh toán?')) {
      setShowQRForm(false);
    }
  };

  const handleBack = () => {
    setShowQRForm(false);
  };

  if (showQRForm) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <QRPaymentForm
            bookingInfo={mockBookingInfo}
            onBack={handleBack}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-gray-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Test QR Payment Form</h1>
          
          {/* Mock booking info display */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-4">Thông tin đặt vé:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Phim:</span>
                <div className="text-white">{mockBookingInfo.movieTitle}</div>
              </div>
              <div>
                <span className="text-gray-400">Rạp:</span>
                <div className="text-white">{mockBookingInfo.cinemaName}</div>
              </div>
              <div>
                <span className="text-gray-400">Suất chiếu:</span>
                <div className="text-white">{mockBookingInfo.showtime}</div>
              </div>
              <div>
                <span className="text-gray-400">Ghế:</span>
                <div className="text-white">{mockBookingInfo.selectedSeats.join(', ')}</div>
              </div>
              <div>
                <span className="text-gray-400">Khách hàng:</span>
                <div className="text-white">{mockBookingInfo.customerName}</div>
              </div>
              <div>
                <span className="text-gray-400">Tổng tiền:</span>
                <div className="text-white font-bold text-lg">
                  {mockBookingInfo.totalPrice.toLocaleString('vi-VN')}₫
                </div>
              </div>
            </div>
          </div>

          {/* Payment method selection */}
          <div className="space-y-4 mb-6">
            <h3 className="text-white font-semibold">Chọn phương thức thanh toán:</h3>
            
            <button
              onClick={() => setShowQRForm(true)}
              className="w-full p-4 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-medium transition-colors"
            >
              💳 Thanh toán MoMo (QR Code)
            </button>
            
            <button
              onClick={() => {
                const newBookingInfo = { ...mockBookingInfo, paymentMethod: 'zalopay' };
                setShowQRForm(true);
              }}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              💰 Thanh toán ZaloPay (QR Code)
            </button>
            
            <button
              onClick={() => {
                const newBookingInfo = { ...mockBookingInfo, paymentMethod: 'vnpay' };
                setShowQRForm(true);
              }}
              className="w-full p-4 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
            >
              🏦 Thanh toán VNPay (QR Code)
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Hướng dẫn test:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Click vào phương thức thanh toán để xem form QR</li>
              <li>• QR code sẽ được tạo tự động</li>
              <li>• Có countdown timer 5 phút</li>
              <li>• Có button "Demo: Thành công" để test flow</li>
              <li>• Có simulation tự động thanh toán thành công (2% chance mỗi 3s)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
