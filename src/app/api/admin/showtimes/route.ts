import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Route để lấy danh sách lịch chiếu từ database
export async function GET(req: NextRequest) {
    try {
        console.log('[SHOWTIMES API] Fetching showtimes from database');

        const result = await query(`
            SELECT
                s.*,
                m.title as movie_title,
                c.cinema_name,
                sc.screen_name
            FROM showtimes s
            LEFT JOIN movies m ON s.id_movie = m.id_movie
            LEFT JOIN screen sc ON s.id_screen = sc.id_screen
            LEFT JOIN cinemas c ON sc.id_cinema = c.id_cinema
            ORDER BY s.id_showtime ASC
        `);

        // Đảm bảo showtimes luôn là mảng
        let showtimes;
        if (Array.isArray(result)) {
            showtimes = result;
        } else if (Array.isArray(result[0])) {
            showtimes = result[0];
        } else {
            showtimes = result && typeof result === 'object' ?
                (Object.keys(result).length > 0 ? [result] : []) :
                (result ? [result] : []);
        }

        console.log('Kết quả truy vấn danh sách lịch chiếu:', showtimes);
        console.log('Số lượng lịch chiếu:', Array.isArray(showtimes) ? showtimes.length : 0);

        return NextResponse.json({
            success: true,
            data: showtimes
        });
    } catch (error: any) {
        console.error('Error fetching showtimes:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể lấy danh sách lịch chiếu',
            error: error.message
        }, { status: 500 });
    }
}

// Route để thêm lịch chiếu mới vào database
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.start_time || !body.id_movie || !body.id_screen) {
            return NextResponse.json(
                { success: false, message: 'Thời gian bắt đầu, phim và phòng chiếu là bắt buộc' },
                { status: 400 }
            );
        }

        // Lấy id_cinema từ id_screen
        const screenInfo = await query(
            'SELECT id_cinema FROM screen WHERE id_screen = ?',
            [body.id_screen]
        ) as any[];

        if (!screenInfo || screenInfo.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Phòng chiếu không tồn tại' },
                { status: 400 }
            );
        }

        const id_cinema = screenInfo[0].id_cinema;

        // Thêm lịch chiếu mới vào database
        const result = await query(
            `INSERT INTO showtimes
             (id_movie, id_screen, start_time, end_time, show_date, price, format, language, subtitle, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                body.id_movie,
                body.id_screen,
                body.start_time,
                body.end_time || null,
                body.show_date,
                body.price || 0,
                body.format || '2D',
                body.language || 'Tiếng Việt',
                body.subtitle || 'Tiếng Anh',
                body.status || 'available'
            ]
        );

        const resultHeader = Array.isArray(result) ? result[0] : result;
        const showtimeId = (resultHeader as any).insertId;

        return NextResponse.json({
            success: true,
            message: 'Lịch chiếu đã được thêm thành công',
            data: { id_showtime: showtimeId }
        });
    } catch (error: any) {
        console.error('Error creating showtime:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể thêm lịch chiếu mới',
            error: error.message
        }, { status: 500 });
    }
}
