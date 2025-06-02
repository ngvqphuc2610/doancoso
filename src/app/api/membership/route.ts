import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        console.log('[MEMBERSHIP API] Fetching memberships from database');

        const memberships = await query(`
            SELECT 
                m.*
            FROM membership m
            WHERE m.status = 'active'
            ORDER BY m.id_membership ASC
        `);

        // Đảm bảo memberships luôn là mảng
        let membershipsArray;
        if (Array.isArray(memberships)) {
            membershipsArray = memberships;
        } else if (Array.isArray(memberships[0])) {
            membershipsArray = memberships[0];
        } else {
            membershipsArray = memberships && typeof memberships === 'object' ?
                (Object.keys(memberships).length > 0 ? [memberships] : []) :
                (memberships ? [memberships] : []);
        }

        console.log(`[MEMBERSHIP API] Found ${membershipsArray.length} memberships`);

        return NextResponse.json({
            success: true,
            data: membershipsArray
        });

    } catch (error) {
        console.error('[MEMBERSHIP API] Error fetching memberships:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch memberships',
                error: errorMessage
            },
            { status: 500 }
        );
    }
}
