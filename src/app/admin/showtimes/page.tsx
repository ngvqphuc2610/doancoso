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
    format: string;
    language: string;
    subtitle: string;
    status: string;
}

export default function AdminShowtimesPage() {
    const [showtimes, setShowtimes] = useState<Showtime[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
                setShowtimes(response.data.data || []);
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

    // Delete a showtime
    const handleDeleteShowtime = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa lịch chiếu này?')) {
            try {
                const response = await axios.delete(`/api/admin/showtime/${id}`);
                if (response.data.success) {
                    setShowtimes(showtimes.filter(showtime => showtime.id_showtime !== id));
                    alert('Xóa lịch chiếu thành công!');
                } else {
                    alert(`Lỗi: ${response.data.message}`);
                }
            } catch (err) {
                console.error('Lỗi khi xóa lịch chiếu:', err);
                alert('Đã xảy ra lỗi khi xóa lịch chiếu');
            }
        }
    };

    // Load showtimes when the component mounts
    useEffect(() => {
        fetchShowtimes();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark">Quản lý lịch chiếu</h1>
                <Link href="/admin/showtime/add">
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

            {loading ? (
                <div className="text-center py-10">
                    <p className="text-xl">Đang tải danh sách lịch chiếu...</p>
                </div>
            ) : showtimes.length > 0 ? (
                <div className="overflow-x-auto">
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
                            {showtimes.map((showtime) => (
                                <tr key={showtime.id_showtime}>
                                    <td className="py-3 px-4 border-b text-dark">{showtime.id_showtime}</td>
                                    <td className="py-3 px-4 border-b text-dark">{showtime.id_movie || 'N/A'}</td>
                                    <td className="py-3 px-4 border-b text-dark">{showtime.id_screen || 'N/A'}</td>
                                    <td className="py-3 px-4 border-b text-dark">{showtime.show_date}</td>
                                    <td className="py-3 px-4 border-b text-dark">{showtime.start_time}</td>
                                    <td className="py-3 px-4 border-b text-dark">{showtime.end_time}</td>
                                    <td className="py-3 px-4 border-b text-dark">
                                        <span
                                            className={`px-2 py-1 rounded ${showtime.status === 'available'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {showtime.status === 'available' ? 'Còn vé' : 'Hết vé'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <div className="flex gap-2">
                                            <Link href={`/admin/showtime/edit/${showtime.id_showtime}`}>
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