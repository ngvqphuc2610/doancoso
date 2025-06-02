import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Route để lấy chi tiết một showtime
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const showtimes = await query(`
            SELECT
                s.*,
                m.title as movie_title,
                c.cinema_name,
                sc.screen_name
            FROM showtimes s
            LEFT JOIN movies m ON s.id_movie = m.id_movie
            LEFT JOIN screen sc ON s.id_screen = sc.id_screen
            LEFT JOIN cinemas c ON sc.id_cinema = c.id_cinema
            WHERE s.id_showtime = ?
        `, [id]) as any[];

        if (!showtimes || showtimes.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy lịch chiếu' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: showtimes[0]
        });
    } catch (error: any) {
        const resolvedParams = await params;
        console.error(`Error fetching showtime ${resolvedParams.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể tải thông tin lịch chiếu' },
            { status: 500 }
        );
    }
}

// Route để cập nhật thông tin showtime
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Validate required fields
        if (!body.start_time || !body.id_movie || !body.id_screen) {
            return NextResponse.json(
                { success: false, message: 'Thời gian bắt đầu, phim và phòng chiếu là bắt buộc' },
                { status: 400 }
            );
        }

        // Cập nhật showtime trong database
        await query(`
            UPDATE showtimes
            SET id_movie = ?, id_screen = ?, start_time = ?, end_time = ?,
                show_date = ?, price = ?, format = ?, language = ?, subtitle = ?, status = ?
            WHERE id_showtime = ?
        `, [
            body.id_movie,
            body.id_screen,
            body.start_time,
            body.end_time || null,
            body.show_date,
            body.price || 0,
            body.format || '2D',
            body.language || 'Tiếng Việt',
            body.subtitle || 'Tiếng Anh',
            body.status || 'available',
            id
        ]);

        return NextResponse.json({
            success: true,
            message: 'Cập nhật lịch chiếu thành công'
        });
    } catch (error: any) {
        const resolvedParams = await params;
        console.error(`Error updating showtime ${resolvedParams.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật thông tin lịch chiếu' },
            { status: 500 }
        );
    }
}

// Route để xóa showtime
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Xóa showtime từ database
        await query('DELETE FROM showtimes WHERE id_showtime = ?', [id]);

        return NextResponse.json({
            success: true,
            message: 'Xóa lịch chiếu thành công'
        });
    } catch (error: any) {
        const resolvedParams = await params;
        console.error(`Error deleting showtime ${resolvedParams.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể xóa lịch chiếu' },
            { status: 500 }
        );
    }
}

// Route để cập nhật trạng thái showtime (PATCH)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Cập nhật trạng thái showtime
        await query('UPDATE showtimes SET status = ? WHERE id_showtime = ?', [body.status, id]);

        return NextResponse.json({
            success: true,
            message: 'Cập nhật trạng thái lịch chiếu thành công'
        });
    } catch (error: any) {
        const resolvedParams = await params;
        console.error(`Error updating showtime status ${resolvedParams.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật trạng thái lịch chiếu' },
            { status: 500 }
        );
    }
}
