import { redirect } from 'next/navigation';
import MovieForm from '@/components/admin/MovieForm';
import { getGenres } from '@/lib/movieDb';

export const metadata = {
    title: 'Thêm phim mới',
};

export default async function AddMoviePage() {
    // Fetch danh sách thể loại phim để hiển thị trong form
    const genres = await getGenres();

    return (
        <div className="container mx-auto px-4 py-8 text-dark">
            <h1 className="text-3xl font-bold mb-6">Thêm phim mới</h1>

            <MovieForm genres={genres} />
        </div>
    );
}
