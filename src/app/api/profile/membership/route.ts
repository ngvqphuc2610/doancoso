import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET - Lấy thông tin membership của user
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
        const userId = decoded.userId;

        // Get member info with details
        const memberInfo = await query(`
            SELECT
                m.id_member,
                m.points,
                m.join_date,
                m.status as member_status,
                tm.type_name,
                tm.description as type_description,
                ms.title as package_name,
                ms.benefits,
                ms.description as package_description,
                u.full_name,
                u.email
            FROM member m
            JOIN users u ON m.id_user = u.id_users
            LEFT JOIN type_member tm ON m.id_typemember = tm.id_typemember
            LEFT JOIN membership ms ON m.id_membership = ms.id_membership
            WHERE m.id_user = ? AND m.status = 'active'
        `, [userId]);

        const member = Array.isArray(memberInfo) && memberInfo.length > 0 ? memberInfo[0] : null;

        if (!member) {
            return NextResponse.json({
                success: true,
                data: null,
                message: 'Bạn chưa là thành viên'
            });
        }

        // Get available membership packages
        const packages = await query(`
            SELECT
                id_membership,
                title as package_name,
                benefits,
                description,
                status
            FROM membership
            WHERE status = 'active'
            ORDER BY id_membership ASC
        `);

        // Get member types
        const memberTypes = await query(`
            SELECT
                id_typemember,
                type_name,
                description
            FROM type_member
            ORDER BY priority ASC
        `);

        // Format response
        const membershipData = {
            member: {
                id: member.id_member,
                points: member.points || 0,
                joinDate: member.join_date,
                status: member.member_status,
                fullName: member.full_name,
                email: member.email
            },
            currentType: member.type_name ? {
                name: member.type_name,
                description: member.type_description
            } : null,
            currentPackage: member.package_name ? {
                name: member.package_name,
                benefits: member.benefits,
                description: member.package_description
            } : null,
            availablePackages: packages,
            memberTypes: memberTypes
        };

        return NextResponse.json({
            success: true,
            data: membershipData
        });

    } catch (error) {
        console.error('Error fetching membership info:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server khi lấy thông tin thành viên'
        }, { status: 500 });
    }
}

// POST - Đăng ký membership
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
        const { membershipId, memberTypeId } = body;

        // Validate required fields
        if (!membershipId) {
            return NextResponse.json({
                success: false,
                message: 'Vui lòng chọn gói thành viên'
            }, { status: 400 });
        }

        // Check if user already has membership
        const existingMember = await query(
            'SELECT id_member FROM member WHERE id_user = ? AND status = "active"',
            [userId]
        );

        if (Array.isArray(existingMember) && existingMember.length > 0) {
            return NextResponse.json({
                success: false,
                message: 'Bạn đã là thành viên rồi'
            }, { status: 400 });
        }

        // Validate membership package exists
        const membershipPackage = await query(
            'SELECT * FROM membership WHERE id_membership = ? AND status = "active"',
            [membershipId]
        );

        if (!Array.isArray(membershipPackage) || membershipPackage.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Gói thành viên không tồn tại'
            }, { status: 400 });
        }

        // Create new member
        await query(`
            INSERT INTO member (id_user, id_typemember, id_membership, points, join_date, status)
            VALUES (?, ?, ?, 0, CURDATE(), 'active')
        `, [userId, memberTypeId || 1, membershipId]);

        return NextResponse.json({
            success: true,
            message: 'Đăng ký thành viên thành công'
        });

    } catch (error) {
        console.error('Error registering membership:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server khi đăng ký thành viên'
        }, { status: 500 });
    }
}
