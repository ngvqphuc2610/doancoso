import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const movies = await query(`
      SELECT m.*, 
        GROUP_CONCAT(DISTINCT g.genre_name ORDER BY g.genre_name SEPARATOR ', ') as genres
      FROM movies m
      LEFT JOIN genre_movies gm ON m.id_movie = gm.id_movie
      LEFT JOIN genre g ON gm.id_genre = g.id_genre
      WHERE m.status = 'coming soon'
      GROUP BY m.id_movie
      ORDER BY m.release_date ASC
    `);

        return NextResponse.json({
            success: true,
            data: movies
        });
    } catch (error) {
        console.error('Error fetching coming soon movies:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch coming soon movies'
            },
            { status: 500 }
        );
    }
}
