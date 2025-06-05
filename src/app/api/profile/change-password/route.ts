import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '@/config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST - Đổi mật khẩu
export async function POST(req: NextRequest) {
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
        const userId = decoded.userId;

        const body = await req.json();
        const { currentPassword, newPassword, confirmPassword } = body;

        // Validate required fields
        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            }, { status: 400 });
        }

        // Validate new password
        if (newPassword.length < 6) {
            return NextResponse.json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
            }, { status: 400 });
        }

        // Validate password confirmation
        if (newPassword !== confirmPassword) {
            return NextResponse.json({
                success: false,
                message: 'Mật khẩu xác nhận không khớp'
            }, { status: 400 });
        }

        // Get current user
        const users = await query(
            'SELECT id_users, password_hash FROM users WHERE id_users = ? AND status = "active"',
            [userId]
        );

        const user = Array.isArray(users) && users.length > 0 ? users[0] : null;

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Người dùng không tồn tại'
            }, { status: 404 });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isCurrentPasswordValid) {
            return NextResponse.json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
            }, { status: 400 });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await query(
            'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id_users = ?',
            [hashedNewPassword, userId]
        );

        return NextResponse.json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });

    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server khi đổi mật khẩu'
        }, { status: 500 });
    }
}
