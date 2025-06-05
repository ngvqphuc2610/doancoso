import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/db';

// POST - Verify reset token
export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({
                success: false,
                message: 'Token là bắt buộc'
            }, { status: 400 });
        }

        // Check if token exists and is not expired
        const users = await query(
            'SELECT id_users FROM users WHERE reset_token = ? AND reset_token_expiry > NOW() AND status = "active"',
            [token]
        );

        if (!Array.isArray(users) || users.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: 'Token hợp lệ'
        });

    } catch (error) {
        console.error('Error verifying reset token:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server'
        }, { status: 500 });
    }
}
