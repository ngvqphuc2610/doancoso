import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/db';

// GET - Lấy danh sách members
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const offset = (page - 1) * limit;

        // Build query conditions and parameters safely
        let whereClause = '1=1';
        let queryParams: any[] = [];

        if (search) {
            whereClause += ` AND (u.username LIKE ? OR u.email LIKE ? OR u.full_name LIKE ?)`;
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern, searchPattern);
        }

        if (status) {
            whereClause += ` AND m.status = ?`;
            queryParams.push(status);
        }

        // Query for members with parameters
        const sqlQuery = `
            SELECT
                m.id_member,
                m.id_user,
                m.id_typemember,
                m.id_membership,
                m.points,
                m.join_date,
                m.status as member_status,
                u.username,
                u.email,
                u.full_name,
                u.phone_number,
                u.profile_image,
                u.created_at as user_created_at,
                tm.type_name,
                tm.description as type_description,
                ms.title as membership_title,
                ms.benefits as membership_benefits
            FROM member m
            JOIN users u ON m.id_user = u.id_users
            LEFT JOIN type_member tm ON m.id_typemember = tm.id_typemember
            LEFT JOIN membership ms ON m.id_membership = ms.id_membership
            WHERE ${whereClause}
            ORDER BY m.join_date DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        // Count query for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM member m
            JOIN users u ON m.id_user = u.id_users
            WHERE ${whereClause}
        `;

        const members = await query(sqlQuery, queryParams);
        const countResult = await query(countQuery, queryParams);

        const total = Array.isArray(countResult) && countResult.length > 0 ? countResult[0].total : 0;
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: {
                members,
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
        console.error('Error fetching members:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server khi lấy danh sách thành viên'
        }, { status: 500 });
    }
}

// POST - Tạo member mới từ user
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, membershipId, typeId } = body;

        // Validate required fields
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: 'ID người dùng là bắt buộc'
            }, { status: 400 });
        }

        // Check if user exists and is not already a member
        const user = await query(
            'SELECT id_users, full_name FROM users WHERE id_users = ? AND status = "active"',
            [userId]
        );

        if (!Array.isArray(user) || user.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Người dùng không tồn tại hoặc đã bị vô hiệu hóa'
            }, { status: 400 });
        }

        // Check if user is already a member
        const existingMember = await query(
            'SELECT id_member FROM member WHERE id_user = ? AND status = "active"',
            [userId]
        );

        if (Array.isArray(existingMember) && existingMember.length > 0) {
            return NextResponse.json({
                success: false,
                message: 'Người dùng này đã là thành viên'
            }, { status: 400 });
        }

        // Create member - use default typeId=1 (basic), avoid referencing membershipId if not needed
        const result = await query(`
            INSERT INTO member (
                id_user, id_typemember, id_membership, points, join_date, status
            ) VALUES (?, ?, ?, 0, CURDATE(), 'active')
        `, [userId, typeId || 1, membershipId || null]);

        return NextResponse.json({
            success: true,
            message: 'Tạo thành viên thành công',
            data: { id: (result as any).insertId }
        });

    } catch (error) {
        console.error('Error creating member:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server khi tạo thành viên'
        }, { status: 500 });
    }
}

// PUT - Cập nhật member
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, typeId, membershipId, points, status } = body;

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'ID thành viên là bắt buộc'
            }, { status: 400 });
        }

        // Check if member exists
        const existingMember = await query('SELECT id_member FROM member WHERE id_member = ?', [id]);
        if (!Array.isArray(existingMember) || existingMember.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Thành viên không tồn tại'
            }, { status: 404 });
        }

        // Update member
        await query(`
            UPDATE member SET
                id_typemember = ?,
                id_membership = ?,
                points = ?,
                status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id_member = ?
        `, [typeId || null, membershipId || null, points || 0, status || 'active', id]);

        return NextResponse.json({
            success: true,
            message: 'Cập nhật thành viên thành công'
        });

    } catch (error) {
        console.error('Error updating member:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server khi cập nhật thành viên'
        }, { status: 500 });
    }
}

// DELETE - Xóa member (soft delete)
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'ID thành viên là bắt buộc'
            }, { status: 400 });
        }

        // Check if member exists
        const member = await query('SELECT id_member FROM member WHERE id_member = ?', [id]);
        if (!Array.isArray(member) || member.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Thành viên không tồn tại'
            }, { status: 404 });
        }

        // Soft delete member
        await query(
            'UPDATE member SET status = "inactive" WHERE id_member = ?',
            [id]
        );

        return NextResponse.json({
            success: true,
            message: 'Đã vô hiệu hóa thành viên thành công'
        });

    } catch (error) {
        console.error('Error deleting member:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server khi xóa thành viên'
        }, { status: 500 });
    }
}