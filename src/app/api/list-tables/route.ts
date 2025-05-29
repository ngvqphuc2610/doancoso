import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const tables = await query('SHOW TABLES');
        
        return NextResponse.json({
            success: true,
            message: 'Danh sách các bảng trong CSDL',
            data: tables
        });
    } catch (error: any) {
        console.error('Lỗi khi lấy danh sách bảng:', error);
        
        return NextResponse.json({
            success: false,
            message: 'Không thể lấy danh sách bảng',
            error: error.message
        }, { status: 500 });
    }
}
