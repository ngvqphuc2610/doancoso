import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const genres = await query(`SELECT * FROM genre ORDER BY genre_name`);

        return NextResponse.json({
            success: true,
            data: genres
        });
    } catch (error) {
        console.error('Error fetching movie genres:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch movie genres'
            },
            { status: 500 }
        );
    }
}
