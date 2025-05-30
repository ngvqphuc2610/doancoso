'use client';

import { useState, useEffect } from 'react';
import { HomepageBanner } from '@/app/api/admin/banners/route';

interface Movie {
    id_movie: number;
    title: string;
    poster_image: string | null;
    banner_image: string | null;
    status: string;
}

interface BannerFormProps {
    banner?: HomepageBanner;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function BannerForm({ banner, onSubmit, onCancel, loading }: BannerFormProps) {
    const [formData, setFormData] = useState({
        id_movie: banner?.id_movie || '',
        title: banner?.title || '',
        description: banner?.description || '',
        display_order: banner?.display_order || 1,
        is_active: banner?.is_active ?? true
    });

    const [movies, setMovies] = useState<Movie[]>([]);
    const [loadingMovies, setLoadingMovies] = useState(true);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [previewImage, setPreviewImage] = useState<string>('');

    // Load movies
    useEffect(() => {
        fetchMovies();
    }, []);

    // Update preview when movie changes
    useEffect(() => {
        if (selectedMovie) {
            const imageUrl = selectedMovie.banner_image || selectedMovie.poster_image;
            setPreviewImage(imageUrl || '/images/movie-placeholder.jpg');
        }
    }, [selectedMovie]);

    // Set selected movie when form data changes
    useEffect(() => {
        if (formData.id_movie && movies.length > 0) {
            const movie = movies.find(m => m.id_movie.toString() === formData.id_movie.toString());
            setSelectedMovie(movie || null);
        }
    }, [formData.id_movie, movies]);

    const fetchMovies = async () => {
        try {
            const response = await fetch('/api/movies');
            const data = await response.json();

            if (data.success) {
                // Chỉ lấy movies có banner_image
                const moviesWithBanner = (data.data || []).filter((movie: any) =>
                    movie.banner_image && movie.banner_image.trim() !== ''
                );
                setMovies(moviesWithBanner);
            }
        } catch (error) {
            console.error('Error fetching movies:', error);
        } finally {
            setLoadingMovies(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">
                {banner ? 'Chỉnh sửa Banner' : 'Thêm Banner Mới'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Chọn phim */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2">
                        Chọn Phim *
                    </label>
                    {loadingMovies ? (
                        <div className="text-gray-500">Đang tải danh sách phim...</div>
                    ) : movies.length === 0 ? (
                        <div className="text-yellow-600 bg-yellow-50 border border-yellow-200 rounded p-3">
                            <p className="font-medium">⚠️ Không có phim nào có banner image</p>
                            <p className="text-sm mt-1">
                                Vui lòng vào <strong>Quản lý phim</strong> để thêm banner image cho các phim trước khi tạo banner.
                            </p>
                        </div>
                    ) : (
                        <select
                            name="id_movie"
                            value={formData.id_movie}
                            onChange={handleInputChange}
                            required
                            className="text-dark w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">-- Chọn phim --</option>
                            {movies.map(movie => (
                                <option key={movie.id_movie} value={movie.id_movie}>
                                    {movie.title} ({movie.status})
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Preview ảnh */}
                {selectedMovie && previewImage && (
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">
                            Xem trước Banner
                        </label>
                        <div className="border border-gray-300 rounded overflow-hidden">
                            {selectedMovie.banner_image ? (
                                // Hiển thị banner image (ngang)
                                <div className="w-full h-48 bg-gray-100">
                                    <img
                                        src={previewImage}
                                        alt={selectedMovie.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/images/movie-placeholder.jpg';
                                        }}
                                    />
                                </div>
                            ) : (
                                // Hiển thị poster với blur effect
                                <div className="w-full h-48 relative bg-gray-100">
                                    <div
                                        className="absolute inset-0 w-full h-full"
                                        style={{
                                            backgroundImage: `url(${previewImage})`,
                                            backgroundSize: '120%',
                                            backgroundPosition: 'center 20%',
                                            filter: 'blur(8px)',
                                            transform: 'scale(1.1)'
                                        }}
                                    />
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                                        <img
                                            src={previewImage}
                                            alt={selectedMovie.title}
                                            className="w-20 h-30 object-cover rounded shadow-lg"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/images/movie-placeholder.jpg';
                                            }}
                                        />
                                    </div>
                                    <div className="absolute left-28 top-1/2 transform -translate-y-1/2 z-10">
                                        <h3 className="text-white text-lg font-bold drop-shadow-lg">
                                            {selectedMovie.title}
                                        </h3>
                                        <p className="text-white/80 text-sm">
                                            Sử dụng poster với blur effect
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {selectedMovie.banner_image
                                ? '✅ Phim có banner image chuyên dụng'
                                : '⚠️ Phim chỉ có poster, sẽ sử dụng blur effect'
                            }
                        </p>
                    </div>
                )}

                {/* Tiêu đề banner */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2">
                        Tiêu đề Banner *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="Nhập tiêu đề hiển thị trên banner"
                        className="text-dark w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Mô tả */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2">
                        Mô tả
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Mô tả ngắn về banner (tùy chọn)"
                        className="text-dark w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Thứ tự hiển thị */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2">
                        Thứ tự hiển thị
                    </label>
                    <input
                        type="number"
                        name="display_order"
                        value={formData.display_order}
                        onChange={handleInputChange}
                        min="1"
                        className="text-dark w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                        Số thứ tự càng nhỏ sẽ hiển thị trước
                    </p>
                </div>

                {/* Trạng thái active */}
                <div>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleInputChange}
                            className="mr-2"
                        />
                        <span className="text-gray-700 font-bold">Kích hoạt banner</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                        Chỉ những banner được kích hoạt mới hiển thị trên trang chủ
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : (banner ? 'Cập nhật' : 'Tạo Banner')}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}
