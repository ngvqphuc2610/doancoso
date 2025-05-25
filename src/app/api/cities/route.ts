import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const sql = `
            SELECT DISTINCT cinema_name, city
            FROM CINEMAS
            WHERE status = 'active'
            ORDER BY city
        `;

        const rows = await query(sql);

        return new NextResponse(
            JSON.stringify({ 
                success: true, 
                data: rows 
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (error) {
        console.error('Error fetching cities:', error);
        return new NextResponse(
            JSON.stringify({ 
                success: false, 
                error: 'Lỗi khi lấy danh sách thành phố' 
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}
