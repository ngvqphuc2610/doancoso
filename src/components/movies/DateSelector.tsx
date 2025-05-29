import { Button } from '@/components/ui/button';

interface ShowtimeData {
    date: string;
    cinemas: any[];
}

interface DateSelectorProps {
    showtimes: ShowtimeData[];
    selectedDate: string;
    onDateSelect: (date: string) => void;
}

export default function DateSelector({ showtimes, selectedDate, onDateSelect }: DateSelectorProps) {
    return (
        <div className="mb-6 flex justify-center">
            <div className="flex gap-4 overflow-x-auto pb-2">
                {showtimes.map(showtime => (
                    <Button
                        key={showtime.date}
                        onClick={() => onDateSelect(showtime.date)}
                        variant={selectedDate === showtime.date ? "custom9" : "custom8"}
                        size="custom8"
                        width="custom8"
                        className={`py-8 rounded whitespace-nowrap ${selectedDate === showtime.date ? '' : ''}`}
                    >
                        {(() => {
                            const date = new Date(showtime.date);
                            const day = date.getDate();
                            const month = date.getMonth() + 1;
                            const weekday = date.toLocaleDateString('vi-VN', { weekday: 'long' });
                            return (
                                <>
                                    {`${day}/${month}`}
                                    <br />
                                    {weekday.toUpperCase()}
                                </>
                            );
                        })()}
                    </Button>
                ))}
            </div>
        </div>
    );
}
