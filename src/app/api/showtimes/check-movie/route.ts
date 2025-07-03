import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/apiUtils';
import { MOVIE, CINEMA, SCREEN, SHOWTIME } from '@/lib/constants';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const movieId = searchParams.get('movieId') || MOVIE.DEFAULT_ID.toString();

        console.log(`🔍 Kiểm tra chi tiết showtimes cho movie ID: ${movieId}`);

        // 1. Kiểm tra xem phim có tồn tại không
        const movieCheckSql = `SELECT id_movie, title, status FROM movies WHERE id_movie = ?`;
        const movieData = await query(movieCheckSql, [movieId]);
        
        if (!Array.isArray(movieData) || movieData.length === 0) {
            return createErrorResponse(
                `Không tìm thấy phim với ID: ${movieId}`,
                404,
                'NOT_FOUND'
            );
        }
        
        console.log(`🎬 Phim: ${JSON.stringify(movieData[0])}`);

        // 2. Kiểm tra showtimes không lọc
        const allShowtimesSql = `
            SELECT s.*, c.cinema_name, c.status as cinema_status, 
                   scr.screen_name, scr.status as screen_status,
                   m.title, m.status as movie_status
            FROM showtimes s
            JOIN screen scr ON s.id_screen = scr.id_screen
            JOIN cinemas c ON scr.id_cinema = c.id_cinema
            JOIN movies m ON s.id_movie = m.id_movie
            WHERE s.id_movie = ?
        `;
        
        const allShowtimes = await query(allShowtimesSql, [movieId]);
        
        if (!Array.isArray(allShowtimes) || allShowtimes.length === 0) {
            return new NextResponse(
                JSON.stringify({ 
                    success: false, 
                    error: `Không có showtimes nào cho phim ID: ${movieId}`,
                    movie: movieData[0]
                }),
                { 
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        
        console.log(`📅 Tìm thấy ${allShowtimes.length} showtimes`);

        // 3. Kiểm tra showtimes với các điều kiện lọc
        const filteredShowtimesSql = `
            SELECT s.*, c.cinema_name, c.status as cinema_status, 
                   scr.screen_name, scr.status as screen_status,
                   m.title, m.status as movie_status
            FROM showtimes s
            JOIN screen scr ON s.id_screen = scr.id_screen
            JOIN cinemas c ON scr.id_cinema = c.id_cinema
            JOIN movies m ON s.id_movie = m.id_movie
            WHERE s.id_movie = ?
            AND s.status = ?
            AND c.status = ?
            AND scr.status = ?
        `;
        
        const filteredShowtimes = await query(filteredShowtimesSql, [
            movieId, 
            SHOWTIME.STATUS.AVAILABLE, 
            CINEMA.STATUS.ACTIVE, 
            SCREEN.STATUS.ACTIVE
        ]);
        const filteredCount = Array.isArray(filteredShowtimes) ? filteredShowtimes.length : 0;
        
        console.log(`🔍 Sau khi lọc: ${filteredCount} showtimes`);

        // 4. Kiểm tra showtimes từ hôm nay trở đi
        const futureShowtimesSql = `
            SELECT s.*, c.cinema_name, c.status as cinema_status, 
                   scr.screen_name, scr.status as screen_status,
                   m.title, m.status as movie_status
            FROM showtimes s
            JOIN screen scr ON s.id_screen = scr.id_screen
            JOIN cinemas c ON scr.id_cinema = c.id_cinema
            JOIN movies m ON s.id_movie = m.id_movie
            WHERE s.id_movie = ?
            AND s.status = 'available'
            AND c.status = 'active'
            AND scr.status = 'active'
            AND s.show_date >= CURDATE()
        `;
        
        const futureShowtimes = await query(futureShowtimesSql, [movieId]);
        const futureCount = Array.isArray(futureShowtimes) ? futureShowtimes.length : 0;
        
        console.log(`🔮 Từ hôm nay trở đi: ${futureCount} showtimes`);

        // Trả về kết quả phân tích
        return createSuccessResponse({
            movie: movieData[0],
            analysis: {
                totalShowtimes: allShowtimes.length,
                filteredShowtimes: filteredCount,
                futureShowtimes: futureCount,
                lostInFiltering: allShowtimes.length - filteredCount,
                lostInFutureCheck: filteredCount - futureCount
            },
            allShowtimes: allShowtimes,
            filteredShowtimes: filteredShowtimes,
            futureShowtimes: futureShowtimes
        });
    } catch (error) {
        return handleApiError(error, 'Lỗi hệ thống khi kiểm tra showtimes');
    }
}
