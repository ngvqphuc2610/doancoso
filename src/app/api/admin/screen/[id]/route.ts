import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/apiUtils';

// Route để lấy chi tiết một rạp
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const response = await axios.get(getApiUrl(`/api/admin/screen/${id}`), {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(`Error fetching screen ${params.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể tải phòng chiếu ' },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để cập nhật thông tin rạp
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();
        const response = await axios.put(getApiUrl(`/api/admin/screen/${id}`), body, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(`Error updating screen ${params.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật thông tin phòng chiếu' },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để xóa rạp
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const response = await axios.delete(getApiUrl(`/api/admin/screen/${id}`), {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(`Error deleting screen ${params.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể xóa phòng chiếu' },
            { status: error.response?.status || 500 }
        );
    }
}

// Route để cập nhật trạng thái rạp (PATCH)
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();
        const response = await axios.patch(getApiUrl(`/api/admin/screen/${id}`), body, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(`Error updating screen status ${params.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật trạng thái phòng chiếu' },
            { status: error.response?.status || 500 }
        );
    }
}
