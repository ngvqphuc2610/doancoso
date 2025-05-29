'use client';

import { useState, useEffect } from 'react';
import { useGlobalTimer } from '@/contexts/GlobalTimerContext';
import { useAuth } from '@/contexts/AuthContext';
import CheckoutHeader from './CheckoutHeader';
import CustomerInfoForm from './CustomerInfoForm';
import PaymentMethodForm from './PaymentMethodForm';
import QRPaymentForm from './QRPaymentForm';
import BookingSuccess from './BookingSuccess';
import BookingSummary from './BookingSummary';
import { usePayment } from '@/hooks/usePayment';

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  agreeToTerms: boolean;
  agreeToPromotions: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  processingFee?: number;
}

interface CheckoutContainerProps {
  searchParams: {
    showtime: string;
    cinemaName: string;
    screenName: string;
    totalPrice?: string;
    seats?: string;
    movieTitle?: string;
    [key: string]: string | undefined;
  };
}

export default function CheckoutContainer({ searchParams }: CheckoutContainerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    agreeToTerms: false,
    agreeToPromotions: false
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [bookingCode, setBookingCode] = useState<string>(''); // Store booking code

  const { generateBookingCode } = usePayment();

  const { timeLeft, isActive: timerActive, stopTimer, formatTime, resetTimer, startTimer } = useGlobalTimer();
  const { user, isAuthenticated } = useAuth();

  // Parse URL parameters
  const cinemaName = decodeURIComponent(searchParams.cinemaName || '');
  const screenName = decodeURIComponent(searchParams.screenName || '');
  const totalPrice = parseInt(searchParams.totalPrice || '0');
  const selectedSeats = searchParams.seats ? decodeURIComponent(searchParams.seats).split(',') : [];
  const movieTitle = decodeURIComponent(searchParams.movieTitle || '');



  // Calculate tickets from URL parameters
  const ticketInfo = Object.keys(searchParams)
    .filter(key => key.startsWith('ticket'))
    .reduce((acc, key) => {
      const typeId = key.replace('ticket', '');
      const quantity = parseInt(searchParams[key] || '0');
      if (quantity > 0) {
        acc[typeId] = quantity;
      }
      return acc;
    }, {} as { [key: string]: number });

  // Calculate products from URL parameters
  const productInfo = Object.keys(searchParams)
    .filter(key => key.startsWith('product'))
    .reduce((acc, key) => {
      const productId = key.replace('product', '');
      const quantity = parseInt(searchParams[key] || '0');
      if (quantity > 0) {
        acc[productId] = quantity;
      }
      return acc;
    }, {} as { [key: string]: number });

  // Auto-fill user info and skip step 1 if logged in
  useEffect(() => {
    if (isAuthenticated() && user) {
      // Auto-fill customer info from logged-in user
      setCustomerInfo({
        name: user.fullName || user.username || '',
        phone: user.phone || '',
        email: user.email || '',
        agreeToTerms: true, // Auto-agree for logged-in users
        agreeToPromotions: false
      });

      // Skip to step 2 (payment) if user is logged in and has complete info
      if (user.fullName && user.email) {
        setCurrentStep(2);
      }
    }
  }, [user, isAuthenticated]);

  // Timer effect
  useEffect(() => {
    console.log('Checkout page loaded, timer active:', timerActive, 'time left:', timeLeft);
  }, [timerActive, timeLeft]);

  // Redirect when timer expires
  useEffect(() => {
    if (timeLeft === 0) {
      window.location.href = '/';
    }
  }, [timeLeft]);

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch('/api/payment-methods');
        const result = await response.json();

        if (result.success) {
          const methods = result.data.map((method: any) => ({
            id: method.method_code,
            name: method.method_name,
            icon: method.icon_url,
            description: method.description,
            minAmount: method.min_amount,
            maxAmount: method.max_amount,
            processingFee: method.processing_fee
          }));
          setPaymentMethods(methods);
        } else {
          setPaymentMethods(getDefaultPaymentMethods());
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        setPaymentMethods(getDefaultPaymentMethods());
      }
    };

    fetchPaymentMethods();
  }, []);

  const getDefaultPaymentMethods = (): PaymentMethod[] => [
    { id: 'momo', name: 'Thanh toán qua Momo', icon: '📱', description: 'Thanh toán qua ví điện tử Momo' },
    { id: 'domestic_card', name: 'Thanh toán qua Thẻ nội địa', icon: '💳', description: 'Thanh toán bằng thẻ ATM nội địa' },
    { id: 'international_card', name: 'Thanh toán qua Thẻ quốc tế', icon: '🌍', description: 'Thanh toán bằng thẻ Visa/Mastercard' },
    { id: 'cash', name: 'Thanh toán tại quầy', icon: '💵', description: 'Thanh toán bằng tiền mặt tại rạp' }
  ];

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string | boolean) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isStep1Valid = () => {
    return customerInfo.name.trim() !== '' &&
      customerInfo.phone.trim() !== '' &&
      customerInfo.email.trim() !== '' &&
      customerInfo.agreeToTerms;
  };

  const handleNextStep = async () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedPaymentMethod) {
      // Check if payment method requires QR code
      const qrPaymentMethods = ['momo', 'zalopay', 'vnpay'];
      if (qrPaymentMethods.includes(selectedPaymentMethod)) {
        // Generate booking code once when entering QR payment
        const newBookingCode = generateBookingCode();
        setBookingCode(newBookingCode);

        // Restart timer with 5 minutes for QR payment
        resetTimer(); // Stop current timer
        startTimer(300); // Start new 5-minute timer

        console.log('🎫 Generated booking code:', newBookingCode);
        console.log('⏰ Timer restarted for QR payment: 5 minutes');
        setCurrentStep(2.5); // Go to QR Payment step
      } else {
        await processPayment(); // Direct payment for other methods
      }
    }
  };

  const processPayment = async () => {
    setIsProcessingPayment(true);

    try {
      const bookingData = {
        customerInfo,
        showtimeId: parseInt(searchParams.showtime),
        selectedSeats,
        ticketInfo,
        productInfo,
        totalPrice,
        paymentMethod: selectedPaymentMethod
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (result.success) {
        stopTimer();
        setBookingResult(result.booking);
        localStorage.setItem('bookingResult', JSON.stringify(result.booking));
        setCurrentStep(3);
      } else {
        alert('Có lỗi xảy ra khi xử lý thanh toán: ' + result.error);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleQRPaymentSuccess = async () => {
    // Process the actual booking after QR payment success
    await processPayment();
  };

  const handleQRPaymentCancel = () => {
    setCurrentStep(2); // Go back to payment method selection
  };

  const handleQRPaymentBack = () => {
    setCurrentStep(2); // Go back to payment method selection
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CustomerInfoForm
            customerInfo={customerInfo}
            onCustomerInfoChange={handleCustomerInfoChange}
            onNext={handleNextStep}
            isValid={isStep1Valid()}
            isLoggedIn={isAuthenticated()}
          />
        );
      case 2:
        return (
          <PaymentMethodForm
            paymentMethods={paymentMethods}
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodChange={setSelectedPaymentMethod}
            onBack={() => setCurrentStep(1)}
            onNext={handleNextStep}
            isLoading={isProcessingPayment}
            isLoggedIn={isAuthenticated()}
          />
        );
      case 2.5:
        return (
          <QRPaymentForm
            bookingInfo={{
              customerName: customerInfo.name,
              customerEmail: customerInfo.email,
              customerPhone: customerInfo.phone,
              selectedSeats,
              totalPrice,
              bookingCode: bookingCode, // Use the stored booking code
              movieTitle,
              cinemaName,
              showtime: `${searchParams.showtime} - ${new Date().toLocaleDateString('vi-VN')}`,
              paymentMethod: selectedPaymentMethod
            }}
            onBack={handleQRPaymentBack}
            onPaymentSuccess={handleQRPaymentSuccess}
            onPaymentCancel={handleQRPaymentCancel}
            timeLeft={timeLeft}
            formatTime={formatTime}
          />
        );
      case 3:
        return (
          <BookingSuccess
            bookingResult={bookingResult}
            movieTitle={movieTitle}
            cinemaName={cinemaName}
            screenName={screenName}
            selectedSeats={selectedSeats}
            ticketInfo={ticketInfo}
            productInfo={productInfo}
            totalPrice={totalPrice}
            selectedPaymentMethod={selectedPaymentMethod}
            paymentMethods={paymentMethods}
            customerInfo={customerInfo}
            onGoHome={handleGoHome}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 py-8">
      <div className="container mx-auto px-4">
        <CheckoutHeader currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side - Form */}
          <div className="lg:col-span-2">
            {renderCurrentStep()}
          </div>

          {/* Right side - Booking Summary */}
          <div className="lg:col-span-1">
            <BookingSummary
              movieTitle={movieTitle}
              cinemaName={cinemaName}
              screenName={screenName}
              selectedSeats={selectedSeats}
              ticketInfo={ticketInfo}
              productInfo={productInfo}
              totalPrice={totalPrice}
              timeLeft={timeLeft}
              formatTime={formatTime}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
