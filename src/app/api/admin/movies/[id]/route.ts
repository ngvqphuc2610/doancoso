import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Route để lấy chi tiết một phim
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const response = await axios.get(`http://localhost:5000/api/admin/movies/${id}`);
        return NextResponse.json(response.data);
    } catch (error) {
        console.error(`Error fetching movie ${params.id}:`, error);
        return NextResponse.json(
            { success: false, message: 'Không thể tải thông tin phim' },
            { status: 500 }
        );
    }
}

// Route để cập nhật thông tin phim
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();
        const response = await axios.put(`http://localhost:5000/api/admin/movies/${id}`, body);
        return NextResponse.json(response.data);
    } catch (error) {
        console.error(`Error updating movie ${params.id}:`, error);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật thông tin phim' },
            { status: 500 }
        );
    }
}

// Route để xóa phim
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const response = await axios.delete(`http://localhost:5000/api/admin/movies/${id}`);
        return NextResponse.json(response.data);
    } catch (error) {
        console.error(`Error deleting movie ${params.id}:`, error);
        return NextResponse.json(
            { success: false, message: 'Không thể xóa phim' },
            { status: 500 }
        );
    }
}