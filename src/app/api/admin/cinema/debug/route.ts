"use server";

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Hardcode API URL để đảm bảo kết nối đúng
const API_URL = 'http://localhost:5000';

export async function GET() {
    try {
        console.log(`[Debug Route] Gọi Express API tại: ${API_URL}/api/admin/cinema`);

        // Gọi trực tiếp đến API Express với timeout dài hơn
        const response = await axios.get(`${API_URL}/api/admin/cinema`, {
            timeout: 30000,
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        console.log(`[Debug Route] Nhận phản hồi từ Express API, success=${response.data.success}`);
        console.log(`[Debug Route] Dữ liệu:`, response.data.data);

        // Trả về response nguyên bản và chi tiết thêm
        return NextResponse.json({
            timestamp: new Date().toISOString(),
            apiUrl: API_URL,
            expressResponse: response.data,
            dataCount: Array.isArray(response.data.data) ? response.data.data.length : 'not an array',
            status: response.status
        });
    } catch (error: any) {
        // Trả về chi tiết lỗi để debug
        return NextResponse.json({
            success: false,
            apiUrl: API_URL,
            error: {
                message: error.message,
                code: error.code,
                response: error.response?.data || null,
                responseStatus: error.response?.status || null,
                stack: error.stack
            }
        }, { status: 500 });
    }
}
