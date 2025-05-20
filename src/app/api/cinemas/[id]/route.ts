import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Cinema ID is required'
                },
                { status: 400 }
            );
        }

        const cinemas = await query(`
      SELECT * FROM cinemas WHERE id_cinema = ?
    `, [id]);

        if (!cinemas || cinemas.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Cinema not found'
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: cinemas[0]
        });
    } catch (error) {
        console.error(`Error fetching cinema details for ID ${params.id}:`, error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch cinema details'
            },
            { status: 500 }
        );
    }
}
