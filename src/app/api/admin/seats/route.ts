import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Route để lấy danh sách ghế từ database
export async function GET(req: NextRequest) {
    try {
        console.log('[SEATS API] Fetching seats from database');

        const result = await query(`
            SELECT
                s.*,
                sc.screen_name,
                c.cinema_name,
                st.type_name as seat_type_name
            FROM seat s
            LEFT JOIN screen sc ON s.id_screen = sc.id_screen
            LEFT JOIN cinemas c ON sc.id_cinema = c.id_cinema
            LEFT JOIN seat_type st ON s.id_seattype = st.id_seattype
            ORDER BY s.id_seats ASC
        `);

        // Đảm bảo seats luôn là mảng
        let seats;
        if (Array.isArray(result)) {
            seats = result;
        } else if (Array.isArray(result[0])) {
            seats = result[0];
        } else {
            seats = result && typeof result === 'object' ?
                (Object.keys(result).length > 0 ? [result] : []) :
                (result ? [result] : []);
        }

        console.log('Kết quả truy vấn danh sách ghế:', seats);
        console.log('Số lượng ghế:', Array.isArray(seats) ? seats.length : 0);

        return NextResponse.json({
            success: true,
            data: seats
        });
    } catch (error: any) {
        console.error('Error fetching seats:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể lấy danh sách ghế',
            error: error.message
        }, { status: 500 });
    }
}

// Route để thêm ghế mới vào database
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.seat_number || !body.id_screen) {
            return NextResponse.json(
                { success: false, message: 'Số ghế và phòng chiếu là bắt buộc' },
                { status: 400 }
            );
        }

        // Thêm ghế mới vào database
        const result = await query(
            `INSERT INTO SEATS
             (seat_number, seat_row, seat_column, id_screen, seat_type, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                body.seat_number,
                body.seat_row || 'A',
                body.seat_column || 1,
                body.id_screen,
                body.seat_type || 'Standard',
                body.status || 'available'
            ]
        );

        const resultHeader = Array.isArray(result) ? result[0] : result;
        const seatId = (resultHeader as any).insertId;

        return NextResponse.json({
            success: true,
            message: 'Ghế đã được thêm thành công',
            data: { id_seat: seatId }
        });
    } catch (error: any) {
        console.error('Error creating seat:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể thêm ghế mới',
            error: error.message
        }, { status: 500 });
    }
}
