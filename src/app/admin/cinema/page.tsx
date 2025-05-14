"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiUrl, apiConfig } from '@/lib/apiUtils';

interface Cinema {
    id_cinema: number;
    cinema_name: string;
    contact_number: string;
    address: string;
    status: string;
}

export default function AdminCinemaPage() {
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Fetch cinemas from the database
    const fetchCinemas = async () => {
        setLoading(true);
        setError(null);
        try {
            // Gọi trực tiếp tới API route trong Next.js
            console.log('Calling API at: /api/admin/cinema');

            const response = await axios.get('/api/admin/cinema', {
                ...apiConfig,
                timeout: 10000
            });
            console.log('Response data:', response.data);

            // Kiểm tra xem phản hồi có thành công không
            if (response.data.success) {
                setCinemas(response.data.data || []);
            } else {
                setError(response.data.message || 'Không thể tải danh sách rạp');
            }
        } catch (err: any) {
            console.error('Lỗi khi tải danh sách rạp:', err);

            if (err.code === 'ECONNABORTED') {
                setError('Quá thời gian kết nối. Máy chủ không phản hồi.');
            } else if (!err.response) {
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra server đã được khởi động chưa.');
            } else {
                setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải danh sách rạp');
            }
        } finally {
            setLoading(false);
        }
    };

    // Delete a cinema
    const handleDeleteCinema = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa rạp này?')) {
            try {
                const response = await axios.delete(`/api/admin/cinema/${id}`);
                if (response.data.success) {
                    setCinemas(cinemas.filter(cinema => cinema.id_cinema !== id));
                    alert('Xóa rạp thành công!');
                } else {
                    alert(`Lỗi: ${response.data.message}`);
                }
            } catch (err) {
                console.error('Lỗi khi xóa rạp:', err);
                alert('Đã xảy ra lỗi khi xóa rạp');
            }
        }
    };

    // Load cinemas when the component mounts
    useEffect(() => {
        fetchCinemas();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark">Quản lý rạp chiếu</h1>
                <Link href="/admin/cinema/add">
                    <button className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded">
                        Thêm rạp mới
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
                    <p className="text-xl">Đang tải danh sách rạp...</p>
                </div>
            ) : cinemas.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">ID</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Tên rạp</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Địa chỉ</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Số điện thoại</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Trạng thái</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cinemas.map((cinema) => (
                                <tr key={cinema.id_cinema}>
                                    <td className="py-3 px-4 border-b text-dark" >{cinema.id_cinema}</td>
                                    <td className="py-3 px-4 border-b text-dark">{cinema.cinema_name}</td>
                                    <td className="py-3 px-4 border-b text-dark">{cinema.address}</td>
                                    <td className="py-3 px-4 border-b text-dark">{cinema.contact_number}</td>

                                    <td className="py-3 px-4 border-b text-dark">
                                        <span
                                            className={`px-2 py-1 rounded ${cinema.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {cinema.status === 'active' ? 'Hoạt động' : 'Đóng cửa'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <div className="flex gap-2">
                                          
                                            <Link href={`/admin/cinema/edit/${cinema.id_cinema}`}>
                                                <button className="bg-yellow-500 hover:bg-yellow-700 text-white px-2 py-1 rounded text-sm">
                                                    Sửa
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteCinema(cinema.id_cinema)}
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
                    <p className="text-xl text-dark">Chưa có rạp nào trong cơ sở dữ liệu</p>
                    <p className="mt-2 text-gray-500">
                        Sử dụng nút &quot;Thêm rạp mới&quot; để bắt đầu thêm rạp chiếu
                    </p>
                </div>
            )}
        </div>
    );
}
