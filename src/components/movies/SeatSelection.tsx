import { useState, useEffect } from 'react';
interface SeatProps {
    id: string;  // Đổi thành string để dễ xử lý định dạng A01, B02...
    row: string;
    number: string;
    type: 'regular' | 'couple' | 'vip';
    status: 'available' | 'booked' | 'selected';
    price: number;
    onSelect: (id: string) => void;
}

interface SeatMapProps {
    showtimeId: number;
    cinemaName: string;
    screenName: string;
    onConfirm: (selectedSeats: string[]) => void;
    totalTickets: number; // Total number of tickets that should be selected
}

const Seat = ({ id, number, type, status, price, onSelect }: SeatProps) => {
    const getBackgroundColor = () => {
        switch (status) {
            case 'booked':
                return 'bg-gray-600 text-white';  // Ghế đã đặt
            case 'selected':
                return 'bg-yellow-400 text-black';  // Ghế đang chọn
            default:
                return type === 'couple'
                    ? 'bg-gray-200 text-black'  // Ghế đôi
                    : 'bg-white text-black';     // Ghế thường
        }
    };

    return (
        <button
            onClick={() => status !== 'booked' && onSelect(id)}
            disabled={status === 'booked'}
            className={`
                w-10 h-10 rounded m-0.5 text-xs font-semibold transition-colors
                ${getBackgroundColor()}
                ${status === 'booked' ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
            `}
            title={`Ghế ${id} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}`}
        >
            {number}
        </button>
    );
};

export default function SeatMap({ showtimeId, screenName, onConfirm, totalTickets }: SeatMapProps) {
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [seats, setSeats] = useState<Seat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    interface Seat {
        id: string;
        row: string;
        number: string;
        type: 'regular' | 'couple' | 'vip';
        status: 'available' | 'booked' | 'selected';
        price: number;
        position: number;
    }

    // Tạo dữ liệu mẫu giống với hình ảnh được chia sẻ
    const generateSampleSeats = (): Seat[] => {
        const sampleSeats: Seat[] = [];
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
        const priceRegular = 90000;
        const priceCouple = 160000;

        // Ghế đã đặt mẫu (để hiển thị UI)
        const bookedSeats = ['E04', 'E05', 'E06', 'E07', 'E08', 'F05', 'F06', 'F07', 'F08'];

        // Ghế đôi
        const coupleSeats = ['E06', 'E07', 'E08', 'F06', 'F07', 'F08'];

        for (const row of rows) {
            if (row === 'I') {
                // Hàng I chỉ có 4 ghế đặc biệt (I01, I02, I03, I04)
                for (const num of ['01', '02', '03', '04']) {
                    // Giả định I01, I02 ở bên trái, I03, I04 ở bên phải
                    if (num === '01' || num === '02') {
                        sampleSeats.push({
                            id: `${row}${num}`,
                            row,
                            number: num,
                            type: 'regular',
                            status: bookedSeats.includes(`${row}${num}`) ? 'booked' : 'available',
                            price: priceRegular,
                            position: parseInt(num) // Vị trí bên trái
                        });
                    } else {
                        sampleSeats.push({
                            id: `${row}${num}`,
                            row,
                            number: num,
                            type: 'regular',
                            status: bookedSeats.includes(`${row}${num}`) ? 'booked' : 'available',
                            price: priceRegular,
                            position: parseInt(num) + 4 // Vị trí bên phải (để tạo khoảng cách)
                        });
                    }
                }
            } else {
                // Các hàng khác có 12 ghế
                for (let i = 1; i <= 12; i++) {
                    const num = i.toString().padStart(2, '0');
                    const seatId = `${row}${num}`;
                    const isCouple = coupleSeats.includes(seatId);

                    sampleSeats.push({
                        id: seatId,
                        row,
                        number: num,
                        type: isCouple ? 'couple' : 'regular',
                        status: bookedSeats.includes(seatId) ? 'booked' : 'available',
                        price: isCouple ? priceCouple : priceRegular,
                        position: i
                    });
                }
            }
        }

        return sampleSeats;
    };

    // Tải dữ liệu ghế từ API
    useEffect(() => {
        const fetchSeats = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/seats?showtimeId=${showtimeId}`);

                // Kiểm tra response
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
                    setSeats(mappedSeats);
                } else {
                    throw new Error(data.error || 'Lỗi khi tải thông tin ghế');
                }
            } catch (error) {
                console.error("Failed to load seats:", error);
                // Trong môi trường development, sử dụng dữ liệu mẫu
                if (process.env.NODE_ENV === 'development') {
                    const sampleData = generateSampleSeats();
                    setSeats(sampleData);
                }
            } finally {
                setIsLoading(false);
            }
        };

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

    // Cập nhật phần xử lý chọn ghế
    const handleSeatSelect = (seatId: string) => {
        setSelectedSeats(prev => {
            // Nếu đã đạt đến số lượng vé tối đa và đang thêm ghế mới
            if (prev.length >= totalTickets && !prev.includes(seatId)) {
                setErrorMessage(`Bạn chỉ được chọn ${totalTickets} ghế theo số vé đã chọn`);
                return prev;
            }

            const newSelection = prev.includes(seatId)
                ? prev.filter(id => id !== seatId)
                : [...prev, seatId];

            return newSelection;
        });
    };

    // Nhóm ghế theo hàng
    const groupedSeats = seats.reduce<Record<string, Seat[]>>((acc, seat) => {
        if (!acc[seat.row]) {
            acc[seat.row] = [];
        }
        acc[seat.row].push(seat);
        return acc;
    }, {});

    if (isLoading) {
        return <div className="text-center p-10">Đang tải sơ đồ ghế...</div>;
    }

    return (
        <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-white text-xl font-bold text-center mb-4">CHỌN GHẾ - {screenName}</h2>

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
                                                status={selectedSeats.includes(seat.id) ? 'selected' : seat.status}
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
                                                status={selectedSeats.includes(seat.id) ? 'selected' : seat.status}
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
                                            status={selectedSeats.includes(seat.id) ? 'selected' : seat.status}
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
            <div className="mt-8 flex justify-center gap-6 text-sm flex-wrap">
                <div className="flex items-center">
                    <div className="w-6 h-6 bg-white rounded mr-2"></div>
                    <span className="text-white">Ghế Thường</span>
                </div>
                <div className="flex items-center">
                    <div className="w-6 h-6 bg-gray-200 rounded mr-2"></div>
                    <span className="text-white">Ghế Đôi (2 Người)</span>
                </div>
                <div className="flex items-center">
                    <div className="w-6 h-6 bg-yellow-400 rounded mr-2"></div>
                    <span className="text-white">Ghế chọn</span>
                </div>
                <div className="flex items-center">
                    <div className="w-6 h-6 bg-gray-600 rounded mr-2"></div>
                    <span className="text-white">Ghế đã đặt</span>
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
