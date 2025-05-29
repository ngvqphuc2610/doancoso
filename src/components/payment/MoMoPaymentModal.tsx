'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode';
import { usePayment } from '@/hooks/usePayment';

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

interface MoMoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingInfo: BookingInfo;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentError: (error: string) => void;
}

export default function MoMoPaymentModal({
  isOpen,
  onClose,
  bookingInfo,
  onPaymentSuccess,
  onPaymentError
}: MoMoPaymentModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | 'expired'>('pending');
  const { saveBooking } = usePayment();

  // Generate QR Code when modal opens
  useEffect(() => {
    if (isOpen) {
      generateQRCode();
      setTimeLeft(600);
      setPaymentStatus('pending');
      startPaymentStatusCheck();
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPaymentStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  const generateQRCode = async () => {
    try {
      // Create payment data for QR code
      const paymentData = {
        merchantId: 'CINESTAR_CINEMA',
        orderId: bookingInfo.bookingCode,
        amount: bookingInfo.totalPrice,
        orderInfo: `Thanh toan ve phim ${bookingInfo.movieTitle}`,
        customerName: bookingInfo.customerName,
        customerPhone: bookingInfo.customerPhone,
        movieTitle: bookingInfo.movieTitle,
        cinema: bookingInfo.cinemaName,
        seats: bookingInfo.selectedSeats.join(', '),
        showtime: new Date().toLocaleString('vi-VN')
      };

      // Convert to JSON string for QR code
      const qrData = JSON.stringify(paymentData);

      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      onPaymentError('Không thể tạo mã QR thanh toán');
    }
  };

  const startPaymentStatusCheck = () => {
    // Simulate payment status checking
    // In real implementation, this would poll your backend API
    const checkInterval = setInterval(async () => {
      // Simulate random payment success for demo
      if (Math.random() > 0.95 && paymentStatus === 'pending') {
        setIsProcessing(true);
        setPaymentStatus('success');
        clearInterval(checkInterval);

        const transactionId = `MOMO_${Date.now()}`;

        // Save booking to database
        try {
          const bookingSaved = await saveBooking(bookingInfo, {
            transactionId,
            paymentMethod: 'momo'
          });

          if (bookingSaved) {
            console.log('Booking saved successfully');
            onPaymentSuccess(transactionId);
          } else {
            throw new Error('Failed to save booking');
          }
        } catch (error) {
          console.error('Error saving booking:', error);
          setPaymentStatus('failed');
          onPaymentError('Lỗi lưu thông tin đặt vé. Vui lòng liên hệ hỗ trợ.');
        } finally {
          setIsProcessing(false);
        }
      }
    }, 2000);

    // Clear interval when component unmounts or modal closes
    setTimeout(() => clearInterval(checkInterval), 600000); // 10 minutes
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    setTimeLeft(600);
    setPaymentStatus('pending');
    generateQRCode();
    startPaymentStatusCheck();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-pink-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-pink-600 font-bold text-lg">mo</span>
            </div>
            <h2 className="text-xl font-bold">Cổng thanh toán MoMo</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left side - Order Info */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin đơn hàng</h3>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <div>
                  <p className="font-bold text-gray-800">CINESTAR CINEMA</p>
                  <p className="text-sm text-gray-600">Nhà cung cấp</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng</span>
                <span className="font-mono font-bold">{bookingInfo.bookingCode}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Mô tả</span>
                <span className="text-right">Thanh Toán Vé Phim {bookingInfo.movieTitle}</span>
              </div>

              <div className="border-t pt-3">
                <p className="font-semibold text-gray-800 mb-2">Chi tiết vé:</p>
                <div className="space-y-1 text-xs">
                  <p><strong>Phim:</strong> {bookingInfo.movieTitle}</p>
                  <p><strong>Rạp:</strong> {bookingInfo.cinemaName}</p>
                  <p><strong>Phòng:</strong> {bookingInfo.screenName}</p>
                  <p><strong>Ghế:</strong> {bookingInfo.selectedSeats.join(', ')}</p>
                  <p><strong>Khách hàng:</strong> {bookingInfo.customerName}</p>
                  <p><strong>SĐT:</strong> {bookingInfo.customerPhone}</p>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Số tiền</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {bookingInfo.totalPrice.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="mt-6 p-4 bg-pink-50 rounded-lg">
              <p className="text-sm text-pink-600 mb-2">Đơn hàng sẽ hết hạn sau:</p>
              <div className="flex space-x-4">
                <div className="text-center">
                  <div className="bg-pink-600 text-white px-3 py-2 rounded text-lg font-bold">
                    {Math.floor(timeLeft / 60).toString().padStart(2, '0')}
                  </div>
                  <p className="text-xs text-pink-600 mt-1">Phút</p>
                </div>
                <div className="text-center">
                  <div className="bg-pink-600 text-white px-3 py-2 rounded text-lg font-bold">
                    {(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  <p className="text-xs text-pink-600 mt-1">Giây</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - QR Code */}
          <div className="bg-pink-600 rounded-lg p-6 text-white text-center">
            <h3 className="text-xl font-bold mb-4">Quét mã QR để thanh toán</h3>

            {paymentStatus === 'pending' && (
              <>
                <div className="bg-white rounded-lg p-4 mb-4 inline-block">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-500">Đang tạo mã QR...</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <p className="flex items-center justify-center">
                    <span className="mr-2">📱</span>
                    Sử dụng <strong>App MoMo</strong> hoặc ứng dụng camera hỗ trợ QR code để quét mã
                  </p>
                  <p className="text-pink-200">
                    Gặp khó khăn khi thanh toán? <button className="underline">Xem hướng dẫn</button>
                  </p>
                </div>
              </>
            )}

            {paymentStatus === 'success' && (
              <div className="text-center">
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                    <h3 className="text-xl font-bold mb-2">Đang xử lý...</h3>
                    <p>Đang lưu thông tin đặt vé</p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-bold mb-2">Thanh toán thành công!</h3>
                    <p>Vé của bạn đã được đặt thành công</p>
                  </>
                )}
              </div>
            )}

            {paymentStatus === 'expired' && (
              <div className="text-center">
                <div className="text-6xl mb-4">⏰</div>
                <h3 className="text-xl font-bold mb-2">Hết thời gian thanh toán</h3>
                <p className="mb-4">Vui lòng thử lại</p>
                <Button
                  onClick={handleRetry}
                  className="bg-white text-pink-600 hover:bg-gray-100"
                >
                  Thử lại
                </Button>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="text-center">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-xl font-bold mb-2">Thanh toán thất bại</h3>
                <p className="mb-4">Vui lòng thử lại</p>
                <Button
                  onClick={handleRetry}
                  className="bg-white text-pink-600 hover:bg-gray-100"
                >
                  Thử lại
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 rounded-b-lg">
          <Button
            onClick={onClose}
            variant="custom8"
            className="w-full"
          >
            Quay về
          </Button>
        </div>
      </div>
    </div>
  );
}
