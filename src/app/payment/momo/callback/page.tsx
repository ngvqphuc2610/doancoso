'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function MoMoCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get parameters from URL
        const partnerCode = searchParams.get('partnerCode');
        const orderId = searchParams.get('orderId');
        const requestId = searchParams.get('requestId');
        const amount = searchParams.get('amount');
        const orderInfo = searchParams.get('orderInfo');
        const orderType = searchParams.get('orderType');
        const transId = searchParams.get('transId');
        const resultCode = searchParams.get('resultCode');
        const message = searchParams.get('message');
        const payType = searchParams.get('payType');
        const responseTime = searchParams.get('responseTime');
        const extraData = searchParams.get('extraData');
        const signature = searchParams.get('signature');

        if (!orderId || !resultCode) {
          setPaymentStatus('failed');
          return;
        }

        // Verify payment with backend
        const verifyResponse = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            partnerCode,
            orderId,
            requestId,
            amount,
            orderInfo,
            orderType,
            transId,
            resultCode: parseInt(resultCode),
            message,
            payType,
            responseTime,
            extraData,
            signature
          }),
        });

        const verifyResult = await verifyResponse.json();

        if (parseInt(resultCode) === 0 && verifyResult.success) {
          setPaymentStatus('success');
          setPaymentInfo({
            orderId,
            transId,
            amount,
            orderInfo
          });
        } else {
          setPaymentStatus('failed');
        }

      } catch (error) {
        console.error('Payment callback processing error:', error);
        setPaymentStatus('failed');
      }
    };

    processCallback();
  }, [searchParams]);

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleViewBooking = () => {
    if (paymentInfo?.orderId) {
      router.push(`/bookings/${paymentInfo.orderId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        {paymentStatus === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Đang xử lý thanh toán</h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
          </>
        )}

        {paymentStatus === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-4">
              Cảm ơn bạn đã đặt vé. Thông tin vé đã được gửi đến email của bạn.
            </p>
            
            {paymentInfo && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-2">Thông tin thanh toán:</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Mã đơn hàng:</strong> {paymentInfo.orderId}</p>
                  <p><strong>Mã giao dịch:</strong> {paymentInfo.transId}</p>
                  <p><strong>Số tiền:</strong> {parseInt(paymentInfo.amount).toLocaleString('vi-VN')}₫</p>
                  <p><strong>Mô tả:</strong> {paymentInfo.orderInfo}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleViewBooking}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                Xem thông tin vé
              </Button>
              <Button
                onClick={handleBackToHome}
                variant="custom8"
                className="w-full"
              >
                Về trang chủ
              </Button>
            </div>
          </>
        )}

        {paymentStatus === 'failed' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-600 mb-6">
              Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => router.back()}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                Thử lại
              </Button>
              <Button
                onClick={handleBackToHome}
                variant="custom8"
                className="w-full"
              >
                Về trang chủ
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
