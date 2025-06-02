import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Route để lấy chi tiết một entertainment
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        console.log(`[ENTERTAINMENT DETAIL API] Fetching entertainment ID: ${id}`);

        const entertainments = await query(`
            SELECT
                e.*,
                c.cinema_name,
                c.address as cinema_address,
                c.city as cinema_city,
                s.staff_name
            FROM entertainment e
            LEFT JOIN cinemas c ON e.id_cinema = c.id_cinema
            LEFT JOIN staff s ON e.id_staff = s.id_staff
            WHERE e.id_entertainment = ? AND e.status = 'active'
        `, [id]) as any[];

        if (!entertainments || entertainments.length === 0) {
            console.log(`[ENTERTAINMENT DETAIL API] Entertainment not found: ${id}`);
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy thông tin giải trí' },
                { status: 404 }
            );
        }

        const entertainment = entertainments[0];

        console.log(`[ENTERTAINMENT DETAIL API] Found entertainment: ${entertainment.title}`);

        return NextResponse.json({
            success: true,
            data: entertainment
        });
    } catch (error: any) {
        const resolvedParams = await params;
        console.error(`[ENTERTAINMENT DETAIL API] Error fetching entertainment ${resolvedParams.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể tải thông tin giải trí' },
            { status: 500 }
        );
    }
}

// Route để tăng view count
export async function PATCH(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        console.log(`[ENTERTAINMENT VIEW API] Incrementing view count for ID: ${id}`);

        // Tăng view count
        await query(
            'UPDATE entertainment SET views_count = views_count + 1 WHERE id_entertainment = ? AND status = "active"',
            [id]
        );

        return NextResponse.json({
            success: true,
            message: 'View count updated'
        });
    } catch (error: any) {
        const resolvedParams = await params;
        console.error(`[ENTERTAINMENT VIEW API] Error updating view count ${resolvedParams.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật lượt xem' },
            { status: 500 }
        );
    }
}
