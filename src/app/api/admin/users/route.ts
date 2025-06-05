import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/db';
import bcrypt from 'bcryptjs';

// GET - Lấy danh sách users
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || '';
        const status = searchParams.get('status') || '';
        const offset = (page - 1) * limit;

        console.log('Page:', page, 'Limit:', limit, 'Offset:', offset);
        console.log('Types:', typeof page, typeof limit, typeof offset);

        // Build dynamic query with filters
        let sql = `
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
                u.role,
                u.status,
                u.created_at,
                u.updated_at,
                m.id_member,
                m.points as member_points,
                m.join_date as member_join_date,
                m.status as member_status
            FROM users u
            LEFT JOIN member m ON u.id_users = m.id_user AND m.status = 'active'
            WHERE 1=1
        `;

        let countSql = `
            SELECT COUNT(*) as total
            FROM users u
            WHERE 1=1
        `;

        const conditions = [];

        if (search) {
            conditions.push(`(u.username LIKE '%${search}%' OR u.email LIKE '%${search}%' OR u.full_name LIKE '%${search}%')`);
        }

        if (role) {
            conditions.push(`u.role = '${role}'`);
        }

        if (status) {
            conditions.push(`u.status = '${status}'`);
        }

        if (conditions.length > 0) {
            const whereClause = ' AND ' + conditions.join(' AND ');
            sql += whereClause;
            countSql += whereClause;
        }

        sql += ` ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

        const users = await query(sql);
        const countResult = await query(countSql);

        const total = Array.isArray(countResult) && countResult.length > 0 ? countResult[0].total : 0;
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server khi lấy danh sách người dùng'
        }, { status: 500 });
    }
}



// POST - Tạo user mới
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            username,
            email,
            password,
            fullName,
            phoneNumber,
            dateOfBirth,
            gender,
            address,
            role = 'client'
        } = body;

        // Validate required fields
        if (!username || !email || !password || !fullName) {
            return NextResponse.json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                success: false,
                message: 'Email không hợp lệ'
            }, { status: 400 });
        }

        // Check if username or email already exists
        const existingUser = await query(
            'SELECT id_users FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (Array.isArray(existingUser) && existingUser.length > 0) {
            return NextResponse.json({
                success: false,
                message: 'Tên đăng nhập hoặc email đã tồn tại'
            }, { status: 400 });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const result = await query(`
            INSERT INTO users (
                username, email, password_hash, full_name, phone_number, 
                date_of_birth, gender, address, role, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
        `, [
            username,
            email,
            hashedPassword,
            fullName,
            phoneNumber || null,
            dateOfBirth || null,
            gender || null,
            address || null,
            role
        ]);

        return NextResponse.json({
            success: true,
            message: 'Tạo người dùng thành công',
            data: { id: (result as any).insertId }
        });

    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server khi tạo người dùng'
        }, { status: 500 });
    }
}

// PUT - Cập nhật user
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            id,
            username,
            email,
            fullName,
            phoneNumber,
            dateOfBirth,
            gender,
            address,
            role,
            status
        } = body;

        // Validate required fields
        if (!id || !username || !email || !fullName) {
            return NextResponse.json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            }, { status: 400 });
        }

        // Check if username or email already exists (excluding current user)
        const existingUser = await query(
            'SELECT id_users FROM users WHERE (username = ? OR email = ?) AND id_users != ?',
            [username, email, id]
        );

        if (Array.isArray(existingUser) && existingUser.length > 0) {
            return NextResponse.json({
                success: false,
                message: 'Tên đăng nhập hoặc email đã tồn tại'
            }, { status: 400 });
        }

        // Update user
        await query(`
            UPDATE users SET 
                username = ?,
                email = ?,
                full_name = ?,
                phone_number = ?,
                date_of_birth = ?,
                gender = ?,
                address = ?,
                role = ?,
                status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id_users = ?
        `, [
            username,
            email,
            fullName,
            phoneNumber || null,
            dateOfBirth || null,
            gender || null,
            address || null,
            role,
            status,
            id
        ]);

        return NextResponse.json({
            success: true,
            message: 'Cập nhật người dùng thành công'
        });

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server khi cập nhật người dùng'
        }, { status: 500 });
    }
}

// DELETE - Xóa user
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'ID người dùng là bắt buộc'
            }, { status: 400 });
        }

        // Soft delete user
        await query(
            'UPDATE users SET status = "deleted", updated_at = CURRENT_TIMESTAMP WHERE id_users = ?',
            [id]
        );

        return NextResponse.json({
            success: true,
            message: 'Xóa người dùng thành công'
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server khi xóa người dùng'
        }, { status: 500 });
    }
}
