import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Get API URL from environment variables with fallback
const API_URL = 'http://localhost:5000';

// Route để lấy danh sách thành viên từ database
export async function GET(req: NextRequest) {
    try {
        console.log(`Connecting to API at: ${API_URL}/api/admin/members`);
        const response = await axios.get(`${API_URL}/api/admin/members`, {
            timeout: 5000 // 5 second timeout
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error fetching members:', error.message);
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
                message: 'Không thể tải danh sách thành viên',
                error: error.response?.data || error.message
            },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để thêm thành viên mới vào database
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.full_name || !body.email || !body.phone) {
            return NextResponse.json(
                { success: false, message: 'Tên, email và số điện thoại là bắt buộc' },
                { status: 400 }
            );
        }

        const response = await axios.post(`${API_URL}/api/admin/members`, body, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error creating member:', error.message);

        return NextResponse.json(
            {
                success: false,
                message: 'Không thể thêm thành viên mới',
                error: error.response?.data || error.message
            },
            { status: error.response?.status || 500 }
        );
    }
}
