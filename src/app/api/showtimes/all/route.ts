import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Route để lấy tất cả showtimes từ database cho QuickBookingForm
export async function GET(req: NextRequest) {
    try {
        console.log('[ALL SHOWTIMES API] Fetching all showtimes from database');

        const result = await query(`
            SELECT
                st.id_showtime,
                st.id_movie,
                st.id_screen,
                sc.id_cinema,
                st.show_date,
                st.start_time as show_time,
                st.format,
                m.title as movie_title,
                sc.screen_name,
                c.cinema_name
            FROM showtimes st
            LEFT JOIN movies m ON st.id_movie = m.id_movie
            LEFT JOIN screen sc ON st.id_screen = sc.id_screen
            LEFT JOIN cinemas c ON sc.id_cinema = c.id_cinema
            WHERE st.show_date >= CURDATE()
            AND st.status = 'available'
            ORDER BY st.show_date ASC, st.start_time ASC
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

        // Format show_time to HH:mm format
        const formattedShowtimes = showtimes.map((showtime: any) => ({
            ...showtime,
            show_time: showtime.show_time ? showtime.show_time.slice(0, 5) : ''
        }));

        console.log('Kết quả truy vấn all showtimes:', formattedShowtimes);
        console.log('Số lượng showtimes:', Array.isArray(formattedShowtimes) ? formattedShowtimes.length : 0);

        return NextResponse.json({
            success: true,
            data: formattedShowtimes
        });
    } catch (error: any) {
        console.error('Error fetching all showtimes:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể lấy danh sách showtimes',
            error: error.message
        }, { status: 500 });
    }
}