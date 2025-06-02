import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Route để lấy chi tiết một membership
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        console.log(`[MEMBERSHIP DETAIL API] Fetching membership ID: ${id}`);

        const memberships = await query(`
            SELECT 
                m.*
            FROM membership m
            WHERE m.id_membership = ? AND m.status = 'active'
        `, [id]) as any[];

        if (!memberships || memberships.length === 0) {
            console.log(`[MEMBERSHIP DETAIL API] Membership not found: ${id}`);
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy thông tin gói thành viên' },
                { status: 404 }
            );
        }

        const membership = memberships[0];

        console.log(`[MEMBERSHIP DETAIL API] Found membership: ${membership.title}`);

        return NextResponse.json({
            success: true,
            data: membership
        });
    } catch (error: any) {
        const resolvedParams = await params;
        console.error(`[MEMBERSHIP DETAIL API] Error fetching membership ${resolvedParams.id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể tải thông tin gói thành viên' },
            { status: 500 }
        );
    }
}
