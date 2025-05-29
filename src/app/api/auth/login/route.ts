import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, password } = body;

        // Validate required fields
        if (!username || !password) {
            return NextResponse.json({
                success: false,
                message: 'Vui lòng nhập tên đăng nhập và mật khẩu'
            }, { status: 400 });
        }

        // Find user by username or email
        const users = await query(
            'SELECT * FROM users WHERE (username = ? OR email = ?) AND status = "active"',
            [username, username]
        );

        const user = Array.isArray(users) && users.length > 0 ? users[0] : null;

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
            }, { status: 401 });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return NextResponse.json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
            }, { status: 401 });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user.id_users,
                username: user.username,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Create response
        const response = NextResponse.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                user: {
                    id: user.id_users,
                    username: user.username,
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role
                },
                token
            }
        });

        // Set HTTP-only cookie
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({
            success: false,
            message: 'Đã xảy ra lỗi khi đăng nhập',
            error: error.message
        }, { status: 500 });
    }
}
