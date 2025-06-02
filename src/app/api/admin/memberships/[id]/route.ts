import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Lấy chi tiết membership
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log(`[ADMIN MEMBERSHIP DETAIL API] Fetching membership ID: ${id}`);

        const memberships = await query(`
            SELECT 
                m.*,
                (SELECT COUNT(*) FROM member mem WHERE mem.id_membership = m.id_membership) as member_count
            FROM membership m
            WHERE m.id_membership = ?
        `, [id]) as any[];

        if (!memberships || memberships.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy gói thành viên' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: memberships[0]
        });

    } catch (error) {
        console.error(`[ADMIN MEMBERSHIP DETAIL API] Error:`, error);
        return NextResponse.json(
            { success: false, message: 'Lỗi khi lấy thông tin gói thành viên' },
            { status: 500 }
        );
    }
}

// PUT - Cập nhật membership
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { code, title, image, link, description, benefits, criteria, status } = body;

        console.log(`[ADMIN MEMBERSHIP UPDATE API] Updating membership ID: ${id}`);

        // Validate required fields
        if (!code || !title) {
            return NextResponse.json(
                { success: false, message: 'Code và title là bắt buộc' },
                { status: 400 }
            );
        }

        // Check if membership exists
        const existingMembership = await query(
            'SELECT id_membership FROM membership WHERE id_membership = ?',
            [id]
        ) as any[];

        if (existingMembership.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy gói thành viên' },
                { status: 404 }
            );
        }

        // Check if code already exists (excluding current membership)
        const duplicateCode = await query(
            'SELECT id_membership FROM membership WHERE code = ? AND id_membership != ?',
            [code, id]
        ) as any[];

        if (duplicateCode.length > 0) {
            return NextResponse.json(
                { success: false, message: 'Code đã tồn tại' },
                { status: 400 }
            );
        }

        // Update membership
        await query(
            `UPDATE membership SET 
                code = ?, title = ?, image = ?, link = ?, 
                description = ?, benefits = ?, criteria = ?, status = ?
             WHERE id_membership = ?`,
            [code, title, image, link, description, benefits, criteria, status, id]
        );

        console.log(`[ADMIN MEMBERSHIP UPDATE API] Membership ${id} updated successfully`);

        return NextResponse.json({
            success: true,
            message: 'Cập nhật gói thành viên thành công'
        });

    } catch (error) {
        console.error(`[ADMIN MEMBERSHIP UPDATE API] Error:`, error);
        return NextResponse.json(
            { success: false, message: 'Lỗi khi cập nhật gói thành viên' },
            { status: 500 }
        );
    }
}

// DELETE - Xóa membership
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log(`[ADMIN MEMBERSHIP DELETE API] Deleting membership ID: ${id}`);

        // Check if membership exists
        const existingMembership = await query(
            'SELECT id_membership FROM membership WHERE id_membership = ?',
            [id]
        ) as any[];

        if (existingMembership.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy gói thành viên' },
                { status: 404 }
            );
        }

        // Check if membership is being used by members
        const membersUsingMembership = await query(
            'SELECT COUNT(*) as count FROM member WHERE id_membership = ?',
            [id]
        ) as any[];

        if (membersUsingMembership[0]?.count > 0) {
            return NextResponse.json(
                { success: false, message: 'Không thể xóa gói thành viên đang được sử dụng' },
                { status: 400 }
            );
        }

        // Delete membership
        await query('DELETE FROM membership WHERE id_membership = ?', [id]);

        console.log(`[ADMIN MEMBERSHIP DELETE API] Membership ${id} deleted successfully`);

        return NextResponse.json({
            success: true,
            message: 'Xóa gói thành viên thành công'
        });

    } catch (error) {
        console.error(`[ADMIN MEMBERSHIP DELETE API] Error:`, error);
        return NextResponse.json(
            { success: false, message: 'Lỗi khi xóa gói thành viên' },
            { status: 500 }
        );
    }
}
