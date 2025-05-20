'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Movie } from '@/lib/movieDb';

interface Genre {
    id: number;
    name: string;
}

interface MovieFormProps {
    movie?: Movie;
    genres: Genre[];
}

export default function MovieForm({ movie, genres }: MovieFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: movie?.title || '',
        director: movie?.director || '',
        cast: movie?.actors || '',
        description: movie?.description || '',
        duration: movie?.duration || '',
        release_date: movie?.release_date ? new Date(movie.release_date).toISOString().split('T')[0] : '',
        end_date: movie?.end_date ? new Date(movie.end_date).toISOString().split('T')[0] : '',
        poster_url: movie?.poster_image || '',
        trailer_url: movie?.trailer_url || '',
        age_restriction: movie?.age_restriction || 'P',
        status: movie?.status || 'coming soon',
        selectedGenres: movie?.genres || []
    });

    const [previewImage, setPreviewImage] = useState(formData.poster_url);

    // Xử lý khi nhập liệu
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Xử lý khi chọn thể loại phim
    const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const selectedGenres = [];

        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedGenres.push(options[i].value);
            }
        }

        setFormData({
            ...formData,
            selectedGenres
        });
    };

    // Xử lý khi xem trước poster
    useEffect(() => {
        if (formData.poster_url) {
            setPreviewImage(formData.poster_url);
        }
    }, [formData.poster_url]);

    // Xử lý khi submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const movieData = {
                title: formData.title,
                director: formData.director,
                actors: formData.cast, // Sử dụng tên trường actors thay vì cast để phù hợp với cơ sở dữ liệu
                description: formData.description,
                duration: parseInt(formData.duration as string) || 0,
                release_date: formData.release_date,
                end_date: formData.end_date,
                poster_image: formData.poster_url, // Sử dụng tên trường poster_image thay vì poster_url để phù hợp với cơ sở dữ liệu
                trailer_url: formData.trailer_url,
                age_restriction: formData.age_restriction,
                status: formData.status,
                genres: formData.selectedGenres
            };

            let response;

            if (movie) {
                // Cập nhật phim
                response = await axios.put(`/api/admin/movies/${movie.id_movie}`, movieData);
            } else {
                // Thêm phim mới
                response = await axios.post('/api/admin/movies', movieData);
            }

            if (response.data.success) {
                setSuccess(movie ? 'Cập nhật phim thành công!' : 'Thêm phim mới thành công!');

                // Chuyển về trang quản lý phim sau 2 giây
                setTimeout(() => {
                    router.push('/admin/movies');
                }, 2000);
            } else {
                setError(response.data.message || 'Đã xảy ra lỗi khi lưu phim');
            }
        } catch (err: any) {
            console.error('Lỗi khi lưu phim:', err);

            // Hiển thị thông tin lỗi chi tiết hơn để debug
            if (err.response?.data?.message) {
                setError(`Lỗi từ server: ${err.response.data.message}`);
            } else if (err.message) {
                setError(`Lỗi: ${err.message}`);
            } else {
                setError('Đã xảy ra lỗi không xác định khi lưu phim');
            }

            // Log chi tiết lỗi để debug
            if (err.response) {
                console.error('Response error:', {
                    data: err.response.data,
                    status: err.response.status,
                    headers: err.response.headers
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
                    <p>{success}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cột trái */}
                <div className="space-y-4">
                    {/* Tiêu đề phim */}
                    <div>
                        <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
                            Tiêu đề phim <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Đạo diễn */}
                    <div>
                        <label htmlFor="director" className="block text-gray-700 font-bold mb-2">
                            Đạo diễn
                        </label>
                        <input
                            type="text"
                            id="director"
                            name="director"
                            value={formData.director}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Diễn viên */}
                    <div>
                        <label htmlFor="cast" className="block text-gray-700 font-bold mb-2">
                            Diễn viên
                        </label>
                        <input
                            type="text"
                            id="cast"
                            name="cast"
                            value={formData.cast}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Thời lượng */}
                    <div>
                        <label htmlFor="duration" className="block text-gray-700 font-bold mb-2">
                            Thời lượng (phút)
                        </label>
                        <input
                            type="number"
                            id="duration"
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Ngày khởi chiếu */}
                    <div>
                        <label htmlFor="release_date" className="block text-gray-700 font-bold mb-2">
                            Ngày khởi chiếu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="release_date"
                            name="release_date"
                            value={formData.release_date}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Ngày kết thúc chiếu */}
                    <div>
                        <label htmlFor="end_date" className="block text-gray-700 font-bold mb-2">
                            Ngày kết thúc chiếu
                        </label>
                        <input
                            type="date"
                            id="end_date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Giới hạn độ tuổi */}
                    <div>
                        <label htmlFor="age_restriction" className="block text-gray-700 font-bold mb-2">
                            Giới hạn độ tuổi
                        </label>
                        <select
                            id="age_restriction"
                            name="age_restriction"
                            value={formData.age_restriction}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        >
                            <option value="P">P - Phổ biến</option>
                            <option value="K">K - Khuyến cáo</option>
                            <option value="T13">T13 - 13+</option>
                            <option value="T16">T16 - 16+</option>
                            <option value="T18">T18 - 18+</option>
                            <option value="C">C - Cấm</option>
                        </select>
                    </div>

                    {/* Trạng thái */}
                    <div>
                        <label htmlFor="status" className="block text-gray-700 font-bold mb-2">
                            Trạng thái <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        >
                            <option value="coming soon">Sắp chiếu</option>
                            <option value="now showing">Đang chiếu</option>
                            <option value="ended">Đã kết thúc</option>
                        </select>
                    </div>
                </div>

                {/* Cột phải */}
                <div className="space-y-4">
                    {/* Mô tả */}
                    <div>
                        <label htmlFor="description" className="block text-gray-700 font-bold mb-2">
                            Mô tả
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={6}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        ></textarea>
                    </div>

                    {/* URL Poster */}
                    <div>
                        <label htmlFor="poster_url" className="block text-gray-700 font-bold mb-2">
                            URL Poster
                        </label>
                        <input
                            type="text"
                            id="poster_url"
                            name="poster_url"
                            value={formData.poster_url}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Xem trước poster */}
                    {previewImage && (
                        <div className="mt-4">
                            <p className="text-gray-700 font-bold mb-2">Xem trước poster:</p>
                            <div className="border border-gray-300 w-40 h-60 overflow-hidden rounded">
                                <img
                                    src={previewImage}
                                    alt="Movie Poster Preview"
                                    className="w-full h-full object-cover"
                                    onError={() => setPreviewImage('/images/movie-placeholder.jpg')}
                                />
                            </div>
                        </div>
                    )}

                    {/* URL Trailer */}
                    <div>
                        <label htmlFor="trailer_url" className="block text-gray-700 font-bold mb-2">
                            URL Trailer (YouTube)
                        </label>
                        <input
                            type="text"
                            id="trailer_url"
                            name="trailer_url"
                            value={formData.trailer_url}
                            onChange={handleInputChange}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Thể loại phim */}
                    <div>
                        <label htmlFor="selectedGenres" className="block text-gray-700 font-bold mb-2">
                            Thể loại phim (giữ Ctrl để chọn nhiều)
                        </label>
                        <select
                            id="selectedGenres"
                            name="selectedGenres"
                            multiple
                            value={formData.selectedGenres}
                            onChange={handleGenreChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 h-40 focus:outline-none focus:border-blue-500"
                        >
                            {genres.map((genre) => (
                                <option key={genre.id} value={genre.name}>
                                    {genre.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Nút */}
            <div className="mt-8 flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.push('/admin/movies')}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                    Hủy
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {loading ? 'Đang lưu...' : movie ? 'Cập nhật phim' : 'Thêm phim mới'}
                </button>
            </div>
        </form>
    );
}
