// API Constants
export const API = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_SORT_FIELD: 'created_at',
  DEFAULT_SORT_ORDER: 'desc' as const,
  TIMEOUT: 8000
};

// Movie Constants
export const MOVIE = {
  STATUS: {
    NOW_SHOWING: 'now_showing',
    COMING_SOON: 'coming_soon',
    HIDDEN: 'hidden'
  },
  DEFAULT_ID: 1,
  AGE_RESTRICTIONS: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'C13', 'C16', 'C18', 'P']
};

// Cinema Constants
export const CINEMA = {
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    MAINTENANCE: 'maintenance'
  }
};

// Screen Constants
export const SCREEN = {
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    MAINTENANCE: 'maintenance'
  },
  TYPES: {
    STANDARD: 'standard',
    VIP: 'vip',
    IMAX: '4dx'
  }
};

// Showtime Constants
export const SHOWTIME = {
  STATUS: {
    AVAILABLE: 'available',
    SOLD_OUT: 'sold_out',
    CANCELLED: 'cancelled'
  }
};

// User Constants
export const USER = {
  ROLES: {
    ADMIN: 'admin',
    STAFF: 'staff',
    CUSTOMER: 'customer'
  },
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BANNED: 'banned'
  }
};

// File Upload Constants
export const UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }
};

// Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  PHONE_REGEX: /^[0-9]{10,11}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10
};

// Date Format Constants
export const DATE_FORMAT = {
  DISPLAY: 'DD/MM/YYYY',
  DATABASE: 'YYYY-MM-DD',
  DATETIME_DISPLAY: 'DD/MM/YYYY HH:mm',
  DATETIME_DATABASE: 'YYYY-MM-DD HH:mm:ss'
};

// Language Constants
export const LANGUAGE = {
  DEFAULT: 'vi',
  SUPPORTED: ['vi', 'en']
};