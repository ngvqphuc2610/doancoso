import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Route để lấy tất cả showtimes với thông tin chi tiết
export async function GET() {
    try {
        // Query để lấy showtimes với thông tin cinema và movie
        console.log('[ALL SHOWTIMES WITH DETAILS API] Fetching detailed showtimes from database');

        // Debug: Log current date
        console.log('[DEBUG] Current date (CURDATE()):', new Date().toISOString().split('T')[0]);

        const result = await query(`
            SELECT
                st.id_showtime,
                st.id_movie,
                st.id_screen,
                st.start_time,
                st.start_time as show_time,
                st.end_time,
                st.show_date,
                st.format,
                st.language,
                st.subtitle,
                st.status,
                st.price,
                m.title as movie_title,
                m.poster_image,
                m.duration,
                m.director,
                m.actors,
                m.country,
                m.age_restriction,
                sc.screen_name,
                sc.capacity,
                c.id_cinema,
                c.cinema_name,
                c.address as cinema_address,
                c.contact_number as cinema_phone
            FROM showtimes st
            LEFT JOIN movies m ON st.id_movie = m.id_movie
            LEFT JOIN screen sc ON st.id_screen = sc.id_screen
            LEFT JOIN cinemas c ON sc.id_cinema = c.id_cinema
            WHERE st.show_date >= '2025-06-02'
            AND st.status = 'available'
            ORDER BY st.show_date ASC, st.start_time ASC, c.cinema_name ASC
        `);

        console.log('Kết quả truy vấn detailed showtimes:', result);

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

        console.log('Số lượng detailed showtimes:', showtimes.length);

        return NextResponse.json({
            success: true,
            message: 'Showtimes with details fetched successfully',
            data: showtimes,
            count: showtimes.length
        });

    } catch (error: any) {
        console.error('[ALL SHOWTIMES WITH DETAILS API] Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch showtimes with details',
            error: error.message,
            data: []
        }, { status: 500 });
    }
}
