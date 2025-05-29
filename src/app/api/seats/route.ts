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

        // Lấy thông tin ghế từ database với DISTINCT để tránh duplicate
        const sql = `
            SELECT DISTINCT
                s.id_seats,
                s.seat_row,
                s.seat_number,
                st.type_name as seat_type,
                ROUND(st.price_multiplier * (
                    SELECT price
                    FROM showtimes
                    WHERE id_showtime = ?
                )) as price,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM detail_booking db2
                        INNER JOIN bookings b2 ON db2.id_booking = b2.id_booking
                        WHERE db2.id_seats = s.id_seats
                        AND b2.id_showtime = ?
                        AND b2.booking_status != 'cancelled'
                    ) THEN 'booked'
                    WHEN s.status = 'maintenance' THEN 'maintenance'
                    WHEN s.status = 'inactive' THEN 'inactive'
                    ELSE 'available'
                END as status
            FROM seat s
            INNER JOIN seat_type st ON s.id_seattype = st.id_seattype
            WHERE s.id_screen = (
                SELECT id_screen
                FROM showtimes
                WHERE id_showtime = ?
            )
            ORDER BY s.seat_row, s.seat_number
        `;

        const rows = await query(sql, [showtimeId, showtimeId, showtimeId]);

        // Transform data to normalize seat_type to lowercase
        const transformedRows = rows.map((row: any) => ({
            ...row,
            seat_type: row.seat_type.toLowerCase() // Convert 'Regular' -> 'regular', 'Couple' -> 'couple', etc.
        }));

        // Check for duplicates in API response
        const seatIds = transformedRows.map((row: any) => `${row.seat_row}${row.seat_number.toString().padStart(2, '0')}`);
        const duplicateIds = seatIds.filter((id: string, index: number) => seatIds.indexOf(id) !== index);

        if (duplicateIds.length > 0) {
            console.error('🚨 API returning duplicate seat IDs:', duplicateIds);
            console.error('🚨 Full seat data:', transformedRows);
        }

        console.log(`🪑 Returning ${transformedRows.length} seats for showtime ${showtimeId}`);
        console.log('Sample seat data:', transformedRows.slice(0, 3));
        console.log('Unique seat IDs:', new Set(seatIds).size, 'vs Total:', seatIds.length);

        return new NextResponse(
            JSON.stringify({
                success: true,
                data: transformedRows
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
