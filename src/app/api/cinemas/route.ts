import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const cinemas = await query(`
      SELECT * FROM CINEMAS WHERE status = 'active' ORDER BY cinema_name
    `);

        return NextResponse.json({
            success: true,
            data: cinemas
        });
    } catch (error) {
        console.error('Error fetching cinemas:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : '';

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch cinemas',
                error: errorMessage,
                stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
            },
            { status: 500 }
        );
    }
}
