import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        console.log('[ENTERTAINMENT API] Fetching entertainments from database');

        const entertainments = await query(`
            SELECT
                e.*,
                c.cinema_name,
                s.staff_name
            FROM entertainment e
            LEFT JOIN cinemas c ON e.id_cinema = c.id_cinema
            LEFT JOIN staff s ON e.id_staff = s.id_staff
            WHERE e.status = 'active'
            ORDER BY e.featured DESC, e.start_date DESC
        `);

        // Đảm bảo entertainments luôn là mảng
        let entertainmentsArray;
        if (Array.isArray(entertainments)) {
            entertainmentsArray = entertainments;
        } else if (Array.isArray(entertainments[0])) {
            entertainmentsArray = entertainments[0];
        } else {
            entertainmentsArray = entertainments && typeof entertainments === 'object' ?
                (Object.keys(entertainments).length > 0 ? [entertainments] : []) :
                (entertainments ? [entertainments] : []);
        }

        console.log(`[ENTERTAINMENT API] Found ${entertainmentsArray.length} entertainments`);

        return NextResponse.json({
            success: true,
            data: entertainmentsArray
        });

    } catch (error) {
        console.error('[ENTERTAINMENT API] Error fetching entertainments:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch entertainments',
                error: errorMessage
            },
            { status: 500 }
        );
    }
}
