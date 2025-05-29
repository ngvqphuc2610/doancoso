'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import MoMoPaymentModal from './MoMoPaymentModal';
import { usePaymentMethods, getPaymentMethodColor, validatePaymentAmount } from '@/hooks/usePaymentMethods';

interface BookingInfo {
  movieTitle: string;
  cinemaName: string;
  screenName: string;
  selectedSeats: string[];
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bookingCode: string;
}

interface PaymentMethodSelectorProps {
  bookingInfo: BookingInfo;
  onPaymentSuccess: (paymentMethod: string, transactionId: string) => void;
  onPaymentError: (error: string) => void;
}

export default function PaymentMethodSelector({
  bookingInfo,
  onPaymentSuccess,
  onPaymentError
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showMoMoModal, setShowMoMoModal] = useState(false);
  const { paymentMethods, loading, error } = usePaymentMethods();

  const handleMethodSelect = (methodCode: string) => {
    setSelectedMethod(methodCode);
  };

  const handleProceedPayment = () => {
    if (!selectedMethod) return;

    // Validate payment amount
    const selectedPaymentMethod = paymentMethods.find(m => m.method_code === selectedMethod);
    if (selectedPaymentMethod) {
      const validation = validatePaymentAmount(bookingInfo.totalPrice, selectedPaymentMethod);
      if (!validation.isValid) {
        onPaymentError(validation.error || 'Số tiền không hợp lệ');
        return;
      }
    }

    switch (selectedMethod) {
      case 'momo':
        setShowMoMoModal(true);
        break;
      case 'domestic_card':
        // TODO: Implement domestic card payment
        alert('Tính năng thanh toán thẻ nội địa đang được phát triển');
        break;
      case 'international_card':
        // TODO: Implement international card payment
        alert('Tính năng thanh toán thẻ quốc tế đang được phát triển');
        break;
      case 'bank_transfer':
        // TODO: Implement bank transfer payment
        alert('Tính năng chuyển khoản ngân hàng đang được phát triển');
        break;
      case 'cash':
        // TODO: Implement cash payment
        alert('Tính năng thanh toán tại quầy đang được phát triển');
        break;
      default:
        alert('Phương thức thanh toán không được hỗ trợ');
    }
  };

  const handleMoMoPaymentSuccess = (transactionId: string) => {
    setShowMoMoModal(false);
    onPaymentSuccess('momo', transactionId);
  };

  const handleMoMoPaymentError = (error: string) => {
    setShowMoMoModal(false);
    onPaymentError(error);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải phương thức thanh toán...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && paymentMethods.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Chọn phương thức thanh toán</h2>
        <p className="text-gray-600">Vui lòng chọn phương thức thanh toán phù hợp</p>
        {error && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            ⚠️ {error} (Đang sử dụng dữ liệu dự phòng)
          </div>
        )}
      </div>

      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Thông tin đặt vé</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Phim:</strong> {bookingInfo.movieTitle}</p>
            <p><strong>Rạp:</strong> {bookingInfo.cinemaName}</p>
            <p><strong>Phòng:</strong> {bookingInfo.screenName}</p>
          </div>
          <div>
            <p><strong>Ghế:</strong> {bookingInfo.selectedSeats.join(', ')}</p>
            <p><strong>Khách hàng:</strong> {bookingInfo.customerName}</p>
            <p><strong>Mã đặt vé:</strong> {bookingInfo.bookingCode}</p>
          </div>
        </div>
        <div className="border-t mt-3 pt-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Tổng tiền:</span>
            <span className="text-xl font-bold text-red-600">
              {bookingInfo.totalPrice.toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-3 mb-6">
        {paymentMethods.map((method) => (
          <div
            key={method.id_payment_method}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedMethod === method.method_code
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
            onClick={() => handleMethodSelect(method.method_code)}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${getPaymentMethodColor(method.method_code)} rounded-lg flex items-center justify-center text-2xl`}>
                {method.icon_url}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{method.method_name}</h3>
                <p className="text-sm text-gray-600">{method.description}</p>
                {method.processing_fee > 0 && (
                  <p className="text-xs text-orange-600">
                    Phí xử lý: {method.processing_fee.toLocaleString('vi-VN')}₫
                  </p>
                )}
                {method.min_amount > 0 && (
                  <p className="text-xs text-gray-500">
                    Tối thiểu: {method.min_amount.toLocaleString('vi-VN')}₫
                    {method.max_amount && ` - Tối đa: ${method.max_amount.toLocaleString('vi-VN')}₫`}
                  </p>
                )}
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedMethod === method.method_code}
                  onChange={() => handleMethodSelect(method.method_code)}
                  className="w-5 h-5 text-blue-600"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Proceed Button */}
      <Button
        onClick={handleProceedPayment}
        disabled={!selectedMethod}
        className="w-full py-3 text-lg font-semibold"
      >
        {selectedMethod ? `Thanh toán với ${paymentMethods.find(m => m.method_code === selectedMethod)?.method_name}` : 'Chọn phương thức thanh toán'}
      </Button>

      {/* MoMo Payment Modal */}
      <MoMoPaymentModal
        isOpen={showMoMoModal}
        onClose={() => setShowMoMoModal(false)}
        bookingInfo={bookingInfo}
        onPaymentSuccess={handleMoMoPaymentSuccess}
        onPaymentError={handleMoMoPaymentError}
      />
    </div>
  );
}
