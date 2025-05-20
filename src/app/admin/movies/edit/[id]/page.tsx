import { redirect } from 'next/navigation';
import MovieForm from '@/components/admin/MovieForm';
import { getMovieById, getGenres } from '@/lib/movieDb';

interface Props {
    params: {
        id: string;
    };
}

export const metadata = {
    title: 'Chỉnh sửa phim',
};

export default async function EditMoviePage({ params }: Props) {
    const id = parseInt(await params.id);

    // Fetch thông tin phim cần chỉnh sửa
    const movie = await getMovieById(id);

    // Nếu không tìm thấy phim, chuyển hướng về trang quản lý phim
    if (!movie) {
        redirect('/admin/movies');
    }

    // Fetch danh sách thể loại phim
    const genres = await getGenres();

    return (
        <div className="container mx-auto px-4 py-8 text-dark">
            <h1 className="text-3xl font-bold mb-6">Chỉnh sửa phim: {movie.title}</h1>

            <MovieForm movie={movie} genres={genres} />
        </div>
    );
}
