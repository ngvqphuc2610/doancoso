import { getMovieById } from '@/lib/film';
import MovieDetail from '@/components/movies/MovieDetail';
import { notFound } from 'next/navigation';

export default async function MovieDetailsPage({ params }: { params: { id: string } }) {
    const { id } = params;

    if (!id) {
        console.error('Movie ID is missing from params');
        notFound();
    }

    console.log(`Fetching movie details for ID: ${id}`);

    try {
        // Fetch movie details which now includes director and actors
        const movie = await getMovieById(id);

        if (!movie) {
            console.error(`Movie with ID: ${id} not found`);
            notFound();
        }

        // Get credits data from the movie object
        const credits = {
            director: movie.director || null,
            actors: movie.actors ? movie.actors.split(',').map((actor: string) => actor.trim()) : []
        };

        console.debug(`Successfully loaded movie: ${movie.title}`, {
            id: movie.id,
            hasCredits: !!movie.director || (movie.actors && movie.actors.length > 0)
        });

        return <MovieDetail movie={movie} credits={credits} />;
    } catch (error) {
        console.error(`Error loading movie details for ID ${id}:`, error);
        notFound();
    }
}
