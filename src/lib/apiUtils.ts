import { NextResponse } from 'next/server';

export type ApiError = {
  code: string;
  message: string;
  details?: any;
};

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
};

/**
 * Tạo response thành công chuẩn hóa
 */
export function createSuccessResponse<T>(data: T, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message
  });
}

/**
 * Tạo response lỗi chuẩn hóa
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  code: string = 'INTERNAL_SERVER_ERROR',
  details?: any
) {
  const error: ApiError = {
    code,
    message
  };

  if (process.env.NODE_ENV === 'development' && details) {
    error.details = details;
  }

  return NextResponse.json(
    {
      success: false,
      error,
      message
    },
    { status }
  );
}

/**
 * Xử lý lỗi từ try-catch blocks
 */
export function handleApiError(error: unknown, defaultMessage: string = 'Đã xảy ra lỗi') {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return createErrorResponse(
      error.message || defaultMessage,
      500,
      'INTERNAL_SERVER_ERROR',
      {
        stack: error.stack,
        name: error.name
      }
    );
  }
  
  return createErrorResponse(defaultMessage);
}

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
