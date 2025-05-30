import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Route để lấy chi tiết một entertainment
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const entertainments = await query(`
            SELECT
                e.*,
                c.cinema_name,
                s.full_name as staff_name
            FROM entertainment e
            LEFT JOIN cinemas c ON e.id_cinema = c.id_cinema
            LEFT JOIN staff s ON e.id_staff = s.id_staff
            WHERE e.id_entertainment = ?
        `, [id]) as any[];

        if (!entertainments || entertainments.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy thông tin giải trí' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: entertainments[0]
        });
    } catch (error: any) {
        const resolvedParams = await params;
        console.error(`Error fetching entertainment ${resolvedParams.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể tải dịch vụ giải trí' },
            { status: 500 }
        );
    }
}

// Route để cập nhật thông tin entertainment
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Validate required fields
        if (!body.title || !body.start_date) {
            return NextResponse.json(
                { success: false, message: 'Tiêu đề và ngày bắt đầu là bắt buộc' },
                { status: 400 }
            );
        }

        // Cập nhật entertainment trong database
        await query(`
            UPDATE entertainment
            SET title = ?, description = ?, image_url = ?, start_date = ?,
                end_date = ?, status = ?, featured = ?
            WHERE id_entertainment = ?
        `, [
            body.title,
            body.description || null,
            body.image_url || null,
            body.start_date,
            body.end_date || null,
            body.status || 'active',
            body.featured ? 1 : 0,
            id
        ]);

        return NextResponse.json({
            success: true,
            message: 'Cập nhật thông tin giải trí thành công'
        });
    } catch (error: any) {
        const resolvedParams = await params;
        console.error(`Error updating entertainment ${resolvedParams.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật thông tin giải trí' },
            { status: 500 }
        );
    }
}

// Route để xóa entertainment
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Xóa entertainment từ database
        await query('DELETE FROM entertainment WHERE id_entertainment = ?', [id]);

        return NextResponse.json({
            success: true,
            message: 'Xóa thông tin giải trí thành công'
        });
    } catch (error: any) {
        const resolvedParams = await params;
        console.error(`Error deleting entertainment ${resolvedParams.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể xóa thông tin giải trí' },
            { status: 500 }
        );
    }
}

// Route để cập nhật trạng thái entertainment (PATCH)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Cập nhật trạng thái entertainment
        await query('UPDATE entertainment SET status = ? WHERE id_entertainment = ?', [body.status, id]);

        return NextResponse.json({
            success: true,
            message: 'Cập nhật trạng thái thông tin giải trí thành công'
        });
    } catch (error: any) {
        const resolvedParams = await params;
        console.error(`Error updating entertainment status ${resolvedParams.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật trạng thái thông tin giải trí' },
            { status: 500 }
        );
    }
}
