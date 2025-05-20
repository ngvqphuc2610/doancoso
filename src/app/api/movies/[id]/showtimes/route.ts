import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Movie ID is required'
                },
                { status: 400 }
            );
        }

        // Get showtimes for the movie
        const showtimes = await query(`
      SELECT s.*, c.name as cinema_name, sc.screen_name
      FROM showtimes s
      JOIN cinemas c ON s.id_cinema = c.id_cinema
      JOIN screens sc ON s.id_screen = sc.id_screen
      WHERE s.id_movie = ? AND s.status = 'active' AND s.showtime >= NOW()
      ORDER BY s.showtime ASC
    `, [id]);

        return NextResponse.json({
            success: true,
            data: showtimes || []
        });
    } catch (error) {
        console.error(`Error fetching movie showtimes for ID ${params.id}:`, error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch movie showtimes'
            },
            { status: 500 }
        );
    }
}
