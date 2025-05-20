import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const cinemas = await query(`
      SELECT * FROM cinemas WHERE status = 'active' ORDER BY name
    `);

        return NextResponse.json({
            success: true,
            data: cinemas
        });
    } catch (error) {
        console.error('Error fetching cinemas:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch cinemas'
            },
            { status: 500 }
        );
    }
}
