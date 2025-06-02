import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Route để lấy chi tiết một ghế
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        console.log('[SEAT API] Fetching seat with ID:', id);

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
            WHERE s.id_seats = ?
        `, [id]);

        // Đảm bảo result là mảng và lấy phần tử đầu tiên
        let seat;
        if (Array.isArray(result)) {
            seat = result[0];
        } else if (Array.isArray(result[0])) {
            seat = result[0][0];
        } else {
            seat = result;
        }

        if (!seat) {
            return NextResponse.json({
                success: false,
                message: 'Không tìm thấy ghế'
            }, { status: 404 });
        }

        console.log('Kết quả truy vấn ghế:', seat);

        return NextResponse.json({
            success: true,
            data: seat
        });
    } catch (error: any) {
        console.error('Error fetching seat:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể lấy thông tin ghế',
            error: error.message
        }, { status: 500 });
    }
}

// Route để cập nhật ghế
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();

        // Validate required fields
        if (!body.seat_number || !body.id_screen || !body.id_seattype || !body.seat_row) {
            return NextResponse.json(
                { success: false, message: 'Số ghế, phòng chiếu, loại ghế và hàng ghế là bắt buộc' },
                { status: 400 }
            );
        }

        // Check if seat already exists (excluding current seat)
        const existingSeat = await query(
            `SELECT id_seats FROM seat
             WHERE id_screen = ? AND seat_row = ? AND seat_number = ? AND id_seats != ?`,
            [body.id_screen, body.seat_row, body.seat_number, id]
        );

        if (Array.isArray(existingSeat) && existingSeat.length > 0) {
            return NextResponse.json(
                { success: false, message: 'Ghế này đã tồn tại trong phòng chiếu' },
                { status: 400 }
            );
        }

        // Cập nhật ghế trong database
        const result = await query(
            `UPDATE seat SET
                id_screen = ?,
                id_seattype = ?,
                seat_row = ?,
                seat_number = ?,
                status = ?
             WHERE id_seats = ?`,
            [
                body.id_screen,
                body.id_seattype,
                body.seat_row.toUpperCase(),
                body.seat_number,
                body.status || 'active',
                id
            ]
        );

        const resultHeader = Array.isArray(result) ? result[0] : result;
        const affectedRows = (resultHeader as any).affectedRows;

        if (affectedRows === 0) {
            return NextResponse.json({
                success: false,
                message: 'Không tìm thấy ghế để cập nhật'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Ghế đã được cập nhật thành công'
        });
    } catch (error: any) {
        console.error('Error updating seat:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể cập nhật ghế',
            error: error.message
        }, { status: 500 });
    }
}

// Route để xóa ghế
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check if seat is being used in any bookings
        const bookingCheck = await query(
            `SELECT COUNT(*) as count FROM detail_booking WHERE id_seats = ?`,
            [id]
        );

        const bookingCount = Array.isArray(bookingCheck) ? bookingCheck[0]?.count : bookingCheck?.count;

        if (bookingCount > 0) {
            return NextResponse.json({
                success: false,
                message: 'Không thể xóa ghế này vì đã có booking sử dụng'
            }, { status: 400 });
        }

        // Xóa ghế khỏi database
        const result = await query(
            `DELETE FROM seat WHERE id_seats = ?`,
            [id]
        );

        const resultHeader = Array.isArray(result) ? result[0] : result;
        const affectedRows = (resultHeader as any).affectedRows;

        if (affectedRows === 0) {
            return NextResponse.json({
                success: false,
                message: 'Không tìm thấy ghế để xóa'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Ghế đã được xóa thành công'
        });
    } catch (error: any) {
        console.error('Error deleting seat:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể xóa ghế',
            error: error.message
        }, { status: 500 });
    }
}
