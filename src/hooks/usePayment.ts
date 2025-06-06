import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

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

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentMethod?: string;
  error?: string;
}

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const { user } = useAuth();
  const { profile } = useProfile();

  const generateBookingCode = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CS${timestamp.slice(-6)}${random}`;
  };

  const generateMoMoPaymentData = (bookingInfo: BookingInfo) => {
    const orderId = bookingInfo.bookingCode;
    const amount = bookingInfo.totalPrice;
    const orderInfo = `Thanh toan ve phim ${bookingInfo.movieTitle}`;

    // In a real implementation, you would use your MoMo merchant credentials
    const partnerCode = 'MOMO_PARTNER_CODE';
    const accessKey = 'MOMO_ACCESS_KEY';
    const secretKey = 'MOMO_SECRET_KEY';
    const requestId = uuidv4();
    const redirectUrl = `${window.location.origin}/payment/momo/callback`;
    const ipnUrl = `${window.location.origin}/api/payment/momo/ipn`;
    const requestType = 'captureWallet';
    const extraData = JSON.stringify({
      movieTitle: bookingInfo.movieTitle,
      cinema: bookingInfo.cinemaName,
      seats: bookingInfo.selectedSeats,
      customerName: bookingInfo.customerName,
      customerPhone: bookingInfo.customerPhone
    });

    // Create signature
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = CryptoJS.HmacSHA256(rawSignature, secretKey).toString();

    return {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi'
    };
  };

  const createMoMoPayment = async (bookingInfo: BookingInfo): Promise<PaymentResult> => {
    setIsProcessing(true);

    try {
      const paymentData = generateMoMoPaymentData(bookingInfo);

      // In a real implementation, you would call MoMo API
      // For demo purposes, we'll simulate the API call
      const response = await fetch('/api/payment/momo/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Failed to create MoMo payment');
      }

      const result = await response.json();

      if (result.resultCode === 0) {
        // Success - redirect to MoMo payment page
        window.location.href = result.payUrl;
        return { success: true, transactionId: result.transId, paymentMethod: 'momo' };
      } else {
        throw new Error(result.message || 'MoMo payment creation failed');
      }
    } catch (error) {
      console.error('MoMo payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo thanh toán MoMo';
      setPaymentResult({ success: false, error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (transactionId: string, paymentMethod: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId, paymentMethod }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  };

  const saveBooking = async (bookingInfo: BookingInfo, paymentInfo: { transactionId: string; paymentMethod: string }): Promise<boolean> => {
    try {
      // Transform BookingInfo to match the actual frontend data structure
      const bookingData = {
        customerInfo: {
          name: bookingInfo.customerName,
          email: bookingInfo.customerEmail,
          phone: bookingInfo.customerPhone,
          agreeToTerms: true,
          agreeToPromotions: false,
          id_users: user?.id || null
        },
        memberInfo: {
          id_member: profile?.member?.id || null // Get member ID from profile
        },
        showtimeId: 14, // TODO: Get actual showtime ID from booking flow
        selectedSeats: bookingInfo.selectedSeats, // Keep as seat names like ["A10"]
        ticketInfo: { "2": 1 }, // TODO: Get actual ticket info
        productInfo: { "6": 1 }, // TODO: Get actual product info
        totalPrice: bookingInfo.totalPrice,
        paymentMethod: paymentInfo.paymentMethod,
        transactionId: paymentInfo.transactionId,
        bookingCode: bookingInfo.bookingCode,
        status: 'confirmed'
      };

      console.log('Sending booking data:', bookingData);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save booking');
      }

      const result = await response.json();
      console.log('Booking saved successfully:', result);
      return true;
    } catch (error) {
      console.error('Save booking error:', error);
      return false;
    }
  };

  const processPayment = async (
    bookingInfo: BookingInfo,
    paymentMethod: string
  ): Promise<PaymentResult> => {
    setIsProcessing(true);
    setPaymentResult(null);

    try {
      let result: PaymentResult;

      switch (paymentMethod) {
        case 'momo':
          result = await createMoMoPayment(bookingInfo);
          break;
        case 'domestic_card':
          // TODO: Implement domestic card payment
          result = { success: false, error: 'Phương thức thanh toán chưa được hỗ trợ' };
          break;
        case 'international_card':
          // TODO: Implement international card payment
          result = { success: false, error: 'Phương thức thanh toán chưa được hỗ trợ' };
          break;
        default:
          result = { success: false, error: 'Phương thức thanh toán không hợp lệ' };
      }

      setPaymentResult(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thanh toán';
      const result = { success: false, error: errorMessage };
      setPaymentResult(result);
      return result;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    paymentResult,
    generateBookingCode,
    processPayment,
    verifyPayment,
    saveBooking,
    createMoMoPayment
  };
};
