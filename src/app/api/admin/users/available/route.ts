import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/db';

// GET - Lấy danh sách users có thể chọn làm member
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type'); // chỉ hỗ trợ 'member'
        const search = searchParams.get('search') || '';

        let whereClause = 'WHERE u.status = "active"';
        const queryParams: any[] = [];

        if (search) {
            whereClause += ' AND (u.username LIKE ? OR u.email LIKE ? OR u.full_name LIKE ?)';
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (type === 'member') {
            // Lấy users chưa là member
            whereClause += ' AND NOT EXISTS (SELECT 1 FROM member m WHERE m.id_user = u.id_users AND m.status = "active")';
        }

        const users = await query(`
            SELECT 
                u.id_users,
                u.username,
                u.email,
                u.full_name,
                u.phone_number,
                u.role,
                u.created_at
            FROM users u
            ${whereClause}
            ORDER BY u.full_name ASC
            LIMIT 50
        `, queryParams);

        return NextResponse.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Error fetching available users:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server khi lấy danh sách người dùng'
        }, { status: 500 });
    }
}
