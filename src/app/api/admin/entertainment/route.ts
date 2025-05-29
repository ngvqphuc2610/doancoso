import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Route để lấy danh sách giải trí từ database
export async function GET(req: NextRequest) {
    try {
        console.log('[ENTERTAINMENT API] Fetching entertainment from database');

        const result = await query(`
            SELECT
                e.*,
                c.cinema_name,
                s.staff_name
            FROM entertainment e
            LEFT JOIN cinemas c ON e.id_cinema = c.id_cinema
            LEFT JOIN staff s ON e.id_staff = s.id_staff
            ORDER BY e.id_entertainment ASC
        `);

        // Đảm bảo entertainment luôn là mảng
        let entertainment;
        if (Array.isArray(result)) {
            entertainment = result;
        } else if (Array.isArray(result[0])) {
            entertainment = result[0];
        } else {
            entertainment = result && typeof result === 'object' ?
                (Object.keys(result).length > 0 ? [result] : []) :
                (result ? [result] : []);
        }

        console.log('Kết quả truy vấn danh sách giải trí:', entertainment);
        console.log('Số lượng giải trí:', Array.isArray(entertainment) ? entertainment.length : 0);

        return NextResponse.json({
            success: true,
            data: entertainment
        });
    } catch (error: any) {
        console.error('Error fetching entertainment:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể lấy danh sách giải trí',
            error: error.message
        }, { status: 500 });
    }
}

// Route để thêm giải trí mới vào database
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.title) {
            return NextResponse.json(
                { success: false, message: 'Tiêu đề giải trí là bắt buộc' },
                { status: 400 }
            );
        }

        // Thêm giải trí mới vào database
        const result = await query(
            `INSERT INTO ENTERTAINMENT
             (title, description, image_url, type, status)
             VALUES (?, ?, ?, ?, ?)`,
            [
                body.title,
                body.description || '',
                body.image_url || '',
                body.type || 'game',
                body.status || 'active'
            ]
        );

        const resultHeader = Array.isArray(result) ? result[0] : result;
        const entertainmentId = (resultHeader as any).insertId;

        return NextResponse.json({
            success: true,
            message: 'Giải trí đã được thêm thành công',
            data: { id_entertainment: entertainmentId }
        });
    } catch (error: any) {
        console.error('Error creating entertainment:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể thêm giải trí mới',
            error: error.message
        }, { status: 500 });
    }
}
