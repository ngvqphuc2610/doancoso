import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Route để lấy danh sách loại ghế từ database
export async function GET(req: NextRequest) {
    try {
        console.log('[SEAT TYPES API] Fetching seat types from database');

        const result = await query(`
            SELECT 
                id_seattype,
                type_name,
                description,
                price_multiplier
            FROM seat_type
            ORDER BY id_seattype ASC
        `);

        // Đảm bảo seatTypes luôn là mảng
        let seatTypes;
        if (Array.isArray(result)) {
            seatTypes = result;
        } else if (Array.isArray(result[0])) {
            seatTypes = result[0];
        } else {
            seatTypes = result && typeof result === 'object' ?
                (Object.keys(result).length > 0 ? [result] : []) :
                (result ? [result] : []);
        }

        console.log('Kết quả truy vấn danh sách loại ghế:', seatTypes);
        console.log('Số lượng loại ghế:', Array.isArray(seatTypes) ? seatTypes.length : 0);

        return NextResponse.json({
            success: true,
            data: seatTypes
        });
    } catch (error: any) {
        console.error('Error fetching seat types:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể lấy danh sách loại ghế',
            error: error.message
        }, { status: 500 });
    }
}

// Route để thêm loại ghế mới vào database
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.type_name) {
            return NextResponse.json(
                { success: false, message: 'Tên loại ghế là bắt buộc' },
                { status: 400 }
            );
        }

        // Thêm loại ghế mới vào database
        const result = await query(
            `INSERT INTO seat_type
             (type_name, description, price_multiplier)
             VALUES (?, ?, ?)`,
            [
                body.type_name,
                body.description || null,
                body.price_multiplier || 1.0
            ]
        );

        const resultHeader = Array.isArray(result) ? result[0] : result;
        const seatTypeId = (resultHeader as any).insertId;

        return NextResponse.json({
            success: true,
            message: 'Loại ghế đã được thêm thành công',
            data: { id_seattype: seatTypeId }
        });
    } catch (error: any) {
        console.error('Error creating seat type:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể thêm loại ghế mới',
            error: error.message
        }, { status: 500 });
    }
}
