import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Route để lấy danh sách khuyến mãi từ database
export async function GET(req: NextRequest) {
    try {
        console.log('[PROMOTIONS API] Fetching promotions from database');

        const result = await query('SELECT * FROM promotions ORDER BY id_promotions ASC');

        // Đảm bảo promotions luôn là mảng
        let promotions;
        if (Array.isArray(result)) {
            promotions = result;
        } else if (Array.isArray(result[0])) {
            promotions = result[0];
        } else {
            promotions = result && typeof result === 'object' ?
                (Object.keys(result).length > 0 ? [result] : []) :
                (result ? [result] : []);
        }

        console.log('Kết quả truy vấn danh sách khuyến mãi:', promotions);
        console.log('Số lượng khuyến mãi:', Array.isArray(promotions) ? promotions.length : 0);

        return NextResponse.json({
            success: true,
            data: promotions
        });
    } catch (error: any) {
        console.error('Error fetching promotions:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể lấy danh sách khuyến mãi',
            error: error.message
        }, { status: 500 });
    }
}

// Route để thêm khuyến mãi mới vào database
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.title) {
            return NextResponse.json(
                { success: false, message: 'Tiêu đề khuyến mãi là bắt buộc' },
                { status: 400 }
            );
        }

        // Thêm khuyến mãi mới vào database
        const result = await query(
            `INSERT INTO PROMOTIONS
             (title, description, discount_percent, start_date, end_date, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                body.title,
                body.description || '',
                body.discount_percent || 0,
                body.start_date || new Date(),
                body.end_date || new Date(),
                body.status || 'active'
            ]
        );

        const resultHeader = Array.isArray(result) ? result[0] : result;
        const promotionId = (resultHeader as any).insertId;

        return NextResponse.json({
            success: true,
            message: 'Khuyến mãi đã được thêm thành công',
            data: { id_promotion: promotionId }
        });
    } catch (error: any) {
        console.error('Error creating promotion:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể thêm khuyến mãi mới',
            error: error.message
        }, { status: 500 });
    }
}
