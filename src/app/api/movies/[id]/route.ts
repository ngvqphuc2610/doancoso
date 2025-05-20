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

        const movies = await query(`
      SELECT m.*, 
        GROUP_CONCAT(DISTINCT g.genre_name ORDER BY g.genre_name SEPARATOR ', ') as genres
      FROM movies m
      LEFT JOIN genre_movies gm ON m.id_movie = gm.id_movie
      LEFT JOIN genre g ON gm.id_genre = g.id_genre
      WHERE m.id_movie = ?
      GROUP BY m.id_movie
    `, [id]);

        if (!movies || movies.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Movie not found'
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: movies[0]
        });
    } catch (error) {
        console.error(`Error fetching movie details for ID ${params.id}:`, error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch movie details'
            },
            { status: 500 }
        );
    }
}
