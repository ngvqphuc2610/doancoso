"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiUrl, apiConfig } from '@/lib/apiUtils';

interface Screen {
    id_screen: number;
    screen_name: string;
    id_cinema: number | null;
    capacity: number;
    screen_type: string;
    status: string;
}

export default function AdminScreensPage() {
    const [screens, setScreens] = useState<Screen[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Fetch screens from the database
    const fetchScreens = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Calling API at: /api/admin/screen');
            const response = await axios.get('/api/admin/screen', {
                ...apiConfig,
                timeout: 10000
            });
            console.log('Response data:', response.data);

            if (response.data.success) {
                setScreens(response.data.data || []);
            } else {
                setError(response.data.message || 'Không thể tải danh sách phòng chiếu');
            }
        } catch (err: any) {
            console.error('Lỗi khi tải danh sách phòng chiếu:', err);

            if (err.code === 'ECONNABORTED') {
                setError('Quá thời gian kết nối. Máy chủ không phản hồi.');
            } else if (!err.response) {
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra server đã được khởi động chưa.');
            } else {
                setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải danh sách phòng chiếu');
            }
        } finally {
            setLoading(false);
        }
    };

    // Delete a screen
    const handleDeleteScreen = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phòng chiếu này?')) {
            try {
                const response = await axios.delete(`/api/admin/screen/${id}`);
                if (response.data.success) {
                    setScreens(screens.filter(screen => screen.id_screen !== id));
                    alert('Xóa phòng chiếu thành công!');
                } else {
                    alert(`Lỗi: ${response.data.message}`);
                }
            } catch (err) {
                console.error('Lỗi khi xóa phòng chiếu:', err);
                alert('Đã xảy ra lỗi khi xóa phòng chiếu');
            }
        }
    };

    // Load screens when the component mounts
    useEffect(() => {
        fetchScreens();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark">Quản lý phòng chiếu</h1>
                <Link href="/admin/screen/add">
                    <button className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded">
                        Thêm phòng chiếu mới
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
                    <p className="text-xl">Đang tải danh sách phòng chiếu...</p>
                </div>
            ) : screens.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">ID</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Tên phòng</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Rạp</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Sức chứa</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Loại phòng</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Trạng thái</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {screens.map((screen) => (
                                <tr key={screen.id_screen}>
                                    <td className="py-3 px-4 border-b text-dark">{screen.id_screen}</td>
                                    <td className="py-3 px-4 border-b text-dark">{screen.screen_name}</td>
                                    <td className="py-3 px-4 border-b text-dark">{screen.id_cinema || 'N/A'}</td>
                                    <td className="py-3 px-4 border-b text-dark">{screen.capacity}</td>
                                    <td className="py-3 px-4 border-b text-dark">{screen.screen_type}</td>
                                    <td className="py-3 px-4 border-b text-dark">
                                        <span
                                            className={`px-2 py-1 rounded ${screen.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {screen.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <div className="flex gap-2">
                                            <Link href={`/admin/screen/edit/${screen.id_screen}`}>
                                                <button className="bg-yellow-500 hover:bg-yellow-700 text-white px-2 py-1 rounded text-sm">
                                                    Sửa
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteScreen(screen.id_screen)}
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
                    <p className="text-xl text-dark">Chưa có phòng chiếu nào trong cơ sở dữ liệu</p>
                    <p className="mt-2 text-gray-500">
                        Sử dụng nút &quot;Thêm phòng chiếu mới&quot; để bắt đầu thêm phòng chiếu
                    </p>
                </div>
            )}
        </div>
    );
}