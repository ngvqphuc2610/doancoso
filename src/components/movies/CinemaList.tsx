import { Button } from '@/components/ui/button';

interface ShowTime {
    id: number;
    time: string;
    endTime: string;
    date: string;
    room: string;
    roomType: string;
    format: string;
    price: number;
    available_seats: number;
    total_seats: number;
}

interface Cinema {
    id: number;
    name: string;
    address: string;
    showTimes: ShowTime[];
}

interface CinemaListProps {
    cinemas: Cinema[];
    selectedCinema: number | null;
    selectedTime: number | null;
    onCinemaSelect: (cinemaId: number) => void;
    onTimeSelect: (timeId: number) => void;
}

export default function CinemaList({
    cinemas,
    selectedCinema,
    selectedTime,
    onCinemaSelect,
    onTimeSelect
}: CinemaListProps) {
    return (
        <div className="space-y-6">
            {cinemas.map(cinema => (
                <div key={cinema.id} className="bg-purple-800 rounded-lg overflow-hidden">
                    {/* Header phần rạp phim */}
                    <div
                        className="p-3 sm:p-4 cursor-pointer"
                        onClick={() => onCinemaSelect(cinema.id)}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-yellow-400 font-semibold text-lg sm:text-xl truncate">{cinema.name}</h4>
                                <p className="text-white text-xs sm:text-sm mt-1 line-clamp-2">{cinema.address}</p>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-5 w-5 sm:h-6 sm:w-6 text-white transition-transform ${selectedCinema === cinema.id ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Phần suất chiếu chỉ hiển thị khi rạp được chọn */}
                    {selectedCinema === cinema.id && (
                        <div className="p-4 pt-0">
                            {/* Group showtimes by screenType */}
                            {(() => {
                                // Get unique screen types
                                const screenTypes = [...new Set(cinema.showTimes.map(time => time.roomType))];

                                return screenTypes.map((screenType, index) => (
                                    <div key={screenType || `screentype-${index}`} className="mb-4 sm:mb-6">
                                        {/* Loại phòng chiếu - Hiển thị screenType từ API */}
                                        <div className="mb-2 sm:mb-3">
                                            <h5 className="text-white font-medium text-base sm:text-lg">{screenType || 'Standard'}</h5>
                                        </div>

                                        {/* Danh sách các suất chiếu cho loại phòng này */}
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                                            {cinema.showTimes
                                                .filter(time => time.roomType === screenType)
                                                .map(time => (
                                                    <Button
                                                        key={time.id}
                                                        onClick={() => onTimeSelect(time.id)}
                                                        variant={selectedTime === time.id ? "custom2" : "custom3"}
                                                        size="sm"
                                                        width="custom3"    
                                                        disabled={time.available_seats === 0}
                                                        title={time.available_seats === 0 ? 'Hết ghế' : `Còn ${time.available_seats} ghế trống`}
                                                        className="text-xs sm:text-sm gap-2 "
                                                    >
                                                        {time.time}
                                                    </Button>
                                                ))}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
