import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Get API URL from environment variables with fallback
const API_URL = process.env.NGROK_URL || process.env.API_URL || 'http://localhost:5000';

// Route để lấy chi tiết một khuyến mãi
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const response = await axios.get(`${API_URL}/api/admin/promotions/${id}`, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        const resolvedParams = await params;
        console.error(`Error fetching promotion ${resolvedParams.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể tải thông tin khuyến mãi' },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để cập nhật thông tin khuyến mãi
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const response = await axios.put(`${API_URL}/api/admin/promotions/${id}`, body, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        const { id } = await params;
        console.error(`Error updating promotion ${id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật thông tin khuyến mãi' },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để xóa khuyến mãi
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const response = await axios.delete(`${API_URL}/api/admin/promotions/${id}`, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        const { id } = await params;
        console.error(`Error deleting promotion ${id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể xóa khuyến mãi' },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để cập nhật trạng thái khuyến mãi (PATCH)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const response = await axios.patch(`${API_URL}/api/admin/promotions/${id}`, body, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        const { id } = await params;
        console.error(`Error updating promotion status ${id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật trạng thái khuyến mãi' },
            { status: error.response?.status || 500 }
        );
    }
}
