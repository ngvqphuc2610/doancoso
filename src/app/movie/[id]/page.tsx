import { MovieDbAPI } from '@/services/MovieDbAPI';
import { getMovieCredits } from '@/lib/film';
import MovieDetail from '@/components/movies/MovieDetail';
import { notFound } from 'next/navigation';

export default async function MovieDetailsPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const parsedId = parseInt(id); 
    const details = await MovieDbAPI.getMovieDetails(parsedId);
    const credits = await getMovieCredits(parsedId);

    if (!details) {
        notFound();
    }

    const movie = await MovieDbAPI.formatMovieData(details);

    return <MovieDetail movie={movie} credits={credits} />;
}
