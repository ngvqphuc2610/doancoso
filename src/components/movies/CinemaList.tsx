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
                        className="p-4 cursor-pointer"
                        onClick={() => onCinemaSelect(cinema.id)}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-yellow-400 font-semibold text-xl">{cinema.name}</h4>
                                <p className="text-white text-sm">{cinema.address}</p>
                            </div>
                            <div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-6 w-6 text-white transition-transform ${selectedCinema === cinema.id ? 'rotate-180' : ''}`}
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
                                    <div key={screenType || `screentype-${index}`} className="mb-6">
                                        {/* Loại phòng chiếu - Hiển thị screenType từ API */}
                                        <div className="mb-3">
                                            <h5 className="text-white font-medium text-lg">{screenType || 'Standard'}</h5>
                                        </div>

                                        {/* Danh sách các suất chiếu cho loại phòng này */}
                                        <div className="flex flex-wrap gap-2">
                                            {cinema.showTimes
                                                .filter(time => time.roomType === screenType)
                                                .map(time => (
                                                    <Button
                                                        key={time.id}
                                                        onClick={() => onTimeSelect(time.id)}
                                                        variant={selectedTime === time.id ? "custom13" : "custom12"}
                                                        size="custom12"
                                                        disabled={time.available_seats === 0}
                                                        title={time.available_seats === 0 ? 'Hết ghế' : `Còn ${time.available_seats} ghế trống`}
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
