import { NextRequest, NextResponse } from 'next/server';
import { getMovieById, updateMovie, deleteMovie } from '@/lib/movieDb';

// Route để lấy chi tiết một phim
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const movie = await getMovieById(parseInt(id));

        if (!movie) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy phim' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: movie });
    } catch (error: any) {
        const { id } = await params;
        console.error(`Error fetching movie ${id}:`, error);
        return NextResponse.json(
            { success: false, message: `Không thể tải thông tin phim: ${error.message}` },
            { status: 500 }
        );
    }
}

// Route để cập nhật thông tin phim
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const movieId = parseInt(id);
        const body = await req.json();

        // Sử dụng hàm updateMovie trực tiếp từ movieDb.ts
        const result = await updateMovie(movieId, body);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Cập nhật phim thành công',
                data: result.movie
            });
        } else {
            return NextResponse.json(
                { success: false, message: result.message || 'Không thể cập nhật phim' },
                { status: 400 }
            );
        }
    } catch (error: any) {
        const { id } = await params;
        console.error(`Error updating movie ${id}:`, error);
        return NextResponse.json(
            { success: false, message: `Không thể cập nhật thông tin phim: ${error.message}` },
            { status: 500 }
        );
    }
}

// Route để xóa phim
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const movieId = parseInt(id);

        // Sử dụng hàm deleteMovie trực tiếp từ movieDb.ts
        const result = await deleteMovie(movieId);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Xóa phim thành công'
            });
        } else {
            return NextResponse.json(
                { success: false, message: result.message || 'Không thể xóa phim' },
                { status: 400 }
            );
        }
    } catch (error: any) {
        const { id } = await params;
        console.error(`Error deleting movie ${id}:`, error);
        return NextResponse.json(
            { success: false, message: `Không thể xóa phim: ${error.message}` },
            { status: 500 }
        );
    }
}