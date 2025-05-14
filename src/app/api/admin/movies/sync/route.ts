import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Get API URL from environment variables with fallback
const API_URL = 'http://localhost:5000';

// Route để đồng bộ phim từ TMDB API vào database
export async function POST(req: NextRequest) {
    try {        // Xác định đúng endpoint cho API
        const apiEndpoint = `${API_URL}/api/admin/movies/sync`;

        console.log(`Connecting to API at: ${apiEndpoint}`);

        // Gọi đến backend endpoint chính xác để đồng bộ phim
        const response = await axios.post(apiEndpoint, {
            forceUpdate: true // Thêm tham số để yêu cầu cập nhật
        }, {
            timeout: 60000 // Tăng timeout lên 60 giây vì quá trình đồng bộ có thể mất thời gian
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error syncing movies:', error);
        console.error('API URL being used:', API_URL);

        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Hết thời gian chờ đồng bộ phim. Máy chủ có thể đang bận, hãy thử lại sau.'
                },
                { status: 504 }
            );
        }

        // Handle connection errors
        if (!error.response) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Không thể kết nối đến máy chủ API (${API_URL}). Vui lòng kiểm tra server đã được khởi động chưa.`,
                    error: error.message
                },
                { status: 503 }
            );
        }

        // Handle other errors
        return NextResponse.json(
            {
                success: false,
                message: 'Không thể đồng bộ phim từ TMDB',
                error: error.response?.data?.message || error.message || 'Unknown error'
            },
            { status: error.response?.status || 500 }
        );
    }
}