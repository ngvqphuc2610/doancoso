import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Hardcode API URL để đảm bảo luôn hoạt động đúng
const API_URL = 'http://localhost:5000';

// Route để lấy danh sách phòng chiếu từ database
export async function GET(req: NextRequest) {
    try {
        console.log(`[entertainment API] Connecting to Express API at: ${API_URL}/api/admin/entertainment`);

        const response = await axios.get(`${API_URL}/api/admin/entertainment`, {
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'If-Modified-Since': new Date(0).toUTCString()
            }
        });

        const originalData = response.data;
        const raw = originalData.data;

        const normalizedData = Array.isArray(raw) ? raw : raw ? [raw] : [];

        return NextResponse.json({
            ...originalData,
            data: normalizedData
        });
    } catch (error: any) {
        console.error('Error fetching entertainment:', error.message);
        console.error('API URL being used:', API_URL);

        if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
            return NextResponse.json(
                { success: false, message: `Không thể kết nối đến máy chủ API (${API_URL}). Vui lòng kiểm tra server đã được khởi động chưa.` },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Không thể tải dịch vụ giải trí',
                error: error.response?.data || error.message
            },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để thêm phòng chiếu mới vào database
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.title) {
            return NextResponse.json(
                { success: false, message: 'Tên dịch vụ giải trí là bắt buộc' },
                { status: 400 }
            );
        }

        const response = await axios.post(`${API_URL}/api/admin/entertainment`, body, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error creating entertainment:', error.message);

        return NextResponse.json(
            {
                success: false,
                message: 'Không thể thêm dịch vu giải trí mới',
                error: error.response?.data || error.message
            },
            { status: error.response?.status || 500 }
        );
    }
}
