import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Get API URL from environment variables with fallback
const API_URL = process.env.NGROK_URL || process.env.API_URL || 'http://localhost:5000';

// Route để lấy danh sách phim từ database
export async function GET(req: NextRequest) {
    try {
        console.log(`Connecting to API at: ${API_URL}/api/admin/movies`);
        const response = await axios.get(`${API_URL}/api/admin/movies`, {
            timeout: 5000 // 5 second timeout
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error fetching movies:', error.message);
        console.error('API URL being used:', API_URL);

        // Provide more specific error messages based on error type
        if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
            return NextResponse.json(
                { success: false, message: `Không thể kết nối đến máy chủ API (${API_URL}). Vui lòng kiểm tra server đã được khởi động chưa.` },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Không thể tải danh sách phim',
                error: error.response?.data || error.message
            },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để thêm phim mới vào database
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.title) {
            return NextResponse.json(
                { success: false, message: 'Tiêu đề phim là bắt buộc' },
                { status: 400 }
            );
        }

        const response = await axios.post(`${API_URL}/api/admin/movies`, body, {
            timeout: 8000 // 8 second timeout for POST requests
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error creating movie:', error.message);

        // Handle specific error cases
        if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
            return NextResponse.json(
                { success: false, message: 'Không thể kết nối đến máy chủ API. Vui lòng kiểm tra server đã được khởi động chưa.' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Không thể tạo phim mới',
                error: error.response?.data || error.message
            },
            { status: error.response?.status || 500 }
        );
    }
}