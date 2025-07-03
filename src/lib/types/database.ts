// Database types for Movies application

// Common types
export type ID = number;
export type Timestamp = string;

// Status types as union types thay vì string
export type OrderStatus = 'pending' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type MovieStatus = 'coming_soon' | 'now_showing' | 'hidden';
export type CinemaStatus = 'active' | 'inactive' | 'maintenance';
export type ScreenStatus = 'active' | 'inactive' | 'maintenance';
export type ShowtimeStatus = 'available' | 'sold_out' | 'cancelled';
export type UserStatus = 'active' | 'inactive' | 'banned';
export type UserRole = 'admin' | 'staff' | 'customer';

// Movie related types
export interface Movie {
    id_movie: ID;
    title: string;
    original_title?: string;
    director?: string;
    actors?: string;
    duration?: number;
    release_date?: string;
    end_date?: string;
    language?: string;
    country?: string;
    description?: string;
    poster_image?: string;
    trailer_url?: string;
    age_restriction?: string;
    status: MovieStatus;
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

// Cinema related types
export interface Cinema {
    id_cinema: ID;
    cinema_name: string;
    address: string;
    city: string;
    phone?: string;
    email?: string;
    description?: string;
    status: CinemaStatus;
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

// Screen related types
export interface Screen {
    id_screen: ID;
    id_cinema: ID;
    screen_name: string;
    screen_type: string;
    capacity: number;
    status: ScreenStatus;
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

// Showtime related types
export interface Showtime {
    id_showtime: ID;
    id_movie: ID;
    id_screen: ID;
    show_date: string;
    start_time: string;
    end_time: string;
    price: number;
    status: ShowtimeStatus;
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

// User related types
export interface User {
    id_user: ID;
    username: string;
    email: string;
    password: string; // Hashed password
    full_name?: string;
    phone?: string;
    address?: string;
    date_of_birth?: string;
    role: UserRole;
    status: UserStatus;
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

// Booking related types
export interface Booking {
    id_booking: ID;
    id_user: ID;
    id_showtime: ID;
    booking_date: Timestamp;
    total_price: number;
    status: BookingStatus;
    payment_status: PaymentStatus;
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

// Seat related types
export interface Seat {
    id_seat: ID;
    id_screen: ID;
    seat_row: string;
    seat_number: number;
    seat_type: 'standard' | 'vip' | 'couple';
    status: 'active' | 'inactive' | 'maintenance';
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

// Booking detail related types
export interface BookingDetail {
    id_booking_detail: ID;
    id_booking: ID;
    id_seat: ID;
    price: number;
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

// Product related types
export interface Product {
    id_product: ID;
    product_name: string;
    description?: string;
    price: number;
    image?: string;
    product_type: number;
    status: 'active' | 'inactive';
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

// Genre related types
export interface Genre {
    id_genre: ID;
    genre_name: string;
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

// GenreMovie related types
export interface GenreMovie {
    id_genre_movie: ID;
    id_genre: ID;
    id_movie: ID;
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

// Utility type for API responses
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
