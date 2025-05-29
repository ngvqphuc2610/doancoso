import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// Route để lấy danh sách rạp từ database
export async function GET(req: NextRequest) {
    // Check authentication and admin role
    const authResult = await requireAuth(req, 'admin');
    if (!authResult.success) {
        return NextResponse.json({
            success: false,
            message: authResult.message
        }, { status: authResult.status });
    }
    try {
        console.log('[CINEMA API] Fetching cinemas from database');

        const result = await query('SELECT * FROM CINEMAS ORDER BY id_cinema ASC');

        // Đảm bảo cinemas luôn là mảng
        let cinemas;
        if (Array.isArray(result)) {
            // Nếu result là mảng (kết quả thông thường của MySQL)
            cinemas = result;
        } else if (Array.isArray(result[0])) {
            // Nếu result[0] là mảng (kết quả của mysql2)
            cinemas = result[0];
        } else {
            // Trường hợp còn lại, đảm bảo luôn là mảng
            cinemas = result && typeof result === 'object' ?
                (Object.keys(result).length > 0 ? [result] : []) :
                (result ? [result] : []);
        }

        console.log('Kết quả truy vấn danh sách rạp:', cinemas);
        console.log('Số lượng rạp:', Array.isArray(cinemas) ? cinemas.length : 0);

        // Trả về kết quả thành công
        return NextResponse.json({
            success: true,
            data: cinemas // Đảm bảo trả về mảng
        });
    } catch (error: any) {
        // In ra chi tiết lỗi để debug
        console.error('Lỗi khi truy vấn danh sách rạp chiếu:', error);
        console.error('Chi tiết lỗi:', error.message);
        console.error('Stack trace:', error.stack);

        // Trả về thông tin lỗi chi tiết
        return NextResponse.json({
            success: false,
            message: 'Không thể lấy danh sách rạp chiếu',
            errorDetails: {
                message: error.message,
                code: error.code,
                sqlMessage: error.sqlMessage,
                sqlState: error.sqlState
            }
        }, { status: 500 });
    }
}

// Route để thêm rạp mới vào database
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.cinema_name) {
            return NextResponse.json(
                { success: false, message: 'Tên rạp chiếu là bắt buộc' },
                { status: 400 }
            );
        }

        // Thêm rạp mới vào database
        const result = await query(
            `INSERT INTO CINEMAS
             (cinema_name, address, city, description, image, contact_number, email, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                body.cinema_name,
                body.address || '',
                body.city || '',
                body.description || '',
                body.image || '',
                body.contact_number || '',
                body.email || '',
                body.status || 'active'
            ]
        );

        const resultHeader = Array.isArray(result) ? result[0] : result;
        const cinemaId = (resultHeader as any).insertId;

        return NextResponse.json({
            success: true,
            message: 'Rạp chiếu đã được thêm thành công',
            data: { id_cinema: cinemaId }
        });
    } catch (error: any) {
        console.error('Error creating cinema:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể thêm rạp chiếu mới',
            error: error.message
        }, { status: 500 });
    }
}
