import { getCinemas, getCinemaById, getScreensByCinema, getCinemaOperationHours } from './cinemaDb';

export interface Cinema {
    id: string;
    name: string;
    address: string;
    city?: string;
    description?: string;
    image?: string;
    contact_number?: string;
    email?: string;
}

export interface Showtime {
    time: string;
    link: string;
}

export interface CinemaShowtimes {
    cinema: Cinema;
    movies: {
        id: string;
        title: string;
        poster: string;
        genre?: string;
        duration?: number;
        format?: string;
        showTimes: {
            standard?: Showtime[];
            deluxe?: Showtime[];
        };
    }[];
}

// Get all cinemas from database
export async function getAllCinemas(): Promise<Cinema[]> {
    try {
        return await getCinemas();
    } catch (error) {
        console.error("Lỗi khi lấy danh sách rạp:", error);
        return [];
    }
}

// Get cinema details by ID
export async function getCinemaDetails(id: string): Promise<Cinema | null> {
    try {
        return await getCinemaById(id);
    } catch (error) {
        console.error(`Lỗi khi lấy thông tin rạp ID ${id}:`, error);
        return null;
    }
}

// Fallback cinema data in case of database errors


// Cấu trúc giờ chiếu
export const standardShowtimes: Showtime[] = [
    { time: '10:30', link: '#' },
    { time: '12:45', link: '#' },
    { time: '15:20', link: '#' },
    { time: '18:30', link: '#' },
    { time: '20:15', link: '#' },
    { time: '22:45', link: '#' }
];

export const deluxeShowtimes: Showtime[] = [
    { time: '11:15', link: '#' },
    { time: '14:30', link: '#' },
    { time: '19:45', link: '#' },
    { time: '23:00', link: '#' }
];