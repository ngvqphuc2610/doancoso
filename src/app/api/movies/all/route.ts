import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        console.log('[MOVIES ALL API] Fetching all movies from database');

        const movies = await query(`
            SELECT m.*, 
                GROUP_CONCAT(DISTINCT g.genre_name ORDER BY g.genre_name SEPARATOR ', ') as genres
            FROM movies m
            LEFT JOIN genre_movies gm ON m.id_movie = gm.id_movie
            LEFT JOIN genre g ON gm.id_genre = g.id_genre
            GROUP BY m.id_movie
            ORDER BY m.id_movie ASC
        `);

        // Đảm bảo movies luôn là mảng
        let moviesArray;
        if (Array.isArray(movies)) {
            moviesArray = movies;
        } else if (Array.isArray(movies[0])) {
            moviesArray = movies[0];
        } else {
            moviesArray = movies && typeof movies === 'object' ?
                (Object.keys(movies).length > 0 ? [movies] : []) :
                (movies ? [movies] : []);
        }

        console.log(`[MOVIES ALL API] Found ${moviesArray.length} movies`);

        return NextResponse.json({
            success: true,
            data: moviesArray
        });

    } catch (error) {
        console.error('[MOVIES ALL API] Error fetching movies:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch movies',
                error: errorMessage
            },
            { status: 500 }
        );
    }
}
