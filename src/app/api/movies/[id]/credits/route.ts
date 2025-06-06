import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Movie ID is required'
                },
                { status: 400 }
            );
        }

        // Get cast
        const cast = await query(`
      SELECT pc.*, p.name, p.profile_path, p.gender
      FROM person_cast pc
      JOIN persons p ON pc.id_person = p.id_person
      WHERE pc.id_movie = ?
      ORDER BY pc.cast_order
      LIMIT 20
    `, [id]);

        // Get director
        const crew = await query(`
      SELECT pc.*, p.name, p.profile_path, p.gender
      FROM person_crew pc
      JOIN persons p ON pc.id_person = p.id_person
      WHERE pc.id_movie = ? AND pc.job = 'Director'
    `, [id]);        // Check if we have actual cast/crew data from person tables
        if (cast && cast.length > 0) {
            // Format the data from person tables
            const formattedCast = cast.map((actor: any, index: number) => ({
                id: actor.id_person || index,
                name: actor.name || '',
            }));

            // Find the director from crew table
            const director = crew?.find((c: any) => c.job === 'Director');

            return NextResponse.json({
                success: true,
                data: {
                    cast: formattedCast || [],
                    director: director ? { name: director.name } : null
                }
            });
        } else {
            // Fallback to getting data directly from movies table
            const movie = await query('SELECT director, actors FROM movies WHERE id_movie = ?', [id]);

            if (!movie || movie.length === 0) {
                return NextResponse.json({
                    success: false,
                    message: 'Movie not found'
                }, { status: 404 });
            }

            // Parse director and cast from string fields
            const directorString = movie[0].director || '';
            const castString = movie[0].actors || '';

            // Format actors to match expected format
            const actorsList = castString.split(',')
                .map((name: string, index: number) => ({
                    id: index + 1,
                    name: name.trim()
                }))
                .filter((actor: any) => actor.name);

            return NextResponse.json({
                success: true,
                data: {
                    cast: actorsList,
                    director: directorString ? { name: directorString.split(',')[0]?.trim() } : null,
                    directors: directorString ? directorString.split(',').map((d: string) => d.trim()).filter(Boolean) : []
                }
            });
        }
    } catch (error) {
        const { id } = await params;
        console.error(`Error fetching movie credits for ID ${id}:`, error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch movie credits'
            },
            { status: 500 }
        );
    }
}
