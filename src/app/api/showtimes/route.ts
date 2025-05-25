import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const movieId = searchParams.get('movieId');
        const date = searchParams.get('date');

        if (!movieId) {
            return new NextResponse(
                JSON.stringify({ success: false, error: 'ID phim là bắt buộc' }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        const sql = `
            SELECT 
                s.id_showtime,
                s.start_time,
                s.end_time,
                s.show_date,
                s.price,
                s.format,
                s.status,
                c.id_cinema,
                c.cinema_name,
                c.address,                scr.id_screen,
                scr.screen_name,
                scr.capacity,
                COALESCE(st.type_name, 'Standard') as screen_type,
                (
                    SELECT COUNT(*)
                    FROM DETAIL_BOOKING db
                    JOIN BOOKINGS b ON db.id_booking = b.id_booking
                    WHERE b.id_showtime = s.id_showtime
                    AND b.booking_status != 'cancelled'
                ) as booked_seats            FROM SHOWTIMES s
            JOIN SCREEN scr ON s.id_screen = scr.id_screen
            JOIN CINEMAS c ON scr.id_cinema = c.id_cinema
            LEFT JOIN SCREEN_TYPE st ON scr.id_screentype = st.id_screentype
            WHERE s.id_movie = ?
            ${date ? 'AND DATE(s.show_date) = ?' : ''}
            AND s.status = 'available'
            AND s.show_date >= CURDATE()
            ORDER BY s.show_date, c.cinema_name, s.start_time
        `;
        const queryParams = date ? [movieId, date] : [movieId];
        const rows = await query<ShowtimeRow[]>(sql, queryParams);

        const showtimes = transformShowtimeData(rows);

        return new NextResponse(
            JSON.stringify({ success: true, data: showtimes }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (error) {
        console.error('Error fetching showtimes:', error);
        return new NextResponse(
            JSON.stringify({ success: false, error: 'Lỗi hệ thống' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}

interface ShowtimeRow {
    id_showtime: number;
    start_time: string;   // 'HH:mm:ss'
    end_time: string;     // 'HH:mm:ss'
    show_date: string;
    price: number;
    format: string;
    status: string;
    id_cinema: number;
    cinema_name: string;
    address: string;
    screen_name: string;
    screen_type: string;
    capacity: number;
    booked_seats: number;
}

function formatTime(t: string) {
    // t: 'HH:mm:ss' => 'HH:mm'
    return t ? t.slice(0, 5) : '';
}

function transformShowtimeData(rows: ShowtimeRow[]) {
    const showtimesByDate = rows.reduce((acc: any, row: ShowtimeRow) => {
        const date = new Date(row.show_date).toISOString().split('T')[0];
        const availableSeats = row.capacity - (row.booked_seats || 0);

        if (!acc[date]) {
            acc[date] = {
                date: date,
                cinemas: {}
            };
        }

        if (!acc[date].cinemas[row.id_cinema]) {
            acc[date].cinemas[row.id_cinema] = {
                id: row.id_cinema,
                name: row.cinema_name,
                address: row.address,
                showTimes: []
            };
        }

        acc[date].cinemas[row.id_cinema].showTimes.push({
            id: row.id_showtime,
            time: formatTime(row.start_time),
            endTime: formatTime(row.end_time),
            date: date,
            room: row.screen_name,
            roomType: row.screen_type,
            format: row.format,
            price: row.price,
            available_seats: availableSeats,
            total_seats: row.capacity
        });

        return acc;
    }, {});

    // Sắp xếp showTimes theo time (HH:mm)
    return Object.values(showtimesByDate).map((dateData: any) => ({
        ...dateData,
        cinemas: Object.values(dateData.cinemas).map((cinema: any) => ({
            ...cinema,
            showTimes: cinema.showTimes.sort((a: any, b: any) =>
                a.time.localeCompare(b.time)
            )
        }))
    }));
}