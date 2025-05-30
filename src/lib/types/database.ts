// Database types for Movies application

// Common types
export type ID = number;
export type Timestamp = string;

// Status types
export type OrderStatus = 'pending' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

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
    status: 'coming_soon' | 'now_showing' | 'hidden';
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

export interface Genre {
    id_genre: ID;
    genre_name: string;
}

export interface GenreMovie {
    id_genre: ID;
    id_movie: ID;
}

// Cinema related types
export interface Cinema {
    id_cinema: ID;
    cinema_name: string;
    address: string;
    phone?: string;
    status: 'active' | 'inactive';
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

// Member related types
export interface Member {
    id_member: ID;
    id_user: ID;
    id_typemember: ID;
    id_membership?: ID;
    full_name?: string; // Từ bảng users
    email?: string; // Từ bảng users
    phone?: string; // Từ bảng users
    type_name?: string; // Từ bảng type_member
    membership_title?: string; // Từ bảng membership
    points: number;
    join_date: string;
    status: 'active' | 'inactive';
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

export interface TypeMember {
    id_typemember: ID;
    type_name: string;
    description?: string;
    priority: number;
}

export interface Membership {
    id_membership: ID;
    code: string;
    title: string;
    image?: string;
    link?: string;
    description?: string;
    benefits?: string;
    criteria?: string;
    status: 'active' | 'inactive';
}

// Type Product related types
export interface TypeProduct {
    id_typeproduct: ID;
    type_name: string;
}

// Product related types
export interface Product {
    id_product: ID;
    id_typeproduct?: ID;
    product_name: string;
    description?: string;
    price: number;
    image?: string;
    quantity: number;
    status: 'available' | 'unavailable';
    created_at?: Timestamp;
    updated_at?: Timestamp;
    type_name?: string; // Join với bảng type_product
}

export interface OrderProduct {
    id_order: ID;
    id_users?: ID;
    id_staff?: ID;
    order_date: Timestamp;
    total_amount: number;
    order_status: OrderStatus;
    payment_status: PaymentStatus;
}

// Payment related types
export interface Payment {
    id_payment: ID;
    id_order: ID;
    payment_method: string;
    amount: number;
    payment_status: PaymentStatus;
    payment_date: Timestamp;
    transaction_id?: string;
}

// Booking related types
export interface Booking {
    id_booking: ID;
    id_users: ID;
    booking_date: Timestamp;
    number_of_people: number;
    booking_time: string;
    status: BookingStatus;
    note?: string;
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

// Promotion related types
export interface Promotion {
    id_promotion: ID;
    promotion_name: string;
    promotion_type: 'percentage' | 'fixed' | 'special';
    discount_amount: number;
    code: string;
    start_date: string;
    end_date: string;
    usage_limit: number;
    used_count: number;
    status: 'active' | 'inactive' | 'expired';
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

// Entertainment related types
export interface Entertainment {
    id_entertainment: ID;
    id_cinema?: ID;
    title: string;
    description?: string;
    image_url?: string;
    start_date: string;
    end_date?: string;
    status: 'active' | 'inactive';
    views_count?: number;
    featured?: boolean;
    id_staff?: ID;
    cinema_name?: string;
    staff_name?: string;
}

// Contact related types
export interface Contact {
    id_contact: ID;
    full_name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    reply_status: 'pending' | 'replied';
    id_staff?: ID;
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

// Sync log related types
export interface SyncLog {
    id_log: ID;
    action: string;
    status: string;
    description: string;
    error?: string;
    started_at: Timestamp;
    completed_at?: Timestamp;
}

// Type for query result with headers
export interface QueryResultHeader {
    fieldCount?: number;
    affectedRows?: number;
    insertId?: number;
    info?: string;
    serverStatus?: number;
    warningStatus?: number;
}

export interface User {
    id_users: ID;
    username: string;
    fullname?: string;
    email: string;
    phone?: string;
    address?: string;
    password: string;
    role: 'admin' | 'user';
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

export interface Staff {
    id_staff: ID;
    staff_name: string;
    phone?: string;
    email: string;
    address?: string;
    role: string;
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

export interface OrderDetail {
    id_order: ID;
    id_product: ID;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface Feedback {
    id_feedback: ID;
    id_users?: ID;
    id_product?: ID;
    rating: number;
    comment: string;
    created_at: Timestamp;
    updated_at?: Timestamp;
}

// Utility type for API responses
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
