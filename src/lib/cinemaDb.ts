"use server";

import { query } from './db';

export interface Cinema {
    id: string;
    name: string;
    address: string;
    city: string;
    description?: string;
    image?: string;
    contact_number?: string;
    email?: string;
    status?: string;
}

export interface Screen {
    id: string;
    cinema_id: string;
    screen_name: string;
    capacity: number;
    screen_type: string;
    status: string;
}

export async function getCinemas(): Promise<Cinema[]> {
    try {
        const cinemas = await query<any[]>('SELECT * FROM cinemas WHERE status = "active" ORDER BY city, cinema_name');

        // Format the response to match the expected Cinema interface
        return cinemas.map(cinema => ({
            id: cinema.id_cinema.toString(),
            name: cinema.cinema_name,
            address: cinema.address,
            city: cinema.city,
            description: cinema.description,
            image: cinema.image,
            contact_number: cinema.contact_number,
            email: cinema.email,
            status: cinema.status
        }));
    } catch (error) {
        console.error("Lỗi khi lấy danh sách rạp chiếu phim:", error);
        return []; // Trả về mảng rỗng nếu có lỗi
    }
}

export async function getCinemaById(id: string): Promise<Cinema | null> {
    try {
        const cinemas = await query<any[]>('SELECT * FROM cinemas WHERE id_cinema = ?', [id]);

        if (cinemas.length === 0) {
            return null;
        }

        const cinema = cinemas[0];
        return {
            id: cinema.id_cinema.toString(),
            name: cinema.cinema_name,
            address: cinema.address,
            city: cinema.city,
            description: cinema.description,
            image: cinema.image,
            contact_number: cinema.contact_number,
            email: cinema.email,
            status: cinema.status
        };
    } catch (error) {
        console.error(`Lỗi khi lấy thông tin rạp chiếu phim ID ${id}:`, error);
        return null;
    }
}

export async function getScreensByCinema(cinemaId: string): Promise<Screen[]> {
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

export async function getCinemaOperationHours(cinemaId: string): Promise<any[]> {
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
