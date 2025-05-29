import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // Thử thực hiện một câu query đơn giản
        const result = await query('SELECT 1 as test');
        
        return NextResponse.json({
            success: true,
            message: 'Kết nối đến cơ sở dữ liệu thành công',
            data: result
        });
    } catch (error: any) {
        console.error('Lỗi kết nối đến cơ sở dữ liệu:', error);
        
        return NextResponse.json({
            success: false,
            message: 'Không thể kết nối đến cơ sở dữ liệu',
            error: error.message
        }, { status: 500 });
    }
}
