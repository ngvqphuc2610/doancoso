import { useState, useCallback } from 'react';
import { TicketSelection } from '@/types/showtime';

export function useSelectionState() {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedCinema, setSelectedCinema] = useState<number | null>(null);
    const [selectedTime, setSelectedTime] = useState<number | null>(null);
    const [selectedCity, setSelectedCity] = useState('Hồ Chí Minh');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Ticket selection
    const [ticketSelection, setTicketSelection] = useState<TicketSelection>({});
    const [totalTicketPrice, setTotalTicketPrice] = useState<number>(0);
    const [showTicketSelector, setShowTicketSelector] = useState<boolean>(false);
    
    // Seat selection
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [showBookingBar, setShowBookingBar] = useState<boolean>(false);

    const handleDateSelection = useCallback((date: string) => {
        setSelectedDate(date);
        setSelectedCinema(null);
        setSelectedTime(null);
        setTicketSelection({});
        setTotalTicketPrice(0);
        setShowTicketSelector(false);
        setSelectedSeats([]);
        setShowBookingBar(false);
    }, []);

    const handleCinemaSelection = useCallback((cinemaId: number) => {
        if (selectedCinema === cinemaId) {
            setSelectedCinema(null);
        } else {
            setSelectedCinema(cinemaId);
            setSelectedTime(null);
            setTicketSelection({});
            setTotalTicketPrice(0);
            setShowTicketSelector(false);
            setSelectedSeats([]);
            setShowBookingBar(false);
        }
    }, [selectedCinema]);

    const handleTimeSelection = useCallback((timeId: number) => {
        if (timeId && typeof timeId === 'number') {
            setSelectedTime(timeId);
            setTicketSelection({});
            setTotalTicketPrice(0);
            setShowTicketSelector(false);
            setSelectedSeats([]);
            setShowBookingBar(false);
        }
    }, []);

    const handleCitySelection = useCallback((city: string) => {
        setSelectedCity(city);
        setIsDropdownOpen(false);
    }, []);

    const handleTicketSelection = useCallback((selection: TicketSelection, totalPrice: number) => {
        setTicketSelection(selection);
        setTotalTicketPrice(totalPrice);
        
        const totalTickets = Object.values(selection).reduce((sum, qty) => sum + qty, 0);
        setShowTicketSelector(totalTickets > 0);
    }, []);

    const handleSeatSelection = useCallback((seats: string[]) => {
        setSelectedSeats(seats);
        setShowBookingBar(seats.length > 0);
    }, []);

    const resetSelections = useCallback(() => {
        setSelectedSeats([]);
        setShowBookingBar(false);
        setTicketSelection({});
        setTotalTicketPrice(0);
        setShowTicketSelector(false);
    }, []);

    return {
        // State
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
        
        // Actions
        handleDateSelection,
        handleCinemaSelection,
        handleTimeSelection,
        handleCitySelection,
        handleTicketSelection,
        handleSeatSelection,
        resetSelections,
        setIsDropdownOpen
    };
}
