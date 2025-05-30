import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        console.log('[SCREENS ALL API] Fetching all screens from database');

        const screens = await query(`
            SELECT 
                s.id_screen,
                s.screen_name,
                s.capacity,
                s.status,
                s.id_screentype,
                c.id_cinema,
                c.cinema_name,
                c.address,
                c.city,
                st.type_name as screen_type
            FROM screen s
            LEFT JOIN cinemas c ON s.id_cinema = c.id_cinema
            LEFT JOIN screen_type st ON s.id_screentype = st.id_screentype
            WHERE s.status = 'active' AND c.status = 'active'
            ORDER BY c.cinema_name, s.screen_name ASC
        `);

        // Đảm bảo screens luôn là mảng
        let screensArray;
        if (Array.isArray(screens)) {
            screensArray = screens;
        } else if (Array.isArray(screens[0])) {
            screensArray = screens[0];
        } else {
            screensArray = screens && typeof screens === 'object' ?
                (Object.keys(screens).length > 0 ? [screens] : []) :
                (screens ? [screens] : []);
        }

        console.log(`[SCREENS ALL API] Found ${screensArray.length} screens`);

        return NextResponse.json({
            success: true,
            data: screensArray
        });

    } catch (error) {
        console.error('[SCREENS ALL API] Error fetching screens:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch screens',
                error: errorMessage
            },
            { status: 500 }
        );
    }
}
