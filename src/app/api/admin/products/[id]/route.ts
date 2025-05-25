import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Get API URL from environment variables with fallback
const API_URL = 'http://localhost:5000';

// Hàm helper để lấy id từ params an toàn
async function getParams(params: { id: string }) {
    return params;
}

// Route để lấy chi tiết một sản phẩm
export async function GET(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const { id } = await getParams(context.params);
        const response = await axios.get(`${API_URL}/api/admin/products/${id}`, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        const { id } = await getParams(context.params);
        console.error(`Error fetching product ${id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể tải sản phẩm' },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để cập nhật thông tin sản phẩm
export async function PUT(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const { id } = await getParams(context.params);
        const body = await req.json();
        const response = await axios.put(`${API_URL}/api/admin/products/${id}`, body, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        const { id } = await getParams(context.params);
        console.error(`Error updating product ${id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật thông tin sản phẩm' },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để xóa sản phẩm
export async function DELETE(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const { id } = await getParams(context.params);
        const response = await axios.delete(`${API_URL}/api/admin/products/${id}`, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        const { id } = await getParams(context.params);
        console.error(`Error deleting product ${id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể xóa sản phẩm' },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để cập nhật trạng thái sản phẩm (PATCH)
export async function PATCH(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const { id } = await getParams(context.params);
        const body = await req.json();
        const response = await axios.patch(`${API_URL}/api/admin/products/${id}`, body, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        const { id } = await getParams(context.params);
        console.error(`Error updating product status ${id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật trạng thái sản phẩm' },
            { status: error.response?.status || 500 }
        );
    }
}