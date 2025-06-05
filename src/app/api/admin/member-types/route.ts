import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/db';

// GET - Lấy danh sách member types
export async function GET(req: NextRequest) {
    try {
        const memberTypes = await query(`
            SELECT 
                id_typemember,
                type_name,
                description,
                priority
            FROM type_member
            ORDER BY priority ASC
        `);

        return NextResponse.json({
            success: true,
            data: memberTypes
        });

    } catch (error) {
        console.error('Error fetching member types:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server khi lấy danh sách loại thành viên'
        }, { status: 500 });
    }
}
