import { Movie, Cinema, Showtime, User, Booking, Product, Genre } from './database';

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    message?: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: any;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Movie API Types
export interface MovieListParams {
    page?: number;
    limit?: number;
    status?: string;
    genre?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface MovieResponse extends Movie {
    genres?: string[];
}

// Cinema API Types
export interface CinemaListParams {
    page?: number;
    limit?: number;
    city?: string;
    status?: string;
    search?: string;
}

export interface CinemaWithScreens extends Cinema {
    screens?: {
        id_screen: number;
        screen_name: string;
        screen_type: string;
        capacity: number;
    }[];
}

// Showtime API Types
export interface ShowtimeListParams {
    movieId?: number;
    cinemaId?: number;
    date?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
}

export interface ShowtimeWithDetails extends Showtime {
    movie_title?: string;
    cinema_name?: string;
    screen_name?: string;
    available_seats?: number;
    total_seats?: number;
}

// User API Types
export interface UserLoginRequest {
    email: string;
    password: string;
}

export interface UserRegisterRequest {
    username: string;
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
}

export interface UserLoginResponse {
    user: Omit<User, 'password'>;
    token: string;
}

// Booking API Types
export interface CreateBookingRequest {
    showtime_id: number;
    seats: number[];
    products?: {
        product_id: number;
        quantity: number;
    }[];
}

export interface BookingWithDetails extends Booking {
    user?: Omit<User, 'password'>;
    showtime?: ShowtimeWithDetails;
    seats?: {
        id_seat: number;
        seat_row: string;
        seat_number: number;
        seat_type: string;
    }[];
    products?: {
        id_product: number;
        product_name: string;
        quantity: number;
        price: number;
    }[];
}