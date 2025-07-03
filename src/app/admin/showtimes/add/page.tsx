"use client";

import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Movie {
    id_movie: number;
    title: string;
}

interface Screen {
    id_screen: number;
    screen_name: string;
    cinema_name: string;
    id_cinema: number;
}

export default function AddShowtimePage() {
    const router = useRouter();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [screens, setScreens] = useState<Screen[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id_movie: '',
        id_screen: '',
        start_time: '',
        end_time: '',
        show_date: '',
        price: '',
        format: '2D',
        language: 'Tiếng Việt',
        subtitle: 'Tiếng Anh',
        status: 'available'
    });
    const [error, setError] = useState<string | null>(null);

    // Fetch movies and screens for dropdowns
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [moviesRes, screensRes] = await Promise.all([
                    axios.get('/api/movies/all'),
                    axios.get('/api/screens/all')
                ]);

                if (moviesRes.data.success) {
                    setMovies(moviesRes.data.data || []);
                }

                if (screensRes.data.success) {
                    setScreens(screensRes.data.data || []);
                }
            } catch (err) {
                console.error('Error fetching data for dropdowns:', err);
                setError('Không thể tải dữ liệu cho các tùy chọn. Vui lòng thử lại sau.');
            }
        };

        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/admin/showtimes', {
                id_movie: parseInt(formData.id_movie),
                id_screen: parseInt(formData.id_screen),
                start_time: formData.start_time,
                end_time: formData.end_time,
                show_date: formData.show_date,
                price: parseFloat(formData.price),
                format: formData.format,
                language: formData.language,
                subtitle: formData.subtitle,
                status: formData.status
            });

            if (response.data.success) {
                alert('Thêm lịch chiếu thành công!');
                router.push('/admin/showtimes');
            } else {
                setError(response.data.message || 'Có lỗi xảy ra khi thêm lịch chiếu');
            }
        } catch (err: any) {
            console.error('Error adding showtime:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi thêm lịch chiếu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-white text-dark">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Thêm Lịch Chiếu Mới</h1>
                <Link href="/admin/showtimes">
                    <button className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded">
                        Quay lại
                    </button>
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="id_movie">
                            Phim <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="id_movie"
                            name="id_movie"
                            value={formData.id_movie}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Chọn phim</option>
                            {movies.map(movie => (
                                <option key={movie.id_movie} value={movie.id_movie}>
                                    {movie.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="id_screen">
                            Phòng chiếu <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="id_screen"
                            name="id_screen"
                            value={formData.id_screen}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Chọn phòng chiếu</option>
                            {screens.map(screen => (
                                <option key={screen.id_screen} value={screen.id_screen}>
                                    {screen.screen_name} - {screen.cinema_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="show_date">
                            Ngày chiếu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="show_date"
                            name="show_date"
                            value={formData.show_date}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="price">
                            Giá vé (VND) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="1000"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="start_time">
                            Giờ bắt đầu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            id="start_time"
                            name="start_time"
                            value={formData.start_time}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="end_time">
                            Giờ kết thúc <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            id="end_time"
                            name="end_time"
                            value={formData.end_time}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="format">
                            Định dạng
                        </label>
                        <select
                            id="format"
                            name="format"
                            value={formData.format}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        >
                            <option value="2D">2D</option>
                            <option value="3D">3D</option>
                            <option value="4DX">4DX</option>
                            <option value="IMAX">IMAX</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="language">
                            Ngôn ngữ
                        </label>
                        <input
                            type="text"
                            id="language"
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="subtitle">
                            Phụ đề
                        </label>
                        <input
                            type="text"
                            id="subtitle"
                            name="subtitle"
                            value={formData.subtitle}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Cập nhật status options */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="status">
                            Trạng thái
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        >
                            <option value="available">Còn vé</option>
                            <option value="sold_out">Hết vé</option>
                            <option value="cancelled">Đã hủy</option>
                            <option value="upcoming">Sắp chiếu</option>
                            <option value="active">Đang chiếu</option>
                            {/* Không có option 'deleted' vì đây là trạng thái hệ thống */}
                        </select>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Đang xử lý...' : 'Thêm lịch chiếu'}
                    </button>
                </div>
            </form>
        </div>
    );
}
