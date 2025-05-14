"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Movie {
    id_movie: number;
    title: string;
    release_date: string;
    status: string;
    poster_image: string;
}

export default function AdminMoviesPage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncingMovies, setSyncingMovies] = useState(false);
    const [syncStatus, setSyncStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Fetch movies from the database
    const fetchMovies = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/admin/movies', {
                timeout: 15000, // set timeout
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (response.data.success) {
                setMovies(response.data.data || []);
            } else {
                setError(response.data.message || 'Không thể tải danh sách phim');
            }
        } catch (err: any) {
            console.error('Lỗi khi tải danh sách phim:', err);

            // Provide more detailed error messages based on the error type
            if (err.code === 'ECONNABORTED') {
                setError('Quá thời gian kết nối. Máy chủ không phản hồi.');
            } else if (!err.response) {
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra server đã được khởi động chưa.');
            } else {
                setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải danh sách phim');
            }
        } finally {
            setLoading(false);
        }
    };

    // lấy movie từ api themoviedb
    const handleSyncMovies = async () => {
        setSyncingMovies(true);
        setSyncStatus('Đang đồng bộ phim từ TMDB...');

        try {
            const response = await axios.post('/api/admin/movies/sync', {}, {
                timeout: 15000, // set timeout
            });

            if (response.data.success) {
                setSyncStatus('Đồng bộ hoàn tất!');
                await fetchMovies(); // Refresh movie list
            } else {
                setSyncStatus(`Lỗi: ${response.data.message || 'Không thể đồng bộ phim'}`);
            }
        } catch (err: any) {
            console.error('Lỗi khi đồng bộ phim:', err);

            if (err.code === 'ECONNABORTED') {
                setSyncStatus('Quá thời gian kết nối. Máy chủ có thể vẫn đang đồng bộ phim.');
            } else if (!err.response) {
                setSyncStatus('Không thể kết nối đến máy chủ. Vui lòng kiểm tra server đã được khởi động chưa.');
            } else {
                setSyncStatus(`Lỗi: ${err.response?.data?.message || 'Đã xảy ra lỗi khi đồng bộ phim'}`);
            }
        } finally {
            // Keep the sync status visible longer to let user read it
            setTimeout(() => {
                setSyncStatus(null);
                setSyncingMovies(false);
            }, 5000);
        }
    };

    // Delete a movie
    const handleDeleteMovie = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phim này?')) {
            try {
                const response = await axios.delete(`/api/admin/movies/${id}`);
                if (response.data.success) {
                    setMovies(movies.filter(movie => movie.id_movie !== id));
                    alert('Xóa phim thành công!');
                } else {
                    alert(`Lỗi: ${response.data.message}`);
                }
            } catch (err) {
                console.error('Lỗi khi xóa phim:', err);
                alert('Đã xảy ra lỗi khi xóa phim');
            }
        }
    };

    // Load movies when the component mounts
    useEffect(() => {
        fetchMovies();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark">Quản lý phim</h1>
                <div className="flex gap-4">
                    <button
                        onClick={handleSyncMovies}
                        disabled={syncingMovies}
                        className={`px-4 py-2 rounded ${syncingMovies
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-700 text-white'
                            }`}
                    >
                        {syncingMovies ? 'Đang đồng bộ...' : 'Đồng bộ từ TMDB'}
                    </button>
                    <Link href="/admin/movies/add">
                        <button className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded">
                            Thêm phim mới
                        </button>
                    </Link>
                </div>
            </div>

            {syncStatus && (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
                    <p>{syncStatus}</p>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    <p>{error}</p>
                </div>
            )}

            {loading ? (
                <div className="text-center py-10">
                    <p className="text-xl">Đang tải danh sách phim...</p>
                </div>
            ) : movies.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">ID</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Poster</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Tên phim</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Ngày chiếu</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Trạng thái</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movies.map((movie) => (
                                <tr key={movie.id_movie}>
                                    <td className="py-3 px-4 border-b text-dark">{movie.id_movie}</td>
                                    <td className="py-3 px-4 border-b">
                                        <img
                                            src={movie.poster_image}
                                            alt={movie.title}
                                            className="w-16 h-auto"
                                        />
                                    </td>
                                    <td className="py-3 px-4 border-b text-dark">{movie.title}</td>
                                    <td className="py-3 px-4 border-b text-dark">
                                        {new Date(movie.release_date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <span
                                            className={`px-2 py-1 rounded ${movie.status === 'now showing'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                        >
                                            {movie.status === 'now showing' ? 'Đang chiếu' : 'Sắp chiếu'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <div className="flex gap-2">
                                            <Link href={`/admin/movies/edit/${movie.id_movie}`}>
                                                <button className="bg-yellow-500 hover:bg-yellow-700 text-white px-2 py-1 rounded text-sm">
                                                    Sửa
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteMovie(movie.id_movie)}
                                                className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-xl">Chưa có phim nào trong cơ sở dữ liệu</p>
                    <p className="mt-2 text-gray-500">
                        Sử dụng nút &quot;Đồng bộ từ TMDB&quot; để lấy dữ liệu phim từ The Movie Database
                    </p>
                </div>
            )}
        </div>
    );
}