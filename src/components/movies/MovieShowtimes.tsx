import { useState, useEffect } from 'react';
import SeatSelection from './SeatSelection';
import TicketSelector from './TicketSelector';
import { ComboGrid, SoftDrinksGrid, BeveragesGrid, FoodProductsGrid } from '@/components/product/ProductGrid';

// Import các component nhỏ
import DateSelector from './DateSelector';
import CitySelector from './CitySelector';
import CinemaList from './CinemaList';
import BookingBar from './BookingBar';
import { LoadingState, ErrorState, EmptyState } from './ShowtimeStates';

// Import custom hooks
import { useShowtimes, useCities } from '@/hooks/useShowtimes';
import { useProductSelection } from '@/hooks/useProductSelection';
import { useSelectionState } from '@/hooks/useSelectionState';
import { useGlobalTimer } from '@/contexts/GlobalTimerContext';


// Import types
import { MovieShowtimesProps } from '@/types/showtime';

export default function MovieShowtimes({ movieId, status, releaseDate, movieTitle }: MovieShowtimesProps) {


    // Sử dụng custom hooks
    const { showtimes, isLoading, error } = useShowtimes(movieId);
    const { cities, cinemaToCity } = useCities();
    const { timeLeft, isActive: timerActive, startTimer, stopTimer, formatTime } = useGlobalTimer();
    const { productSelection, productNames, totalProductPrice, shouldResetProducts, handleProductQuantityChange, resetProducts } = useProductSelection();

    const {
        selectedDate,
        selectedCinema,
        selectedTime,
        selectedCity,
        isDropdownOpen,
        ticketSelection,
        totalTicketPrice,
        showTicketSelector,
        selectedSeats,
        showBookingBar,
        handleDateSelection,
        handleCinemaSelection,
        handleTimeSelection,
        handleCitySelection,
        handleTicketSelection,
        handleSeatSelection,
        setIsDropdownOpen
    } = useSelectionState();

    // State cho sản phẩm
    const [showProducts, setShowProducts] = useState<boolean>(false);

    // Effect để hiển thị sản phẩm khi có vé được chọn
    useEffect(() => {
        if (Object.keys(ticketSelection).length > 0) {
            const totalTickets = Object.values(ticketSelection).reduce((sum, qty) => sum + qty, 0);
            if (totalTickets > 0 && !showProducts) {
                setShowProducts(true);
            }
        }
    }, [ticketSelection, showProducts]);

    // Effect để bắt đầu timer khi chọn ghế
    useEffect(() => {
        if (selectedSeats.length > 0 && !timerActive) {
            startTimer();
        }
    }, [selectedSeats, timerActive, startTimer]);

    // Effect để reset products khi thay đổi phim hoặc bắt đầu booking mới
    useEffect(() => {
        // Reset products khi movieId thay đổi (người dùng chọn phim khác)
        resetProducts();
    }, [movieId, resetProducts]);

    // Tính tổng tiền (vé + sản phẩm)
    const calculateTotalPrice = () => {
        return totalTicketPrice + totalProductPrice;
    };

    // Lấy tên sản phẩm đã chọn
    const getSelectedProductNames = () => {
        return Object.entries(productSelection)
            .filter(([_, quantity]) => quantity > 0)
            .map(([productId, quantity]) => {
                const productName = productNames[productId] || `Sản phẩm ${productId}`;
                return `${productName} (${quantity})`;
            })
            .join(', ') || 'Không có sản phẩm';
    };



    // Lấy thông tin showtime được chọn
    const getSelectedShowtimeInfo = () => {
        const selectedShowtime = showtimes.find(st => st.date === selectedDate);
        const selectedCinemaData = selectedShowtime?.cinemas.find(c => c.id === selectedCinema);
        const selectedTimeData = selectedCinemaData?.showTimes.find(t => t.id === selectedTime);

        return {
            selectedShowtime,
            selectedCinemaData,
            selectedTimeData
        };
    };

    const { selectedCinemaData, selectedTimeData } = getSelectedShowtimeInfo();

    // Xử lý đặt vé
    const handleBooking = () => {
        const ticketParams = Object.entries(ticketSelection)
            .filter(([_, qty]) => qty > 0)
            .map(([typeId, qty]) => `ticket${typeId}=${qty}`)
            .join('&');

        const productParams = Object.entries(productSelection)
            .filter(([_, qty]) => qty > 0)
            .map(([productId, qty]) => `product${productId}=${qty}`)
            .join('&');

        const seatParams = `seats=${selectedSeats.join(',')}`;

        const checkoutUrl = `/checkout?showtime=${selectedTime}&cinemaName=${encodeURIComponent(
            selectedCinemaData?.name || ''
        )}&screenName=${encodeURIComponent(
            selectedTimeData?.room || ''
        )}&totalPrice=${calculateTotalPrice()}&${ticketParams}&${productParams}&${seatParams}&movieTitle=${encodeURIComponent(movieTitle || '')}`;



        window.location.href = checkoutUrl;
    };

    return (
        <div className="container mx-auto px-0 mt-8 text-center">
            <div className="rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Lịch Chiếu</h2>

                {isLoading ? (
                    <LoadingState />
                ) : error ? (
                    <ErrorState error={error} />
                ) : showtimes.length === 0 ? (
                    <EmptyState status={status} releaseDate={releaseDate} />
                ) : (
                    <>
                        {/* Chọn ngày */}
                        <DateSelector
                            showtimes={showtimes}
                            selectedDate={selectedDate}
                            onDateSelect={handleDateSelection}
                        />

                        {/* Danh sách rạp */}
                        {selectedDate && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-4xl font-semibold text-white">Danh Sách Rạp</h3>
                                    <CitySelector
                                        cities={cities}
                                        selectedCity={selectedCity}
                                        isDropdownOpen={isDropdownOpen}
                                        onCitySelect={handleCitySelection}
                                        onToggleDropdown={() => setIsDropdownOpen(!isDropdownOpen)}
                                    />
                                </div>

                                <CinemaList
                                    cinemas={showtimes
                                        .find(st => st.date === selectedDate)
                                        ?.cinemas.filter(cinema => {
                                            const cinemaCity = cinemaToCity[cinema.name];
                                            return !selectedCity || cinemaCity === selectedCity;
                                        }) || []}
                                    selectedCinema={selectedCinema}
                                    selectedTime={selectedTime}
                                    onCinemaSelect={handleCinemaSelection}
                                    onTimeSelect={handleTimeSelection}
                                />

                                {/* Chọn loại vé */}
                                {selectedTime && (
                                    <div className="mt-6">
                                        <h3 className="text-2xl font-bold text-white mb-4">Chọn Loại Vé</h3>
                                        <TicketSelector
                                            basePrice={selectedTimeData?.price || 0}
                                            onTicketSelectionChange={handleTicketSelection}
                                        />
                                    </div>
                                )}

                                {/* Chọn ghế */}
                                {selectedTime && showTicketSelector && (
                                    <div className="mt-6">
                                        <SeatSelection
                                            showtimeId={selectedTime}
                                            cinemaName={selectedCinemaData?.name || ''}
                                            screenName={selectedTimeData?.room || ''}
                                            onConfirm={handleSeatSelection}
                                            totalTickets={Object.values(ticketSelection).reduce((sum, qty) => sum + qty, 0)}
                                            ticketSelection={ticketSelection}
                                        />
                                    </div>
                                )}

                                {/* Chọn sản phẩm */}
                                {showProducts && selectedTime && showTicketSelector && (
                                    <div className="space-y-16">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-2xl font-bold text-white">Chọn Sản Phẩm</h3>
                                            <button
                                                onClick={resetProducts}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                                            >
                                                Xóa tất cả sản phẩm
                                            </button>
                                        </div>

                                        <ComboGrid
                                            onQuantityChange={handleProductQuantityChange}
                                            resetQuantities={shouldResetProducts}
                                        />
                                        <SoftDrinksGrid
                                            onQuantityChange={handleProductQuantityChange}
                                            resetQuantities={shouldResetProducts}
                                        />
                                        <BeveragesGrid
                                            onQuantityChange={handleProductQuantityChange}
                                            resetQuantities={shouldResetProducts}
                                        />
                                        <FoodProductsGrid
                                            onQuantityChange={handleProductQuantityChange}
                                            resetQuantities={shouldResetProducts}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Thanh booking */}
            {showBookingBar && (
                <BookingBar
                    movieTitle={movieTitle || 'Phim đang chọn'}
                    cinemaName={selectedCinemaData?.name || ''}
                    screenName={selectedTimeData?.room || ''}
                    productName={getSelectedProductNames()}
                    selectedDate={selectedDate}
                    showTime={selectedTimeData?.time || ''}
                    selectedSeats={selectedSeats}
                    totalPrice={calculateTotalPrice()}
                    productSelection={productSelection}
                    onBookingClick={handleBooking}
                />
            )}
        </div>
    );
}
