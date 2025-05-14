/**
 * Tiện ích để quản lý các API endpoint trong ứng dụng
 */

/**
 * Lấy base URL cho API dựa vào biến môi trường NEXT_PUBLIC_API_URL
 * @returns {string} Base URL cho API
 */
export const getApiBaseUrl = (): string => {
    // Kiểm tra nếu biến môi trường NEXT_PUBLIC_API_URL tồn tại
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    return baseUrl;
};

/**
 * Tạo URL đầy đủ cho API endpoint
 * @param {string} endpoint - Đường dẫn API tương đối (ví dụ: "/api/admin/cinema")
 * @returns {string} URL đầy đủ cho API endpoint
 */
export const getApiUrl = (endpoint: string): string => {
    const baseUrl = getApiBaseUrl();

    // Đảm bảo endpoint bắt đầu bằng "/"
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    return `${baseUrl}${normalizedEndpoint}`;
};

/**
 * Cấu hình chung cho các request API
 */
export const apiConfig = {
    timeout: 8000,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    }
};
