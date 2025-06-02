import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import * as dateUtils from '@/utils/dateUtils';

interface ShowtimeData {
    date: string; // Expected in YYYY-MM-DD format
    cinemas: any[];
}

interface DateSelectorProps {
    showtimes: ShowtimeData[];
    selectedDate: string;
    onDateSelect: (date: string) => void;
}

export default function DateSelector({ showtimes, selectedDate, onDateSelect }: DateSelectorProps) {
    // State to track if there was an error with a date
    const [dateErrors, setDateErrors] = useState<Record<string, boolean>>({});
    const [debugInfo, setDebugInfo] = useState<string>('');

    // Validate all dates when showtimes change
    useEffect(() => {
        const errors: Record<string, boolean> = {};

        console.log(`DateSelector: Received ${showtimes?.length || 0} showtimes`);

        if (!showtimes || showtimes.length === 0) {
            setDebugInfo('No showtimes data available');
            return;
        }

        // Log out all dates for debugging
        const allDates = showtimes.map(st => st.date);
        console.log('All dates in showtimes:', allDates);
        setDebugInfo(`Found ${allDates.length} unique dates`);

        showtimes.forEach(showtime => {
            // Use our dateUtils to validate the date format is YYYY-MM-DD
            if (!dateUtils.isValidDateFormat(showtime.date, 'YYYY-MM-DD')) {
                console.error(`Invalid date format: ${showtime.date}, expected YYYY-MM-DD`);
                errors[showtime.date] = true;
            }

            // Also validate it's a valid date (e.g., not 2023-02-31)
            const date = new Date(showtime.date);
            if (isNaN(date.getTime())) {
                console.error(`Invalid date value: ${showtime.date}`);
                errors[showtime.date] = true;
            }

            // Check if date has any cinemas
            if (!showtime.cinemas || showtime.cinemas.length === 0) {
                console.warn(`Date ${showtime.date} has no cinemas`);
            }
        });

        setDateErrors(errors);
    }, [showtimes]);

    return (
        <div className="mb-6 flex justify-center">
            <div className="flex gap-4 overflow-x-auto pb-2">
                {showtimes.map(showtime => {
                    // Skip rendering buttons for invalid dates
                    if (dateErrors[showtime.date]) return null;

                    return (
                        <Button
                            key={showtime.date}
                            onClick={() => {
                                console.log('Selected date:', showtime.date);
                                onDateSelect(showtime.date);
                            }}
                            variant={selectedDate === showtime.date ? "custom9" : "custom8"}
                            size="custom8"
                            width="custom8"
                            className={`py-8 rounded whitespace-nowrap ${selectedDate === showtime.date ? '' : ''}`}
                            title={showtime.date} // Add title attribute for debugging
                        >
                            {(() => {
                                try {
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
                                } catch (error) {
                                    console.error('Error formatting date:', showtime.date, error);
                                    return (
                                        <>
                                            Error
                                            <br />
                                            Invalid Date
                                        </>
                                    );
                                }
                            })()}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
