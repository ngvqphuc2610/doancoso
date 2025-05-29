'use client';

import { Button } from '@/components/ui/button';

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
}

interface BookingResult {
  bookingCode: string;
  transactionId: string;
  tickets?: Array<{ ticketCode: string }>;
}

interface BookingSuccessProps {
  bookingResult: BookingResult | null;
  movieTitle: string;
  cinemaName: string;
  screenName: string;
  selectedSeats: string[];
  ticketInfo: { [key: string]: number };
  productInfo: { [key: string]: number };
  totalPrice: number;
  selectedPaymentMethod: string;
  paymentMethods: PaymentMethod[];
  customerInfo: CustomerInfo;
  onGoHome: () => void;
}

export default function BookingSuccess({
  bookingResult,
  movieTitle,
  cinemaName,
  screenName,
  selectedSeats,
  ticketInfo,
  productInfo,
  totalPrice,
  selectedPaymentMethod,
  paymentMethods,
  customerInfo,
  onGoHome
}: BookingSuccessProps) {
  const getCinemaAddress = (cinemaName: string) => {
    const addresses: { [key: string]: string } = {
      'Cinestar Hai Bà Trưng': '135 Hai Bà Trưng, Phường Đakao, Quận 1, TP.HCM',
      'Cinestar Quốc Thanh': '271 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP.HCM'
    };
    return addresses[cinemaName] || 'Địa chỉ rạp chiếu phim';
  };

  const getTicketTypeName = (typeId: string) => {
    const ticketTypes: { [key: string]: string } = {
      '1': 'HSSV-Người Cao Tuổi',
      '2': 'Người Lớn',
      '3': 'Trẻ Em'
    };
    return ticketTypes[typeId] || 'Vé Thường';
  };

  const getProductName = (productId: string) => {
    const products: { [key: string]: string } = {
      '1': 'Combo 1 (Bắp + Nước)',
      '2': 'Combo 2 (Bắp + 2 Nước)',
      '3': 'Nước ngọt',
      '4': 'Bắp rang'
    };
    return products[productId] || 'Sản phẩm';
  };

  const formatDateTime = () => {
    return new Date().toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">Thông tin vé phim</h2>

      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h3 className="text-2xl font-bold text-white mb-4">Thanh toán thành công!</h3>
        <p className="text-gray-300 mb-6">
          Vé của bạn đã được đặt thành công. Thông tin vé đã được gửi đến email của bạn.
        </p>

        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="text-white font-bold mb-4 text-center">Thông tin đặt vé</h4>
          <div className="text-left text-gray-300 space-y-2 text-sm">
            {/* Booking codes */}
            {bookingResult && (
              <>
                <div className="bg-gray-600 p-3 rounded mb-3">
                  <p><strong>Mã đặt vé:</strong> <span className="text-yellow-400 font-mono text-lg">{bookingResult.bookingCode}</span></p>
                  <p><strong>Mã giao dịch:</strong> <span className="text-green-400 font-mono">{bookingResult.transactionId}</span></p>
                </div>
              </>
            )}

            {/* Movie and cinema info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Phim:</strong> {movieTitle || 'Tên phim không xác định'}</p>
                <p><strong>Rạp:</strong> {cinemaName}</p>
                <p><strong>Địa chỉ:</strong> {getCinemaAddress(cinemaName)}</p>
                <p><strong>Phòng chiếu:</strong> {screenName}</p>
              </div>
              <div>
                <p><strong>Thời gian:</strong> {formatDateTime()}</p>
                <p><strong>Số vé:</strong> {Object.values(ticketInfo).reduce((sum, qty) => sum + qty, 0)}</p>
                <p><strong>Số ghế:</strong> {selectedSeats.join(', ')}</p>
              </div>
            </div>

            {/* Ticket types */}
            <div className="mt-4">
              <p><strong>Loại vé:</strong></p>
              <ul className="ml-4 mt-1">
                {Object.entries(ticketInfo).map(([typeId, quantity]) => (
                  <li key={typeId} className="text-xs">
                    • {quantity}x {getTicketTypeName(typeId)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Ticket codes */}
            {bookingResult?.tickets && (
              <div className="mt-4">
                <p><strong>Mã vé:</strong></p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {bookingResult.tickets.map((ticket, index) => (
                    <span key={index} className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-mono">
                      {ticket.ticketCode}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {Object.keys(productInfo).length > 0 && (
              <div className="mt-4">
                <p><strong>Bắp nước:</strong></p>
                <ul className="ml-4 mt-1">
                  {Object.entries(productInfo).map(([productId, quantity]) => (
                    <li key={productId} className="text-xs">
                      • {quantity}x {getProductName(productId)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Customer and payment info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p><strong>Khách hàng:</strong> {customerInfo.name}</p>
                <p><strong>Email:</strong> {customerInfo.email}</p>
                <p><strong>Số điện thoại:</strong> {customerInfo.phone}</p>
              </div>
              <div>
                <p><strong>Phương thức thanh toán:</strong></p>
                <p className="text-xs ml-2">
                  {paymentMethods.find(method => method.id === selectedPaymentMethod)?.name || 'Chưa chọn'}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-600 pt-3 mt-4">
              <p className="text-lg text-center">
                <strong>Tổng tiền:</strong>
                <span className="text-yellow-400 text-xl ml-2">{totalPrice.toLocaleString('vi-VN')}₫</span>
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={onGoHome}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 text-lg"
        >
          VỀ TRANG CHỦ
        </Button>
      </div>
    </div>
  );
}
