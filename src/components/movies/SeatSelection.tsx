import { useState, useEffect } from 'react';
import { useSeatLocking } from '@/hooks/useSeatLocking';
// Removed WebSocket - using database polling only

interface SeatProps {
    id: string;  // Đổi thành string để dễ xử lý định dạng A01, B02...
    row: string;
    number: string;
    type: 'regular' | 'couple' | 'vip' | 'imax';
    status: 'available' | 'booked' | 'selected' | 'locked' | 'maintenance' | 'inactive';
    price: number;
    onSelect: (id: string) => void;
}

interface Seat {
    id: string;
    row: string;
    number: string;
    type: 'regular' | 'couple' | 'vip' | 'imax';
    status: 'available' | 'booked' | 'selected' | 'locked' | 'maintenance' | 'inactive';
    price: number;
    position: number;
}

interface TicketSelection {
    [key: number]: number; // { ticketTypeId: quantity }
}

interface SeatMapProps {
    showtimeId: number;
    cinemaName: string;
    screenName: string;
    onConfirm: (selectedSeats: string[]) => void;
    totalTickets: number; // Total number of tickets that should be selected
    ticketSelection: TicketSelection; // Information about selected ticket types
}

const Seat = ({ id, number, type, status, price, onSelect }: SeatProps) => {
    const getBackgroundColor = () => {
        switch (status) {
            case 'booked':
                return 'bg-gray-600 text-white';  // Ghế đã đặt
            case 'selected':
                return 'bg-yellow-400 text-black';  // Ghế đang chọn
            case 'locked':
                return 'bg-red-400 text-white';  // Ghế đang được người khác chọn
            case 'maintenance':
                return 'bg-orange-400 text-white';  // Ghế bảo trì
            case 'inactive':
                return 'bg-gray-400 text-white';  // Ghế không hoạt động
            default:
                switch (type) {
                    case 'couple':
                        return 'bg-pink-200 text-black';  // Ghế đôi
                    case 'vip':
                        return 'bg-purple-200 text-black';  // Ghế VIP
                    case 'imax':
                        return 'bg-blue-200 text-black';  // Ghế IMAX
                    default:
                        return 'bg-white text-black';     // Ghế thường
                }
        }
    };

    const isDisabled = status === 'booked' || status === 'locked' || status === 'maintenance' || status === 'inactive';

    return (
        <button
            onClick={() => !isDisabled && onSelect(id)}
            disabled={isDisabled}
            className={`
                w-10 h-10 rounded m-0.5 text-xs font-semibold transition-colors
                ${getBackgroundColor()}
                ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
            `}
            title={
                status === 'locked'
                    ? `Ghế ${id} - Đang được người khác chọn`
                    : status === 'booked'
                        ? `Ghế ${id} - Đã được đặt`
                        : `Ghế ${id} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}`
            }
        >
            {number}
        </button>
    );
};

export default function SeatMap({ showtimeId, screenName, onConfirm, totalTickets, ticketSelection }: SeatMapProps) {
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [seats, setSeats] = useState<Seat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [unavailableSeats, setUnavailableSeats] = useState<Set<string>>(new Set());

    // Use seat locking hook
    const { lockSeat, unlockSeat, unlockAllSeats } = useSeatLocking();

    // Database polling only - no real-time updates

    // Database polling only - no WebSocket

    // Initial seat status load
    useEffect(() => {
        if (showtimeId) {
            refreshSeatStatus();
        }
    }, [showtimeId]);

    // Effect to check if selected seats match required number of tickets
    useEffect(() => {
        if (selectedSeats.length > totalTickets) {
            setErrorMessage(`Bạn chỉ được chọn ${totalTickets} ghế theo số vé đã chọn`);
            // Remove the last selected seat to match the ticket count
            setSelectedSeats(prev => prev.slice(0, totalTickets));
        } else if (selectedSeats.length < totalTickets) {
            setErrorMessage(`Vui lòng chọn thêm ${totalTickets - selectedSeats.length} ghế nữa`);
        } else {
            setErrorMessage(null);
        }
    }, [selectedSeats, totalTickets]);

    // Auto-refresh seat status every 3 seconds (database polling)
    useEffect(() => {
        if (!showtimeId) return;

        console.log('🔄 Starting database polling refresh');
        const interval = setInterval(() => {
            refreshSeatStatus();
        }, 3000); // Refresh every 3 seconds

        return () => {
            console.log('🔄 Stopping database polling refresh');
            clearInterval(interval);
        };
    }, [showtimeId]);

    // Cleanup: unlock all seats when component unmounts
    useEffect(() => {
        return () => {
            if (selectedSeats.length > 0) {
                unlockAllSeats();
            }
        };
    }, [selectedSeats, unlockAllSeats]);

    // Refresh seat status from server
    const refreshSeatStatus = async () => {
        try {
            const response = await fetch(`/api/seat-locks/status?showtimeId=${showtimeId}`);
            const result = await response.json();

            if (result.success) {
                setUnavailableSeats(new Set(result.data.unavailableSeats));
            }
        } catch (error) {
            console.error('Error refreshing seat status:', error);
        }
    };    // Fetch seats data from API
    const fetchSeats = async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
            const response = await fetch(`/api/seats?showtimeId=${showtimeId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("API không trả về dữ liệu JSON");
            }

            const data = await response.json();

            if (data.success) {
                // Map dữ liệu từ API sang định dạng của component
                const mappedSeats = data.data.map((seat: any) => ({
                    id: `${seat.seat_row}${seat.seat_number.toString().padStart(2, '0')}`,
                    row: seat.seat_row,
                    number: seat.seat_number.toString().padStart(2, '0'),
                    type: seat.seat_type.toLowerCase(),
                    status: seat.status,
                    price: seat.price,
                    position: parseInt(seat.seat_number)
                }));

                // Debug: Check for duplicates
                const seatIds = mappedSeats.map((seat: any) => seat.id);
                const duplicates = seatIds.filter((id: string, index: number) => seatIds.indexOf(id) !== index);
                if (duplicates.length > 0) {
                    console.error('🚨 Duplicate seat IDs found:', duplicates);
                    console.error('🚨 All seat data:', mappedSeats);
                }

                // Remove duplicates by keeping the first occurrence
                const uniqueSeats = mappedSeats.filter((seat: any, index: number, self: any[]) =>
                    self.findIndex(s => s.id === seat.id) === index
                );

                console.log('✅ Seats loaded:', {
                    total: mappedSeats.length,
                    unique: uniqueSeats.length,
                    duplicatesRemoved: mappedSeats.length - uniqueSeats.length
                });

                setSeats(uniqueSeats);
            } else {
                throw new Error(data.error || 'Lỗi khi tải thông tin ghế');
            }
        } catch (error) {
            console.error("Failed to load seats:", error);
            setLoadError(error instanceof Error ? error.message : 'Không thể tải thông tin ghế từ server');
            setSeats([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load seats when component mounts or showtimeId changes
    useEffect(() => {
        if (showtimeId) {
            fetchSeats();
        }
    }, [showtimeId]);

    // Tính tổng tiền khi chọn ghế
    useEffect(() => {
        const total = selectedSeats.reduce((sum, seatId) => {
            const seat = seats.find(s => s.id === seatId);
            return sum + (seat?.price || 0);
        }, 0);
        // Total price calculation (can be used for display if needed)
        console.log('Total price:', total);
    }, [selectedSeats, seats]);

    // Effect để thông báo cho component cha khi selectedSeats thay đổi
    useEffect(() => {
        onConfirm(selectedSeats);
    }, [selectedSeats, onConfirm]);

    // Function to check if seat type is compatible with selected tickets
    const isSeatTypeCompatible = (seatType: 'regular' | 'couple' | 'vip' | 'imax') => {
        // Get selected ticket types
        const selectedTicketTypes = Object.keys(ticketSelection).filter(typeId => ticketSelection[parseInt(typeId)] > 0);

        console.log('🔍 Checking compatibility:', {
            seatType,
            selectedTicketTypes,
            ticketSelection
        });

        // Define STRICT compatibility rules - each ticket type can only use specific seat type
        // Ticket type 1: Vé Regular (chỉ được chọn ghế Regular)
        // Ticket type 2: Vé Couple (chỉ được chọn ghế Couple)
        // Ticket type 3: Vé VIP (chỉ được chọn ghế VIP)
        // Ticket type 4: Vé IMAX (chỉ được chọn ghế IMAX)

        const compatibilityRules: { [key: string]: string[] } = {
            '1': ['regular'], // Vé Regular → chỉ ghế Regular
            '2': ['couple'], // Vé Couple → chỉ ghế Couple
            '3': ['vip'], // Vé VIP → chỉ ghế VIP
            '4': ['imax'] // Vé IMAX → chỉ ghế IMAX
        };

        console.log('📋 Compatibility rules:', compatibilityRules);

        // Check if any selected ticket type is compatible with this seat type
        const result = selectedTicketTypes.some(typeId => {
            const allowedSeatTypes = compatibilityRules[typeId] || ['regular'];
            const isAllowed = allowedSeatTypes.includes(seatType);
            console.log(`🎫 Ticket ${typeId} allows [${allowedSeatTypes.join(', ')}] - seat ${seatType}: ${isAllowed}`);
            return isAllowed;
        });

        console.log('✅ Final compatibility result:', result);
        return result;
    };

    // Function to get ticket type names for error messages
    const getTicketTypeNames = () => {
        const ticketTypeNames: { [key: string]: string } = {
            '1': 'Vé Regular',
            '2': 'Vé Couple',
            '3': 'Vé VIP',
            '4': 'Vé IMAX'
        };

        const selectedTypes = Object.keys(ticketSelection)
            .filter(typeId => ticketSelection[parseInt(typeId)] > 0)
            .map(typeId => ticketTypeNames[typeId] || `Loại ${typeId}`);

        return selectedTypes.join(', ');
    };

    // Cập nhật phần xử lý chọn ghế với seat locking
    const handleSeatSelect = async (seatId: string) => {
        const selectedSeat = seats.find(seat => seat.id === seatId);
        if (!selectedSeat) return;

        console.log('🎯 Seat selection attempt:', {
            seatId,
            seatType: selectedSeat.type,
            ticketSelection,
            selectedTicketTypes: Object.keys(ticketSelection).filter(typeId => ticketSelection[parseInt(typeId)] > 0)
        });

        // Check seat type compatibility before selection
        const isCompatible = isSeatTypeCompatible(selectedSeat.type);
        console.log('🔍 Compatibility result:', isCompatible);

        if (!isCompatible) {
            const seatTypeNames = {
                'regular': 'Ghế Thường',
                'couple': 'Ghế Đôi',
                'vip': 'Ghế VIP',
                'imax': 'Ghế IMAX'
            };

            console.log('❌ Showing compatibility alert');
            alert(`Loại vé "${getTicketTypeNames()}" không thể sử dụng ${seatTypeNames[selectedSeat.type] || selectedSeat.type}. Vui lòng chọn ghế phù hợp với loại vé đã chọn.`);
            return;
        }

        // Handle seat selection/deselection
        const isCurrentlySelected = selectedSeats.includes(seatId);

        if (isCurrentlySelected) {
            // Deselecting seat - unlock it
            await unlockSeat(showtimeId, seatId);
            setSelectedSeats(prev => prev.filter(id => id !== seatId));
        } else {
            // Selecting seat - check limits and lock it
            if (selectedSeats.length >= totalTickets) {
                setErrorMessage(`Bạn chỉ được chọn ${totalTickets} ghế theo số vé đã chọn`);
                return;
            }

            // Try to lock the seat
            const lockSuccess = await lockSeat(showtimeId, seatId);
            if (lockSuccess) {
                setSelectedSeats(prev => [...prev, seatId]);
            }
        }
    };

    // Nhóm ghế theo hàng với kiểm tra duplicate
    const groupedSeats = seats.reduce<Record<string, Seat[]>>((acc, seat) => {
        if (!acc[seat.row]) {
            acc[seat.row] = [];
        }

        // Kiểm tra xem ghế đã tồn tại trong hàng chưa
        const existingSeat = acc[seat.row].find(s => s.id === seat.id);
        if (!existingSeat) {
            acc[seat.row].push(seat);
        } else {
            console.warn(`🚨 Duplicate seat ${seat.id} found in row ${seat.row}, skipping...`);
        }

        return acc;
    }, {}); if (isLoading) {
        return <div className="text-center p-10 text-white">Đang tải sơ đồ ghế...</div>;
    }

    if (loadError) {
        return (
            <div className="bg-gray-900 p-6 rounded-lg">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <h3 className="font-bold text-lg mb-2">Không thể tải thông tin ghế</h3>
                        <p>{loadError}</p>
                    </div>
                    <button
                        onClick={() => {
                            setLoadError(null);
                            setIsLoading(true);
                            // Retry loading
                            if (showtimeId) {
                                fetchSeats();
                            }
                        }}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (seats.length === 0) {
        return (
            <div className="bg-gray-900 p-6 rounded-lg">
                <div className="text-center text-white">
                    <h3 className="text-lg font-bold mb-2">Không có thông tin ghế</h3>
                    <p>Không tìm thấy thông tin ghế cho suất chiếu này.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-white text-xl font-bold">CHỌN GHẾ - {screenName}</h2>

                {/* Database polling status */}
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-xs text-gray-400">Database Polling</span>
                </div>
            </div>

            {/* Màn hình */}
            <div className="text-center mb-8">
                <div className="h-0.5 bg-white w-4/5 mx-auto mb-2 rounded-t-full"></div>
                <div className="text-white text-sm mb-4">Màn hình</div>
            </div>

            {/* Sơ đồ ghế */}
            <div className="flex flex-col items-center space-y-1">
                {Object.entries(groupedSeats).map(([row, rowSeats]) => {
                    // Sắp xếp ghế theo vị trí
                    const sortedRowSeats = [...rowSeats].sort((a, b) => a.position - b.position);

                    return (
                        <div key={row} className="flex items-center">
                            <span className="text-white w-6 text-center">{row}</span>
                            <div className="flex">
                                {row === 'I' ? (
                                    // Hiển thị ghế hàng I với khoảng cách
                                    <>
                                        {sortedRowSeats.slice(0, 2).map(seat => (
                                            <Seat
                                                key={seat.id}
                                                id={seat.id}
                                                row={seat.row}
                                                number={seat.number}
                                                type={seat.type}
                                                status={
                                                    selectedSeats.includes(seat.id)
                                                        ? 'selected'
                                                        : seat.status === 'booked'
                                                            ? 'booked'
                                                            : unavailableSeats.has(seat.id)
                                                                ? 'locked'
                                                                : 'available'
                                                }
                                                price={seat.price}
                                                onSelect={handleSeatSelect}
                                            />
                                        ))}
                                        {/* Khoảng trống giữa */}
                                        <div className="w-28"></div>
                                        {sortedRowSeats.slice(2, 4).map(seat => (
                                            <Seat
                                                key={seat.id}
                                                id={seat.id}
                                                row={seat.row}
                                                number={seat.number}
                                                type={seat.type}
                                                status={
                                                    selectedSeats.includes(seat.id)
                                                        ? 'selected'
                                                        : seat.status === 'booked'
                                                            ? 'booked'
                                                            : unavailableSeats.has(seat.id)
                                                                ? 'locked'
                                                                : 'available'
                                                }
                                                price={seat.price}
                                                onSelect={handleSeatSelect}
                                            />
                                        ))}
                                    </>
                                ) : (
                                    // Hiển thị ghế hàng thông thường
                                    sortedRowSeats.map(seat => (
                                        <Seat
                                            key={seat.id}
                                            id={seat.id}
                                            row={seat.row}
                                            number={seat.number}
                                            type={seat.type}
                                            status={
                                                selectedSeats.includes(seat.id)
                                                    ? 'selected'
                                                    : seat.status === 'booked'
                                                        ? 'booked'
                                                        : unavailableSeats.has(seat.id)
                                                            ? 'locked'
                                                            : 'available'
                                            }
                                            price={seat.price}
                                            onSelect={handleSeatSelect}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Chú thích */}
            <div className="mt-8 flex justify-center gap-4 text-sm flex-wrap">
                <div className="flex items-center">
                    <div className="w-6 h-6 bg-white rounded mr-2"></div>
                    <span className="text-white">Ghế Thường</span>
                </div>
                <div className="flex items-center">
                    <div className="w-6 h-6 bg-pink-200 rounded mr-2"></div>
                    <span className="text-white">Ghế Đôi</span>
                </div>
                <div className="flex items-center">
                    <div className="w-6 h-6 bg-purple-200 rounded mr-2"></div>
                    <span className="text-white">Ghế VIP</span>
                </div>
                <div className="flex items-center">
                    <div className="w-6 h-6 bg-yellow-400 rounded mr-2"></div>
                    <span className="text-white">Ghế chọn</span>
                </div>
                <div className="flex items-center">
                    <div className="w-6 h-6 bg-gray-600 rounded mr-2"></div>
                    <span className="text-white">Ghế đã đặt</span>
                </div>
                <div className="flex items-center">
                    <div className="w-6 h-6 bg-red-400 rounded mr-2"></div>
                    <span className="text-white">Đang được chọn</span>
                </div>
            </div>

            {/* Thông tin tương thích loại vé */}
            <div className="mt-4 bg-blue-900 bg-opacity-50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Quy tắc chọn ghế:</h4>
                <div className="text-sm text-gray-300 space-y-1">
                    <p>• <strong>Vé Regular:</strong> Chỉ được chọn Ghế Thường (màu trắng)</p>
                    <p>• <strong>Vé Couple:</strong> Chỉ được chọn Ghế Đôi (màu hồng)</p>
                    <p>• <strong>Vé VIP:</strong> Chỉ được chọn Ghế VIP (màu tím)</p>
                    <p>• <strong>Vé IMAX:</strong> Chỉ được chọn Ghế IMAX (hàng I)</p>
                </div>

                {/* Debug info */}
                <div className="mt-3 text-xs text-gray-400">
                    <p>Debug: Tickets selected: {JSON.stringify(ticketSelection)}</p>
                    <p>Debug: Total seats loaded: {seats.length}</p>
                    <p>Debug: Sample seat types: {seats.slice(0, 3).map(s => s.type).join(', ')}</p>
                    <p>Debug: Rows: {Object.keys(groupedSeats).map(row => `${row}(${groupedSeats[row].length})`).join(', ')}</p>
                    <p>Debug: Unavailable seats: {unavailableSeats.size}</p>
                </div>
            </div>

            {/* Hiển thị thông báo lỗi nếu có */}
            {errorMessage && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{errorMessage}</span>
                </div>
            )}
        </div>
    );
}
