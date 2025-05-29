'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode';

interface BookingInfo {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  selectedSeats: string[];
  totalPrice: number;
  bookingCode: string;
  movieTitle: string;
  cinemaName: string;
  showtime: string;
  paymentMethod: string;
}

interface QRPaymentFormProps {
  bookingInfo: BookingInfo;
  onBack: () => void;
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
  timeLeft?: number;
  formatTime?: () => string;
}

export default function QRPaymentForm({
  bookingInfo,
  onBack,
  onPaymentSuccess,
  onPaymentCancel,
  timeLeft: globalTimeLeft,
  formatTime: globalFormatTime
}: QRPaymentFormProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [localTimeLeft, setLocalTimeLeft] = useState(300); // Fallback local timer
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | 'expired'>('pending');
  const [isGeneratingQR, setIsGeneratingQR] = useState(true);

  // Use global timer if available, otherwise use local timer
  const timeLeft = globalTimeLeft !== undefined ? globalTimeLeft : localTimeLeft;

  // Generate QR code when component mounts
  useEffect(() => {
    console.log('🎫 QRPaymentForm received booking code:', bookingInfo.bookingCode);
    generateQRCode();
  }, [bookingInfo.bookingCode]);

  // Countdown timer (only for local timer when global timer is not available)
  useEffect(() => {
    if (globalTimeLeft === undefined && localTimeLeft > 0 && paymentStatus === 'pending') {
      const timer = setTimeout(() => setLocalTimeLeft(localTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setPaymentStatus('expired');
    }
  }, [localTimeLeft, paymentStatus, globalTimeLeft, timeLeft]);

  // Simulate payment status checking (in real app, this would poll the server)
  useEffect(() => {
    if (paymentStatus === 'pending') {
      const statusCheck = setInterval(() => {
        // Simulate random payment success for demo (remove in production)
        if (Math.random() > 0.98) { // 2% chance per check
          setPaymentStatus('success');
          clearInterval(statusCheck);
          setTimeout(() => onPaymentSuccess(), 2000);
        }
      }, 3000);

      return () => clearInterval(statusCheck);
    }
  }, [paymentStatus, onPaymentSuccess]);

  const generateQRCode = async () => {
    try {
      setIsGeneratingQR(true);

      // Create payment data for QR code
      const paymentData = {
        amount: bookingInfo.totalPrice,
        description: `Thanh toán vé xem phim - ${bookingInfo.movieTitle}`,
        bookingCode: bookingInfo.bookingCode,
        customerName: bookingInfo.customerName,
        customerPhone: bookingInfo.customerPhone,
        seats: bookingInfo.selectedSeats.join(', '),
        cinema: bookingInfo.cinemaName,
        showtime: bookingInfo.showtime,
        paymentMethod: bookingInfo.paymentMethod
      };

      // Generate QR code URL (in real app, this would be payment gateway URL)
      const qrData = JSON.stringify(paymentData);
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const formatTime = (seconds: number) => {
    // Use global formatTime if available
    if (globalFormatTime) {
      return globalFormatTime();
    }

    // Fallback to local formatTime
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPaymentMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      'momo': 'MoMo',
      'zalopay': 'ZaloPay',
      'vnpay': 'VNPay',
      'banking': 'Internet Banking'
    };
    return methods[method] || method;
  };

  const handleManualSuccess = () => {
    setPaymentStatus('success');
    setTimeout(() => onPaymentSuccess(), 1000);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-white mb-2">Thanh toán thành công!</h2>
        <p className="text-gray-300 mb-4">Đang chuyển hướng...</p>
      </div>
    );
  }

  if (paymentStatus === 'expired') {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <div className="text-red-500 text-6xl mb-4">⏰</div>
        <h2 className="text-2xl font-bold text-white mb-2">Hết thời gian thanh toán</h2>
        <p className="text-gray-300 mb-6">Vui lòng thử lại</p>
        <div className="flex gap-4">
          <Button onClick={onBack} className="flex-1 bg-gray-600 hover:bg-gray-700">
            Quay lại
          </Button>
          <Button onClick={generateQRCode} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black">
            Tạo mã QR mới
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Thanh toán qua {getPaymentMethodName(bookingInfo.paymentMethod)}
        </h2>
        <p className="text-gray-300">Quét mã QR để thanh toán</p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        <div className="bg-white p-4 rounded-lg">
          {isGeneratingQR ? (
            <div className="w-64 h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
          )}
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Số tiền:</span>
            <div className="text-white font-bold text-lg">
              {bookingInfo.totalPrice.toLocaleString('vi-VN')}₫
            </div>
          </div>
          <div>
            <span className="text-gray-400">Mã đặt vé:</span>
            <div className="text-white font-mono">{bookingInfo.bookingCode}</div>
          </div>
          <div>
            <span className="text-gray-400">Phim:</span>
            <div className="text-white">{bookingInfo.movieTitle}</div>
          </div>
          <div>
            <span className="text-gray-400">Ghế:</span>
            <div className="text-white">{bookingInfo.selectedSeats.join(', ')}</div>
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="text-center mb-6">
        <div className="text-yellow-400 text-2xl font-bold mb-2">
          {formatTime(timeLeft)}
        </div>
        <p className="text-gray-400 text-sm">Thời gian còn lại để thanh toán</p>
      </div>

      {/* Status */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-900 text-blue-200">
          <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
          Đang chờ thanh toán...
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={onBack}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
        >
          Quay lại
        </Button>
        <Button
          onClick={onPaymentCancel}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
        >
          Hủy thanh toán
        </Button>
        {/* Demo button - remove in production */}
        <Button
          onClick={handleManualSuccess}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
        >
          Demo: Thành công
        </Button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-900 bg-opacity-50 rounded-lg">
        <h4 className="text-white font-semibold mb-2">Hướng dẫn thanh toán:</h4>
        <ol className="text-sm text-gray-300 space-y-1">
          <li>1. Mở ứng dụng {getPaymentMethodName(bookingInfo.paymentMethod)} trên điện thoại</li>
          <li>2. Chọn "Quét mã QR" hoặc "Thanh toán"</li>
          <li>3. Quét mã QR ở trên</li>
          <li>4. Xác nhận thông tin và hoàn tất thanh toán</li>
        </ol>
      </div>
    </div>
  );
}
