import { Inngest } from 'inngest';

// Xác định baseUrl cho Inngest Dev Server
const getBaseUrl = () => {
    // Nếu đang chạy ở server-side
    if (typeof window === 'undefined') {
        // Nếu có NGROK_URL trong biến môi trường, sử dụng nó
        if (process.env.NGROK_URL) {
            return `${process.env.NGROK_URL}/api/inngest`;
        }
        return process.env.INNGEST_DEV_SERVER_URL || 'http://localhost:5000/api/inngest';
    }
    // Nếu đang chạy ở client-side
    return '/api/inngest';
};

// Định nghĩa các kiểu sự kiện
export type MovieSyncEvent = {
    name: 'movie/sync';
    data: {
        source: 'tmdb';
        fullSync: boolean;
    };
};

export type MovieUpdateEvent = {
    name: 'movie/update';
    data: {
        movieId: number;
        fields: string[];
    };
};

export type MovieDeleteEvent = {
    name: 'movie/delete';
    data: {
        movieId: number;
    };
};

// Tổng hợp tất cả các loại sự kiện
export type Events = MovieSyncEvent | MovieUpdateEvent | MovieDeleteEvent;

// Khởi tạo client Inngest với cấu hình tốt hơn
export const inngest = new Inngest({
    id: 'movie-database',
    name: 'Movie Database',
    baseUrl: getBaseUrl(), // Thêm baseUrl để kết nối đúng với Inngest Dev Server
    // Thêm các tùy chọn để xử lý lỗi tốt hơn
    options: {
        maxRetries: 3,
        retryDelayInMs: 1000, // 1s giữa các lần thử lại
        eventTimeoutInMs: 5 * 60 * 1000, // 5 phút timeout
        concurrency: 3 // Số lượng sự kiện xử lý đồng thời
    }
});
