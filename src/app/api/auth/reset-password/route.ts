import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/db';
import bcrypt from 'bcryptjs';

// POST - Reset password
export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({
                success: false,
                message: 'Token và mật khẩu là bắt buộc'
            }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 6 ký tự'
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
                message: 'Token không hợp lệ hoặc đã hết hạn'
            }, { status: 400 });
        }

        const user = users[0];

        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update password and clear reset token
        await query(
            'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = CURRENT_TIMESTAMP WHERE id_users = ?',
            [hashedPassword, user.id_users]
        );

        return NextResponse.json({
            success: true,
            message: 'Mật khẩu đã được đặt lại thành công'
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server'
        }, { status: 500 });
    }
}
