import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const showtimeId = searchParams.get('showtimeId');

        if (!showtimeId) {
            return new NextResponse(
                JSON.stringify({
                    success: false,
                    error: 'Thiếu thông tin suất chiếu'
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Lấy thông tin ghế từ database
        const sql = `
            SELECT 
                s.id_seats,
                s.seat_row,
                s.seat_number,
                st.type_name as seat_type,
                ROUND(st.price_multiplier * (
                    SELECT price 
                    FROM SHOWTIMES 
                    WHERE id_showtime = ?
                )) as price,                CASE 
                    WHEN db.id_seats IS NOT NULL THEN 'booked'
                    WHEN s.status = 'maintenance' THEN 'maintenance'
                    WHEN s.status = 'inactive' THEN 'inactive'
                    ELSE 'available'
                END as status
            FROM SEAT s
            INNER JOIN SEAT_TYPE st ON s.id_seattype = st.id_seattype
            LEFT JOIN DETAIL_BOOKING db ON s.id_seats = db.id_seats
            LEFT JOIN BOOKINGS b ON db.id_booking = b.id_booking 
                AND b.id_showtime = ?
                AND b.booking_status != 'cancelled'
            WHERE s.id_screen = (
                SELECT id_screen 
                FROM SHOWTIMES 
                WHERE id_showtime = ?
            )
            ORDER BY s.seat_row, s.seat_number
        `;

        const rows = await query(sql, [showtimeId, showtimeId, showtimeId]);

        return new NextResponse(
            JSON.stringify({
                success: true,
                data: rows
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (error) {
        console.error('Error fetching seats:', error);
        return new NextResponse(
            JSON.stringify({
                success: false,
                error: 'Lỗi khi lấy thông tin ghế'
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}
