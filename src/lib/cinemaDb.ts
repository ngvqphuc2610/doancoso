"use server";

import { Cinema as DBCinema } from './types/database';
import { query } from './db';

// Frontend interface - separate from database type
interface FrontendCinema {
    id: string;
    name: string;
    address: string;
    city: string;
    description: string;
    image: string;
    contact_number: string;
    email: string;
    status: string;
}

// Convert database cinema to frontend format
function convertDbCinemaToFrontend(cinema: DBCinema): FrontendCinema {
    return {
        id: cinema.id_cinema.toString(),
        name: cinema.cinema_name,
        address: cinema.address,
        city: cinema.address.split(',').pop()?.trim() || '',
        description: '',
        image: '',
        contact_number: cinema.phone || '',
        email: cinema.phone || '',
        status: cinema.status
    };
}

export async function getCinemas(): Promise<FrontendCinema[]> {
    try {
        const cinemas = await query<DBCinema[]>('SELECT * FROM cinemas WHERE status = "active" ORDER BY city, cinema_name');
        return cinemas.map(convertDbCinemaToFrontend);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách rạp chiếu phim:", error);
        return [];
    }
}

export async function getCinemaById(id: string): Promise<FrontendCinema | null> {
    try {
        const cinemas = await query<DBCinema[]>('SELECT * FROM cinemas WHERE id_cinema = ?', [id]);

        if (cinemas.length === 0) {
            return null;
        }

        return convertDbCinemaToFrontend(cinemas[0]);
    } catch (error) {
        console.error(`Lỗi khi lấy thông tin rạp chiếu phim ID ${id}:`, error);
        return null;
    }
}

export async function getScreensByCinema(cinemaId: string) {
    try {
        const screens = await query<any[]>(
            'SELECT * FROM screen WHERE id_cinema = ? AND status = "active" ORDER BY screen_name',
            [cinemaId]
        );

        return screens.map(screen => ({
            id: screen.id_screen.toString(),
            cinema_id: screen.id_cinema.toString(),
            screen_name: screen.screen_name,
            capacity: screen.capacity,
            screen_type: screen.screen_type,
            status: screen.status
        }));
    } catch (error) {
        console.error(`Lỗi khi lấy danh sách phòng chiếu của rạp ID ${cinemaId}:`, error);
        return [];
    }
}

export async function getCinemaOperationHours(cinemaId: string) {
    try {
        const hours = await query<any[]>(
            'SELECT * FROM operation_hours WHERE id_cinema = ? ORDER BY day_of_week',
            [cinemaId]
        );

        return hours;
    } catch (error) {
        console.error(`Lỗi khi lấy giờ hoạt động của rạp ID ${cinemaId}:`, error);
        return [];
    }
}
