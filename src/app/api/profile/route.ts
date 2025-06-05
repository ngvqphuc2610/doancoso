import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '@/config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET - Lấy thông tin profile user
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

        // Get user profile with member info
        const users = await query(`
            SELECT
                u.id_users,
                u.username,
                u.email,
                u.full_name,
                u.phone_number,
                u.date_of_birth,
                u.gender,
                u.address,
                u.profile_image,
                u.created_at,
                u.role,
                u.status,
                m.id_member,
                m.points,
                m.join_date as member_join_date,
                m.status as member_status,
                tm.type_name as member_type,
                ms.title as membership_package,
                ms.benefits as membership_benefits
            FROM users u
            LEFT JOIN member m ON u.id_users = m.id_user
            LEFT JOIN type_member tm ON m.id_typemember = tm.id_typemember
            LEFT JOIN membership ms ON m.id_membership = ms.id_membership
            WHERE u.id_users = ? AND u.status = "active"
        `, [decoded.userId]);

        const user = Array.isArray(users) && users.length > 0 ? users[0] : null;

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Người dùng không tồn tại'
            }, { status: 404 });
        }

        // Format response
        const profileData = {
            id: user.id_users,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            phone: user.phone_number,
            dateOfBirth: user.date_of_birth,
            gender: user.gender,
            address: user.address,
            profileImage: user.profile_image,
            createdAt: user.created_at,
            role: user.role,
            status: user.status,
            member: user.id_member ? {
                id: user.id_member,
                points: user.points || 0,
                joinDate: user.member_join_date,
                status: user.member_status,
                type: user.member_type,
                package: user.membership_package,
                benefits: user.membership_benefits
            } : null
        };

        return NextResponse.json({
            success: true,
            data: profileData
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server khi lấy thông tin profile'
        }, { status: 500 });
    }
}

// PUT - Cập nhật thông tin profile user
export async function PUT(req: NextRequest) {
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
        const {
            fullName,
            phone,
            dateOfBirth,
            gender,
            address,
            profileImage
        } = body;

        // Validate required fields
        if (!fullName) {
            return NextResponse.json({
                success: false,
                message: 'Họ tên là bắt buộc'
            }, { status: 400 });
        }

        // Validate phone format if provided
        if (phone && !/^[0-9]{10,11}$/.test(phone)) {
            return NextResponse.json({
                success: false,
                message: 'Số điện thoại không hợp lệ'
            }, { status: 400 });
        }

        // Convert undefined to null for database
        const updateParams = [
            fullName,
            phone || null,
            dateOfBirth || null,
            gender || null,
            address || null,
            profileImage || null,
            userId
        ];

        // Update user profile
        await query(`
            UPDATE users SET
                full_name = ?,
                phone_number = ?,
                date_of_birth = ?,
                gender = ?,
                address = ?,
                profile_image = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id_users = ?
        `, updateParams);

        return NextResponse.json({
            success: true,
            message: 'Cập nhật thông tin thành công'
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server khi cập nhật thông tin'
        }, { status: 500 });
    }
}
