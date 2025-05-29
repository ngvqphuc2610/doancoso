import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Route để lấy danh sách phòng chiếu từ database
export async function GET(req: NextRequest) {
    try {
        console.log('[SCREEN API] Fetching screens from database');

        const result = await query(`
            SELECT
                s.*,
                c.cinema_name,
                st.type_name as screen_type_name
            FROM screen s
            LEFT JOIN cinemas c ON s.id_cinema = c.id_cinema
            LEFT JOIN screen_type st ON s.id_screentype = st.id_screentype
            ORDER BY s.id_screen ASC
        `);

        // Đảm bảo screens luôn là mảng
        let screens;
        if (Array.isArray(result)) {
            screens = result;
        } else if (Array.isArray(result[0])) {
            screens = result[0];
        } else {
            screens = result && typeof result === 'object' ?
                (Object.keys(result).length > 0 ? [result] : []) :
                (result ? [result] : []);
        }

        console.log('Kết quả truy vấn danh sách phòng chiếu:', screens);
        console.log('Số lượng phòng chiếu:', Array.isArray(screens) ? screens.length : 0);

        return NextResponse.json({
            success: true,
            data: screens
        });
    } catch (error: any) {
        console.error('Error fetching screens:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể lấy danh sách phòng chiếu',
            error: error.message
        }, { status: 500 });
    }
}

// Route để thêm phòng chiếu mới vào database
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.screen_name || !body.id_cinema) {
            return NextResponse.json(
                { success: false, message: 'Tên phòng chiếu và rạp là bắt buộc' },
                { status: 400 }
            );
        }

        // Thêm phòng chiếu mới vào database
        const result = await query(
            `INSERT INTO SCREENS
             (screen_name, id_cinema, total_seats, screen_type, status)
             VALUES (?, ?, ?, ?, ?)`,
            [
                body.screen_name,
                body.id_cinema,
                body.total_seats || 100,
                body.screen_type || 'Standard',
                body.status || 'active'
            ]
        );

        const resultHeader = Array.isArray(result) ? result[0] : result;
        const screenId = (resultHeader as any).insertId;

        return NextResponse.json({
            success: true,
            message: 'Phòng chiếu đã được thêm thành công',
            data: { id_screen: screenId }
        });
    } catch (error: any) {
        console.error('Error creating screen:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể thêm phòng chiếu mới',
            error: error.message
        }, { status: 500 });
    }
}
