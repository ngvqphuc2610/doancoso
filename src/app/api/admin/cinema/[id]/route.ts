import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Route để lấy chi tiết một rạp
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const cinemas = await query('SELECT * FROM CINEMAS WHERE id_cinema = ?', [id]);
        const cinema = Array.isArray(cinemas) && cinemas.length > 0 ? cinemas[0] : null;

        if (!cinema) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy rạp chiếu' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: cinema
        });
    } catch (error: any) {
        console.error(`Error fetching cinema ${params.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể tải thông tin rạp chiếu' },
            { status: 500 }
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
        const response = await axios.put(`${API_URL}/api/admin/cinema/${id}`, body, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(`Error updating cinema ${params.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật thông tin rạp chiếu' },
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
        const response = await axios.delete(`${API_URL}/api/admin/cinema/${id}`, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(`Error deleting cinema ${params.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể xóa rạp chiếu' },
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
        const response = await axios.patch(`${API_URL}/api/admin/cinema/${id}`, body, {
            timeout: 5000
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(`Error updating cinema status ${params.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật trạng thái rạp chiếu' },
            { status: error.response?.status || 500 }
        );
    }
}
