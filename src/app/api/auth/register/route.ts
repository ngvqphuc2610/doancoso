import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            fullname,
            birthday,
            phone,
            username,
            cmnd,
            email,
            password,
            confirmPassword
        } = body;

        // Validate required fields
        if (!fullname || !birthday || !phone || !username || !cmnd || !email || !password || !confirmPassword) {
            return NextResponse.json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            }, { status: 400 });
        }

        // Validate password match
        if (password !== confirmPassword) {
            return NextResponse.json({
                success: false,
                message: 'Mật khẩu xác nhận không khớp'
            }, { status: 400 });
        }

        // Check if username already exists
        const existingUsername = await query(
            'SELECT id_users FROM users WHERE username = ?',
            [username]
        );

        if (Array.isArray(existingUsername) && existingUsername.length > 0) {
            return NextResponse.json({
                success: false,
                message: 'Tên đăng nhập đã tồn tại'
            }, { status: 400 });
        }

        // Check if email already exists
        const existingEmail = await query(
            'SELECT id_users FROM users WHERE email = ?',
            [email]
        );

        if (Array.isArray(existingEmail) && existingEmail.length > 0) {
            return NextResponse.json({
                success: false,
                message: 'Email đã được sử dụng'
            }, { status: 400 });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user với schema đúng
        const result = await query(
            `INSERT INTO users
             (username, email, password_hash, full_name, phone_number, date_of_birth, role, status)
             VALUES (?, ?, ?, ?, ?, ?, 'user', 'active')`,
            [username, email, hashedPassword, fullname, phone, birthday]
        );

        const resultHeader = Array.isArray(result) ? result[0] : result;
        const userId = (resultHeader as any).insertId;

        return NextResponse.json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                id: userId,
                username,
                email,
                fullname,
                role: 'user'
            }
        });

    } catch (error: any) {
        console.error('Register error:', error);
        return NextResponse.json({
            success: false,
            message: 'Đã xảy ra lỗi khi đăng ký',
            error: error.message
        }, { status: 500 });
    }
}
