import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
    try {
        // Get token from cookie
        const token = req.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({
                success: false,
                message: 'Không tìm thấy token xác thực'
            }, { status: 401 });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // Get user from database
        const users = await query(
            'SELECT id_users, username, email, full_name, phone_number, role, status FROM users WHERE id_users = ? AND status = "active"',
            [decoded.userId]
        );

        const user = Array.isArray(users) && users.length > 0 ? users[0] : null;

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Người dùng không tồn tại'
            }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            data: {
                id: user.id_users,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                phone: user.phone_number,
                role: user.role
            }
        });

    } catch (error: any) {
        console.error('Auth check error:', error);
        return NextResponse.json({
            success: false,
            message: 'Token không hợp lệ',
            error: error.message
        }, { status: 401 });
    }
}
