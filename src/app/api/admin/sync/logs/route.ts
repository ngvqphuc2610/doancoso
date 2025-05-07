import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { query } from '@/lib/db';

// Route để lấy lịch sử đồng bộ từ bảng SYNC_LOGS
export async function GET(req: NextRequest) {
    try {
        // Lấy danh sách logs từ database, sắp xếp theo thời gian mới nhất
        const logs = await query(
            `SELECT * FROM SYNC_LOGS
       ORDER BY started_at DESC
       LIMIT 50`
        );

        return NextResponse.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Error fetching sync logs:', error);
        return NextResponse.json(
            { success: false, message: 'Không thể tải lịch sử đồng bộ' },
            { status: 500 }
        );
    }
}