'use client';

import { useState } from 'react';
import PaymentMethodSelector from './PaymentMethodSelector';
import { usePayment } from '@/hooks/usePayment';

export default function PaymentExample() {
  const { generateBookingCode } = usePayment();
  const [showPayment, setShowPayment] = useState(false);

  // Example booking data
  const exampleBookingInfo = {
    movieTitle: 'Spider-Man: No Way Home',
    cinemaName: 'CGV Vincom Center',
    screenName: 'Phòng 1',
    selectedSeats: ['A1', 'A2'],
    totalPrice: 180000,
    customerName: 'Nguyễn Văn A',
    customerPhone: '0123456789',
    customerEmail: 'nguyenvana@email.com',
    bookingCode: generateBookingCode()
  };

  const handlePaymentSuccess = (paymentMethod: string, transactionId: string) => {
    console.log('Payment success:', { paymentMethod, transactionId });
    alert(`Thanh toán thành công!\nPhương thức: ${paymentMethod}\nMã giao dịch: ${transactionId}`);
    setShowPayment(false);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert(`Lỗi thanh toán: ${error}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Demo Thanh Toán MoMo</h1>

      {!showPayment ? (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Thông tin đặt vé mẫu</h2>
          <div className="space-y-2 text-sm mb-6">
            <p><strong>Phim:</strong> {exampleBookingInfo.movieTitle}</p>
            <p><strong>Rạp:</strong> {exampleBookingInfo.cinemaName}</p>
            <p><strong>Phòng:</strong> {exampleBookingInfo.screenName}</p>
            <p><strong>Ghế:</strong> {exampleBookingInfo.selectedSeats.join(', ')}</p>
            <p><strong>Khách hàng:</strong> {exampleBookingInfo.customerName}</p>
            <p><strong>SĐT:</strong> {exampleBookingInfo.customerPhone}</p>
            <p><strong>Mã đặt vé:</strong> {exampleBookingInfo.bookingCode}</p>
            <p><strong>Tổng tiền:</strong> {exampleBookingInfo.totalPrice.toLocaleString('vi-VN')}₫</p>
          </div>

          <button
            onClick={() => setShowPayment(true)}
            className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
          >
            Tiến hành thanh toán
          </button>
        </div>
      ) : (
        <PaymentMethodSelector
          bookingInfo={exampleBookingInfo}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
    </div>
  );
}
