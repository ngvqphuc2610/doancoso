import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Get API URL from environment variables with fallback
const API_URL = process.env.NGROK_URL || process.env.API_URL || 'http://localhost:5000';

// Route để lấy chi tiết một dịch vụ giải trí
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const response = await axios.get(`${API_URL}/api/admin/entertainment/${id}`, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(`Error fetching entertainment service ${params.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể tải thông tin dịch vụ giải trí' },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để cập nhật thông tin dịch vụ giải trí
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();
        const response = await axios.put(`${API_URL}/api/admin/entertainment/${id}`, body, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(`Error updating entertainment service ${params.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật thông tin dịch vụ giải trí' },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để xóa dịch vụ giải trí
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const response = await axios.delete(`${API_URL}/api/admin/entertainment/${id}`, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(`Error deleting entertainment service ${params.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể xóa dịch vụ giải trí' },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để cập nhật trạng thái dịch vụ giải trí (PATCH)
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();
        const response = await axios.patch(`${API_URL}/api/admin/entertainment/${id}`, body, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(`Error updating entertainment service status ${params.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật trạng thái dịch vụ giải trí' },
            { status: error.response?.status || 500 }
        );
    }
}
