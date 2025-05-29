'use client';

interface BookingSummaryProps {
  movieTitle: string;
  cinemaName: string;
  screenName: string;
  selectedSeats: string[];
  ticketInfo: { [key: string]: number };
  productInfo: { [key: string]: number };
  totalPrice: number;
  timeLeft: number;
  formatTime: () => string;
}

export default function BookingSummary({
  movieTitle,
  cinemaName,
  screenName,
  selectedSeats,
  ticketInfo,
  productInfo,
  totalPrice,
  timeLeft,
  formatTime
}: BookingSummaryProps) {

  const getCinemaAddress = (cinemaName: string) => {
    const addresses: { [key: string]: string } = {
      'Cinestar Hai Bà Trưng': '135 Hai Bà Trưng, Phường Đakao, Quận 1, Thành Phố Hồ Chí Minh',
      'Cinestar Quốc Thanh': '271 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, Thành Phố Hồ Chí Minh'
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

  const totalTickets = Object.values(ticketInfo).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="bg-blue-600 rounded-lg p-6 text-white">
      {/* Timer */}
      <div className="bg-blue-500 rounded-lg p-4 mb-6 text-center">
        <h3 className="text-lg font-bold mb-2">THỜI GIAN GIỮ VÉ</h3>
        <div className={`text-3xl font-bold ${timeLeft <= 60 ? 'text-red-300' : 'text-yellow-300'}`}>
          {formatTime()}
        </div>
        {timeLeft <= 60 && (
          <p className="text-red-200 text-sm mt-2">Thời gian sắp hết!</p>
        )}
      </div>

      {/* Movie Info */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-yellow-300 mb-4">
          {movieTitle ? movieTitle.toUpperCase() : 'TÊN PHIM KHÔNG XÁC ĐỊNH'}
        </h3>

        <div className="text-yellow-300 text-sm">
          <span className="bg-yellow-300 text-black px-2 py-1 rounded text-xs font-bold">
            T16
          </span>
        </div>

        <p className="text-sm text-gray-200">
          Phim dành cho khán giả từ đủ 16 tuổi trở lên (16+)
        </p>

        {/* Cinema Info */}
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-bold text-white">{cinemaName}</p>
            <p className="text-xs text-gray-300">
              {getCinemaAddress(cinemaName)}
            </p>
          </div>

          {/* Movie Details Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div>
              <p className="text-yellow-300 font-bold text-xs">Thời gian</p>
              <p className="text-xs">
                {formatDateTime()}
              </p>
            </div>
            <div>
              <p className="text-yellow-300 font-bold text-xs">Phòng chiếu</p>
              <p className="text-xs">{screenName}</p>
            </div>
            <div>
              <p className="text-yellow-300 font-bold text-xs">Số vé</p>
              <p className="text-xs">{totalTickets}</p>
            </div>
          </div>

          {/* Ticket Types and Seat Type */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div>
              <p className="text-yellow-300 font-bold text-xs">Loại vé</p>
              <div className="text-xs">
                {Object.entries(ticketInfo).map(([typeId, quantity]) => (
                  <div key={typeId}>
                    {quantity}x {getTicketTypeName(typeId)}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-yellow-300 font-bold text-xs">Loại ghế</p>
              <p className="text-xs">Ghế Thường</p>
            </div>
          </div>

          {/* Seats */}
          <div className="mt-4">
            <p className="text-yellow-300 font-bold text-xs">Số ghế</p>
            <div className="text-xs">
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedSeats.map((seat, index) => (
                  <span key={index} className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                    {seat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="mt-4">
            <p className="text-yellow-300 font-bold text-xs">Bắp nước</p>
            <div className="text-xs">
              {Object.keys(productInfo).length > 0 ? (
                <div className="mt-1">
                  {Object.entries(productInfo).map(([productId, quantity]) => (
                    <div key={productId}>
                      {quantity}x {getProductName(productId)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 mt-1">Không có</p>
              )}
            </div>
          </div>
        </div>

        {/* Total Price */}
        <div className="border-t border-blue-400 pt-4 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">SỐ TIỀN CẦN THANH TOÁN</span>
            <span className="text-2xl font-bold text-yellow-300">
              {totalPrice.toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
