import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createSuccessResponse, handleApiError } from '@/lib/apiUtils';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

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

        return createSuccessResponse(cinemas[0]);
    } catch (error) {
        const resolvedParams = await params;
        console.error(`Error fetching cinema details for ID ${resolvedParams.id}:`, error);
        return handleApiError(error, 'Failed to fetch cinema details');
    }
}
