import { Button } from '@/components/ui/button';
import { useGlobalTimer } from '@/contexts/GlobalTimerContext';

interface BookingBarProps {
    movieTitle: string;
    cinemaName: string;
    screenName: string;
    productName: string;
    selectedDate: string;
    showTime: string;
    selectedSeats: string[];
    totalPrice: number;
    productSelection: { [key: string]: number };
    onBookingClick: () => void;
}

export default function BookingBar({
    movieTitle,
    cinemaName,
    screenName,
    productName,
    selectedDate,
    showTime,
    selectedSeats,
    totalPrice,
    productSelection,
    onBookingClick
}: BookingBarProps) {
    const { formatTime } = useGlobalTimer();

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-3 sm:p-4 z-50">
            <div className="container mx-auto">
                {/* Mobile Layout */}
                <div className="block lg:hidden">
                    <div className="flex flex-col space-y-3">
                        {/* Movie info - compact */}
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-white truncate">
                                {movieTitle || 'Phim đang chọn'}
                            </h3>
                            <p className="text-sm text-gray-300 truncate">
                                {cinemaName} | {screenName}
                            </p>
                            <p className="text-sm text-gray-300">
                                {selectedDate} | {showTime}
                            </p>
                            <p className="text-sm text-gray-300">
                                Ghế: {selectedSeats.join(', ')}
                            </p>
                        </div>

                        {/* Bottom row - timer, price, button */}
                        <div className="flex items-center justify-between">
                            {/* Timer */}
                            <div className="bg-yellow-500 text-black font-bold px-2 py-1 rounded text-center">
                                <p className="text-xs">Thời gian</p>
                                <p className="text-sm font-bold">{formatTime()}</p>
                            </div>

                            {/* Price */}
                            <div className="text-center">
                                <p className="text-xs text-gray-300">Tạm tính</p>
                                <p className="text-lg font-bold text-white">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    }).format(totalPrice)}
                                </p>
                            </div>

                            {/* Button */}
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 text-sm"
                                onClick={onBookingClick}
                            >
                                Đặt Vé
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Thông tin phim */}
                        <div className="text-left">
                            <h3 className="text-xl font-bold text-white">
                                {movieTitle || 'Phim đang chọn'}
                            </h3>
                            <p className="text-gray-300">
                                {cinemaName} | {screenName}
                            </p>
                            <p className="text-gray-300">
                                {selectedDate} | {showTime}
                            </p>
                            <p className="text-gray-300">
                                Ghế: {selectedSeats.join(', ')}
                            </p>
                            {productName && productName !== 'Không có sản phẩm' && (
                                <p className="text-gray-300 text-sm">
                                    Sản phẩm: {productName}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Thời gian còn lại */}
                        <div className="bg-yellow-500 text-black font-bold px-4 py-2 rounded">
                            <p className="text-sm">Thời gian giữ vé</p>
                            <p className="text-xl">{formatTime()}</p>
                        </div>

                        {/* Tổng tiền */}
                        <div className="text-right">
                            <p className="text-sm text-gray-300">Tạm tính</p>
                            <p className="text-xl font-bold text-white">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(totalPrice)}
                            </p>
                        </div>

                        {/* Nút đặt vé */}
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 text-lg"
                            onClick={onBookingClick}
                        >
                            Đặt Vé Ngay
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
