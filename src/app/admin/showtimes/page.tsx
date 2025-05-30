"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiUrl, apiConfig } from '@/lib/apiUtils';

interface Showtime {
    id_showtime: number;
    id_movie: number | null;
    id_screen: number | null;
    start_time: string;
    end_time: string;
    show_date: string;
    price: number;
    format: string;
    language: string;
    subtitle: string;
    status: string;
    // Joined fields
    movie_title?: string;
    screen_name?: string;
    cinema_name?: string;
}

export default function AdminShowtimesPage() {
    const [showtimes, setShowtimes] = useState<Showtime[]>([]);
    const [filteredShowtimes, setFilteredShowtimes] = useState<Showtime[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        screen: 'all',
        cinema: 'all'
    });
    const router = useRouter();

    // Fetch showtimes from the database
    const fetchShowtimes = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Calling API at: /api/admin/showtimes');
            const response = await axios.get('/api/admin/showtimes', {
                ...apiConfig,
                timeout: 10000
            });
            console.log('Response data:', response.data);

            if (response.data.success) {
                const showtimesData = response.data.data || [];
                setShowtimes(showtimesData);
                setFilteredShowtimes(showtimesData);
            } else {
                setError(response.data.message || 'Không thể tải danh sách lịch chiếu');
            }
        } catch (err: any) {
            console.error('Lỗi khi tải danh sách lịch chiếu:', err);

            if (err.code === 'ECONNABORTED') {
                setError('Quá thời gian kết nối. Máy chủ không phản hồi.');
            } else if (!err.response) {
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra server đã được khởi động chưa.');
            } else {
                setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải danh sách lịch chiếu');
            }
        } finally {
            setLoading(false);
        }
    };

    // Load showtimes when the component mounts
    // Filter logic
    const applyFilters = () => {
        let filtered = [...showtimes];

        // Filter by status
        if (filters.status !== 'all') {
            filtered = filtered.filter(showtime => showtime.status === filters.status);
        }

        // Filter by search (movie title, screen name, cinema name)
        if (filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase().trim();
            filtered = filtered.filter(showtime =>
                (showtime.movie_title?.toLowerCase().includes(searchTerm)) ||
                (showtime.screen_name?.toLowerCase().includes(searchTerm)) ||
                (showtime.cinema_name?.toLowerCase().includes(searchTerm))
            );
        }

        // Filter by screen name
        if (filters.screen !== 'all') {
            filtered = filtered.filter(showtime => showtime.screen_name === filters.screen);
        }

        // Filter by cinema name
        if (filters.cinema !== 'all') {
            filtered = filtered.filter(showtime => showtime.cinema_name === filters.cinema);
        }

        setFilteredShowtimes(filtered);
    };

    // Handle filter changes
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Handle delete showtime
    const handleDeleteShowtime = async (id: number) => {
        if (confirm('Bạn có chắc chắn muốn xóa lịch chiếu này?')) {
            try {
                const response = await axios.delete(`/api/admin/showtimes/${id}`);
                if (response.data.success) {
                    alert('Xóa lịch chiếu thành công!');
                    fetchShowtimes(); // Reload data
                } else {
                    alert('Có lỗi xảy ra khi xóa lịch chiếu');
                }
            } catch (error) {
                console.error('Error deleting showtime:', error);
                alert('Có lỗi xảy ra khi xóa lịch chiếu');
            }
        }
    };

    // Get unique screen names for filter dropdown
    const getUniqueScreens = () => {
        const screens = showtimes
            .map(showtime => showtime.screen_name)
            .filter((screen, index, arr) => screen && arr.indexOf(screen) === index)
            .sort();
        return screens;
    };
    // Get unique screen names for filter dropdown
    const getUniqueCinemas = () => {
        const cinemas = showtimes
            .map(showtime => showtime.cinema_name)
            .filter((cinema, index, arr) => cinema && arr.indexOf(cinema) === index)
            .sort();
        return cinemas;
    };


    useEffect(() => {
        fetchShowtimes();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, showtimes]);

    return (
        <div className="container mx-auto px-4 py-8">            <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-dark">Quản lý lịch chiếu</h1>
            <Link href="/admin/showtimes/add">
                <button className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded">
                    Thêm lịch chiếu mới
                </button>
            </Link>
        </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    <p>{error}</p>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-dark"
                        >
                            <option value="all">Tất cả</option>
                            <option value="available">Có sẵn</option>
                            <option value="sold out">Hết vé</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phòng chiếu</label>
                        <select
                            value={filters.screen}
                            onChange={(e) => handleFilterChange('screen', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-dark"
                        >
                            <option value="all">Tất cả phòng</option>
                            {getUniqueScreens().map(screen => (
                                <option key={screen} value={screen}>{screen}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rạp chiếu</label>
                        <select
                            value={filters.cinema}
                            onChange={(e) => handleFilterChange('cinema', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-dark"
                        >
                            <option value="all">Tất cả rạp</option>
                            {getUniqueCinemas().map(cinema => (
                                <option key={cinema} value={cinema}>{cinema}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Tìm theo phim, phòng, rạp..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-dark"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={fetchShowtimes}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                        >
                            Làm mới
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <p className="text-xl">Đang tải danh sách lịch chiếu...</p>
                </div>
            ) : showtimes.length > 0 ? (
                <div className="overflow-x-auto">
                    <div className="bg-white px-6 py-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            Hiển thị {filteredShowtimes.length} / {showtimes.length} lịch chiếu
                        </p>
                    </div>
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">ID</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Phim</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Phòng chiếu</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Ngày chiếu</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Giờ bắt đầu</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Giờ kết thúc</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Trạng thái</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredShowtimes.map((showtime) => (<tr key={showtime.id_showtime}>
                                <td className="py-3 px-4 border-b text-dark">{showtime.id_showtime}</td>
                                <td className="py-3 px-4 border-b text-dark">{showtime.movie_title || 'N/A'}</td>
                                <td className="py-3 px-4 border-b text-dark">
                                    {showtime.screen_name ?
                                        `${showtime.screen_name} (${showtime.cinema_name})` :
                                        'N/A'}
                                </td>
                                <td className="py-3 px-4 border-b text-dark">
                                    {new Date(showtime.show_date).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="py-3 px-4 border-b text-dark">{showtime.start_time}</td>
                                <td className="py-3 px-4 border-b text-dark">{showtime.end_time}</td>
                                <td className="py-3 px-4 border-b text-dark">
                                    <span
                                        className={`px-2 py-1 rounded ${showtime.status === 'available'
                                            ? 'bg-green-100 text-green-800'
                                            : showtime.status === 'cancelled'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                    >
                                        {showtime.status === 'available' ? 'Còn vé' :
                                            showtime.status === 'cancelled' ? 'Đã hủy' : 'Hết vé'}
                                    </span>
                                </td>
                                <td className="py-3 px-4 border-b">
                                    <div className="flex gap-2">
                                        <Link href={`/admin/showtimes/edit/${showtime.id_showtime}`}>
                                            <button className="bg-yellow-500 hover:bg-yellow-700 text-white px-2 py-1 rounded text-sm">
                                                Sửa
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteShowtime(showtime.id_showtime)}
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
                    <p className="text-xl text-dark">Chưa có lịch chiếu nào trong cơ sở dữ liệu</p>
                    <p className="mt-2 text-gray-500">
                        Sử dụng nút &quot;Thêm lịch chiếu mới&quot; để bắt đầu thêm lịch chiếu
                    </p>
                </div>
            )}
        </div>
    );
}