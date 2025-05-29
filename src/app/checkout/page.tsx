'use client';

import { useState, useEffect, use } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useGlobalTimer } from '@/contexts/GlobalTimerContext';

interface CheckoutPageProps {
    params: {};
    searchParams: Promise<{
        showtime: string;
        cinemaName: string;
        screenName: string;
        totalPrice?: string;
        seats?: string;
        movieTitle?: string;
        [key: string]: string | undefined;
    }>;
}

interface CustomerInfo {
    name: string;
    phone: string;
    email: string;
    agreeToTerms: boolean;
    agreeToPromotions: boolean;
}

export default function CheckoutPage({ searchParams }: CheckoutPageProps) {
    // Unwrap searchParams using React.use()
    const params = use(searchParams);

    const [currentStep, setCurrentStep] = useState(1);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        name: '',
        phone: '',
        email: '',
        agreeToTerms: false,
        agreeToPromotions: false
    });
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
    const { timeLeft, isActive: timerActive, startTimer, stopTimer, formatTime } = useGlobalTimer(); // Thêm stopTimer
    const [bookingResult, setBookingResult] = useState<any>(null);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

    // Parse URL parameters
    const cinemaName = decodeURIComponent(params.cinemaName || '');
    const screenName = decodeURIComponent(params.screenName || '');
    const totalPrice = parseInt(params.totalPrice || '0');
    const selectedSeats = params.seats ? decodeURIComponent(params.seats).split(',') : [];
    const movieTitle = decodeURIComponent(params.movieTitle || '');

    // Calculate tickets from URL parameters
    const ticketInfo = Object.keys(params)
        .filter(key => key.startsWith('ticket'))
        .reduce((acc, key) => {
            const typeId = key.replace('ticket', '');
            const quantity = parseInt(params[key] || '0');
            if (quantity > 0) {
                acc[typeId] = quantity;
            }
            return acc;
        }, {} as { [key: string]: number });

    // Calculate products from URL parameters
    const productInfo = Object.keys(params)
        .filter(key => key.startsWith('product'))
        .reduce((acc, key) => {
            const productId = key.replace('product', '');
            const quantity = parseInt(params[key] || '0');
            if (quantity > 0) {
                acc[productId] = quantity;
            }
            return acc;
        }, {} as { [key: string]: number });

    // ✅ SỬA LỖI: Timer countdown - không start timer nếu đã có timer đang chạy
    useEffect(() => {
        // Chỉ log để debug, không start timer mới vì timer đã được start từ MovieShowtimes
        console.log('Checkout page loaded, timer active:', timerActive, 'time left:', timeLeft);
    }, [timerActive, timeLeft]);

    // ✅ THÊM: Effect để handle khi timer hết thời gian
    useEffect(() => {
        if (timeLeft === 0) {
            // Redirect về trang chủ khi hết thời gian
            window.location.href = '/';
        }
    }, [timeLeft]);



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
            // Process payment and save to database
            try {
                const bookingData = {
                    customerInfo,
                    showtimeId: parseInt(params.showtime),
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
                    // ✅ THÊM: Dừng timer khi thanh toán thành công
                    stopTimer();

                    // Store booking info for display in step 3
                    setBookingResult(result.booking);
                    localStorage.setItem('bookingResult', JSON.stringify(result.booking));
                    setCurrentStep(3);
                } else {
                    alert('Có lỗi xảy ra khi xử lý thanh toán: ' + result.error);
                }
            } catch (error) {
                console.error('Payment processing error:', error);
                alert('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
            }
        }
    };

    // Fetch payment methods from API
    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const response = await fetch('/api/payment-methods');
                const result = await response.json();

                if (result.success) {
                    // Transform API data to match component format
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
                    // Fallback to default methods
                    setPaymentMethods([
                        { id: 'momo', name: 'Thanh toán qua Momo', icon: '📱', description: 'Thanh toán qua ví điện tử Momo' },
                        { id: 'domestic_card', name: 'Thanh toán qua Thẻ nội địa', icon: '💳', description: 'Thanh toán bằng thẻ ATM nội địa' },
                        { id: 'international_card', name: 'Thanh toán qua Thẻ quốc tế', icon: '🌍', description: 'Thanh toán bằng thẻ Visa/Mastercard' },
                        { id: 'cash', name: 'Thanh toán tại quầy', icon: '💵', description: 'Thanh toán bằng tiền mặt tại rạp' }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching payment methods:', error);
                // Fallback to default methods
                setPaymentMethods([
                    { id: 'momo', name: 'Thanh toán qua Momo', icon: '📱', description: 'Thanh toán qua ví điện tử Momo' },
                    { id: 'domestic_card', name: 'Thanh toán qua Thẻ nội địa', icon: '💳', description: 'Thanh toán bằng thẻ ATM nội địa' },
                    { id: 'international_card', name: 'Thanh toán qua Thẻ quốc tế', icon: '🌍', description: 'Thanh toán bằng thẻ Visa/Mastercard' },
                    { id: 'cash', name: 'Thanh toán tại quầy', icon: '💵', description: 'Thanh toán bằng tiền mặt tại rạp' }
                ]);
            }
        };

        fetchPaymentMethods();
    }, []);

    return (
        <Layout>
            <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 py-8">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-4">TRANG THANH TOÁN</h1>

                        {/* Steps indicator */}
                        <div className="flex justify-center items-center space-x-8 mb-8">
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${currentStep >= 1 ? 'bg-yellow-500' : 'bg-gray-500'}`}>
                                    1
                                </div>
                                <span className={`text-sm mt-2 ${currentStep >= 1 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                    THÔNG TIN KHÁCH HÀNG
                                </span>
                            </div>

                            <div className={`h-0.5 w-16 ${currentStep >= 2 ? 'bg-yellow-500' : 'bg-gray-500'}`}></div>

                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${currentStep >= 2 ? 'bg-yellow-500' : 'bg-gray-500'}`}>
                                    2
                                </div>
                                <span className={`text-sm mt-2 ${currentStep >= 2 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                    THANH TOÁN
                                </span>
                            </div>

                            <div className={`h-0.5 w-16 ${currentStep >= 3 ? 'bg-yellow-500' : 'bg-gray-500'}`}></div>

                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${currentStep >= 3 ? 'bg-yellow-500' : 'bg-gray-500'}`}>
                                    3
                                </div>
                                <span className={`text-sm mt-2 ${currentStep >= 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                    THÔNG TIN VÉ PHIM
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left side - Form */}
                        <div className="lg:col-span-2">
                            {/* Step 1: Customer Information */}
                            {currentStep === 1 && (
                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h2 className="text-xl font-bold text-white mb-6">Thông tin khách hàng</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-white text-sm font-medium mb-2">
                                                Họ và tên <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={customerInfo.name}
                                                onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
                                                placeholder="Họ và tên"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-white text-sm font-medium mb-2">
                                                Số điện thoại <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={customerInfo.phone}
                                                onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
                                                placeholder="Số điện thoại"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-white text-sm font-medium mb-2">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={customerInfo.email}
                                                onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
                                                placeholder="Email"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="flex items-center text-white text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={customerInfo.agreeToTerms}
                                                    onChange={(e) => handleCustomerInfoChange('agreeToTerms', e.target.checked)}
                                                    className="mr-2"
                                                />
                                                Đồng ý với điều khoản sử dụng và quy định
                                            </label>

                                            <label className="flex items-center text-white text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={customerInfo.agreeToPromotions}
                                                    onChange={(e) => handleCustomerInfoChange('agreeToPromotions', e.target.checked)}
                                                    className="mr-2"
                                                />
                                                Đăng ký nhận điều khoản của Cinestar
                                            </label>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleNextStep}
                                        disabled={!isStep1Valid()}
                                        className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 text-lg"
                                    >
                                        TIẾP TỤC
                                    </Button>
                                </div>
                            )}

                            {/* Step 2: Payment Method */}
                            {currentStep === 2 && (
                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h2 className="text-xl font-bold text-white mb-6">Chọn phương thức thanh toán</h2>

                                    <div className="space-y-4">
                                        {paymentMethods.map((method) => (
                                            <div
                                                key={method.id}
                                                onClick={() => setSelectedPaymentMethod(method.id)}
                                                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${selectedPaymentMethod === method.id
                                                    ? 'border-yellow-500 bg-gray-700'
                                                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <span className="text-2xl mr-3">{method.icon}</span>
                                                        <div>
                                                            <div className="text-white font-medium">{method.name}</div>
                                                            {method.description && (
                                                                <div className="text-gray-400 text-sm mt-1">{method.description}</div>
                                                            )}
                                                            {method.processingFee > 0 && (
                                                                <div className="text-yellow-400 text-xs mt-1">
                                                                    Phí xử lý: {method.processingFee.toLocaleString('vi-VN')}₫
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {selectedPaymentMethod === method.id && (
                                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                            <span className="text-white text-sm">✓</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedPaymentMethod === 'discount_code' && (
                                        <div className="mt-4">
                                            <input
                                                type="text"
                                                placeholder="Nhập mã giảm giá"
                                                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
                                            />
                                        </div>
                                    )}

                                    <div className="flex gap-4 mt-6">
                                        <Button
                                            onClick={() => setCurrentStep(1)}
                                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 text-lg"
                                        >
                                            QUAY LẠI
                                        </Button>
                                        <Button
                                            onClick={handleNextStep}
                                            disabled={!selectedPaymentMethod}
                                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 text-lg"
                                        >
                                            THANH TOÁN
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Ticket Information */}
                            {currentStep === 3 && (
                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h2 className="text-xl font-bold text-white mb-6">Thông tin vé phim</h2>

                                    <div className="text-center">
                                        <div className="text-green-500 text-6xl mb-4">✓</div>
                                        <h3 className="text-2xl font-bold text-white mb-4">Thanh toán thành công!</h3>
                                        <p className="text-gray-300 mb-6">
                                            Vé của bạn đã được đặt thành công. Thông tin vé đã được gửi đến email của bạn.
                                        </p>

                                        <div className="bg-gray-700 rounded-lg p-4 mb-6">
                                            <h4 className="text-white font-bold mb-2">Thông tin đặt vé</h4>
                                            <div className="text-left text-gray-300 space-y-1 text-sm">
                                                {bookingResult && (
                                                    <>
                                                        <p><strong>Mã đặt vé:</strong> <span className="text-yellow-400 font-mono">{bookingResult.bookingCode}</span></p>
                                                        <p><strong>Mã giao dịch:</strong> <span className="text-green-400 font-mono">{bookingResult.transactionId}</span></p>
                                                        <div className="border-b border-gray-600 pb-2 mb-2"></div>
                                                    </>
                                                )}
                                                <p><strong>Phim:</strong> {movieTitle}</p>
                                                <p><strong>Rạp:</strong> {cinemaName}</p>
                                                <p><strong>Địa chỉ:</strong> {
                                                    cinemaName === 'Cinestar Hai Bà Trưng' ? '135 Hai Bà Trưng, Phường Đakao, Quận 1, TP.HCM' :
                                                        cinemaName === 'Cinestar Quốc Thanh' ? '271 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP.HCM' :
                                                            'Địa chỉ rạp chiếu phim'
                                                }</p>
                                                <p><strong>Thời gian:</strong> {new Date().toLocaleString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    weekday: 'long',
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}</p>
                                                <p><strong>Phòng chiếu:</strong> {screenName}</p>
                                                <p><strong>Số vé:</strong> {Object.values(ticketInfo).reduce((sum, qty) => sum + qty, 0)}</p>
                                                <p><strong>Loại vé:</strong> {Object.keys(ticketInfo).map(typeId => {
                                                    const ticketTypes: { [key: string]: string } = {
                                                        '1': 'HSSV-Người Cao Tuổi',
                                                        '2': 'Người Lớn',
                                                        '3': 'Trẻ Em'
                                                    };
                                                    return ticketTypes[typeId] || 'Vé Thường';
                                                }).join(', ')}</p>
                                                <p><strong>Số ghế:</strong> {selectedSeats.join(', ')}</p>
                                                {bookingResult?.tickets && (
                                                    <p><strong>Mã vé:</strong> {bookingResult.tickets.map((ticket: any) => ticket.ticketCode).join(', ')}</p>
                                                )}
                                                {Object.keys(productInfo).length > 0 && (
                                                    <p><strong>Bắp nước:</strong> {Object.keys(productInfo).map(productId => {
                                                        const products: { [key: string]: string } = {
                                                            '1': 'Combo 1 (Bắp + Nước)',
                                                            '2': 'Combo 2 (Bắp + 2 Nước)',
                                                            '3': 'Nước ngọt',
                                                            '4': 'Bắp rang'
                                                        };
                                                        const quantity = productInfo[productId];
                                                        return `${quantity} ${products[productId] || 'Sản phẩm'}`;
                                                    }).join(', ')}</p>
                                                )}
                                                <p><strong>Phương thức thanh toán:</strong> {
                                                    paymentMethods.find(method => method.id === selectedPaymentMethod)?.name || 'Chưa chọn'
                                                }</p>
                                                <p><strong>Khách hàng:</strong> {customerInfo.name}</p>
                                                <p><strong>Email:</strong> {customerInfo.email}</p>
                                                <p><strong>Số điện thoại:</strong> {customerInfo.phone}</p>
                                                <div className="border-t border-gray-600 pt-2 mt-2">
                                                    <p className="text-lg"><strong>Tổng tiền:</strong> <span className="text-yellow-400">{totalPrice.toLocaleString('vi-VN')}₫</span></p>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => window.location.href = '/'}
                                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 text-lg"
                                        >
                                            VỀ TRANG CHỦ
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right side - Ticket Information */}
                        <div className="lg:col-span-1">
                            <div className="bg-blue-600 rounded-lg p-6 text-white">
                                {/* Timer */}
                                <div className="bg-blue-500 rounded-lg p-4 mb-6 text-center">
                                    <h3 className="text-lg font-bold mb-2">THỜI GIAN GIỮ VÉ</h3>
                                    <div className="text-3xl font-bold text-yellow-300">
                                        {formatTime()}
                                    </div>
                                </div>

                                {/* Movie Info */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-yellow-300 mb-4">
                                        {movieTitle.toUpperCase()}
                                    </h3>

                                    <div className="text-yellow-300 text-sm">
                                        <span className="bg-yellow-300 text-black px-2 py-1 rounded text-xs font-bold">
                                            T16
                                        </span>
                                    </div>

                                    <p className="text-sm">
                                        Phim dành cho khán giả từ đủ 16 tuổi trở lên (16+)
                                    </p>

                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <p className="font-bold text-white">{cinemaName}</p>
                                            <p className="text-xs text-gray-300">
                                                {cinemaName === 'Cinestar Hai Bà Trưng' ? '135 Hai Bà Trưng, Phường Đakao, Quận 1, Thành Phố Hồ Chí Minh' :
                                                    cinemaName === 'Cinestar Quốc Thanh' ? '271 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, Thành Phố Hồ Chí Minh' :
                                                        'Địa chỉ rạp chiếu phim'}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 mt-4">
                                            <div>
                                                <p className="text-yellow-300 font-bold text-xs">Thời gian</p>
                                                <p className="text-xs">
                                                    {new Date().toLocaleString('vi-VN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        weekday: 'long',
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-yellow-300 font-bold text-xs">Phòng chiếu</p>
                                                <p className="text-xs">{screenName}</p>
                                            </div>
                                            <div>
                                                <p className="text-yellow-300 font-bold text-xs">Số vé</p>
                                                <p className="text-xs">{Object.values(ticketInfo).reduce((sum, qty) => sum + qty, 0)}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            <div>
                                                <p className="text-yellow-300 font-bold text-xs">Loại vé</p>
                                                <p className="text-xs">
                                                    {Object.keys(ticketInfo).map(typeId => {
                                                        const ticketTypes: { [key: string]: string } = {
                                                            '1': 'HSSV-Người Cao Tuổi',
                                                            '2': 'Người Lớn',
                                                            '3': 'Trẻ Em'
                                                        };
                                                        return ticketTypes[typeId] || 'Vé Thường';
                                                    }).join(', ')}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-yellow-300 font-bold text-xs">Loại ghế</p>
                                                <p className="text-xs">Ghế Thường</p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-yellow-300 font-bold text-xs">Số ghế</p>
                                            <p className="text-xs">{selectedSeats.join(', ')}</p>
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-yellow-300 font-bold text-xs">Bắp nước</p>
                                            <div className="text-xs">
                                                {Object.keys(productInfo).length > 0 ? (
                                                    Object.keys(productInfo).map(productId => {
                                                        const products: { [key: string]: string } = {
                                                            '1': 'Combo 1 (Bắp + Nước)',
                                                            '2': 'Combo 2 (Bắp + 2 Nước)',
                                                            '3': 'Nước ngọt',
                                                            '4': 'Bắp rang'
                                                        };
                                                        const quantity = productInfo[productId];
                                                        return `${quantity} ${products[productId] || 'Sản phẩm'}`;
                                                    }).join(', ')
                                                ) : (
                                                    'Không có'
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-blue-400 pt-4 mt-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold">SỐ TIỀN CẦN THANH TOÁN</span>
                                            <span className="text-2xl font-bold text-yellow-300">
                                                {totalPrice.toLocaleString('vi-VN')}VND
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </Layout>
    );
}