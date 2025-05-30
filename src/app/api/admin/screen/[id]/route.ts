import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/apiUtils';

// Route để lấy chi tiết một rạp
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const response = await axios.get(getApiUrl(`/api/admin/screen/${id}`), {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        const resolvedParams = await params;
        console.error(`Error fetching screen ${resolvedParams.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể tải phòng chiếu ' },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để cập nhật thông tin rạp
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const response = await axios.put(getApiUrl(`/api/admin/screen/${id}`), body, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        const resolvedParams = await params;
        console.error(`Error updating screen ${resolvedParams.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật thông tin phòng chiếu' },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để xóa rạp
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const response = await axios.delete(getApiUrl(`/api/admin/screen/${id}`), {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        const resolvedParams = await params;
        console.error(`Error deleting screen ${resolvedParams.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể xóa phòng chiếu' },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để cập nhật trạng thái rạp (PATCH)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const response = await axios.patch(getApiUrl(`/api/admin/screen/${id}`), body, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        const resolvedParams = await params;
        console.error(`Error updating screen status ${resolvedParams.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật trạng thái phòng chiếu' },
            { status: error.response?.status || 500 }
        );
    }
}
