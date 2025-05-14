// Database types for Movies application

// Common types
export type ID = number;
export type Timestamp = string;

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
    full_name: string;
    email: string;
    phone: string;
    membership_level: 'normal' | 'silver' | 'gold' | 'platinum';
    points: number;
    join_date: string;
    status: 'active' | 'inactive';
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

// Product related types
export interface Product {
    id_product: ID;
    product_name: string;
    category: string;
    price: number;
    image_url?: string;
    description?: string;
    stock: number;
    status: 'active' | 'inactive';
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
    name: string;
    type: string;
    location: string;
    description?: string;
    image_url?: string;
    price?: number;
    opening_hours?: string;
    status: 'active' | 'inactive';
    created_at?: Timestamp;
    updated_at?: Timestamp;
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
