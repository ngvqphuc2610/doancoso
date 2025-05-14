"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiUrl, apiConfig } from '@/lib/apiUtils';

interface Seat {
    id_seats: number;
    id_screen: number | null;
    id_seattype: number | null;
    seat_row: string;
    seat_number: number;
    status: string;
}

export default function AdminSeatsPage() {
    const [seats, setSeats] = useState<Seat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Fetch seats from the database
    const fetchSeats = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Calling API at: /api/admin/seats');
            const response = await axios.get('/api/admin/seats', {
                ...apiConfig,
                timeout: 10000
            });
            console.log('Response data:', response.data);

            if (response.data.success) {
                setSeats(response.data.data || []);
            } else {
                setError(response.data.message || 'Không thể tải danh sách ghế ngồi');
            }
        } catch (err: any) {
            console.error('Lỗi khi tải danh sách ghế ngồi:', err);

            if (err.code === 'ECONNABORTED') {
                setError('Quá thời gian kết nối. Máy chủ không phản hồi.');
            } else if (!err.response) {
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra server đã được khởi động chưa.');
            } else {
                setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải danh sách ghế ngồi');
            }
        } finally {
            setLoading(false);
        }
    };

    // Delete a seat
    const handleDeleteSeat = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa ghế này?')) {
            try {
                const response = await axios.delete(`/api/admin/seat/${id}`);
                if (response.data.success) {
                    setSeats(seats.filter(seat => seat.id_seats !== id));
                    alert('Xóa ghế thành công!');
                } else {
                    alert(`Lỗi: ${response.data.message}`);
                }
            } catch (err) {
                console.error('Lỗi khi xóa ghế:', err);
                alert('Đã xảy ra lỗi khi xóa ghế');
            }
        }
    };

    // Load seats when the component mounts
    useEffect(() => {
        fetchSeats();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark">Quản lý ghế ngồi</h1>
                <Link href="/admin/seat/add">
                    <button className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded">
                        Thêm ghế mới
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
                    <p className="text-xl">Đang tải danh sách ghế...</p>
                </div>
            ) : seats.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">ID</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Phòng chiếu</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Loại ghế</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Hàng ghế</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark"> Số ghế</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Trạng thái</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {seats.map((seat) => (
                                <tr key={seat.id_seats}>
                                    <td className="py-3 px-4 border-b text-dark">{seat.id_seats}</td>
                                    <td className="py-3 px-4 border-b text-dark">{seat.id_screen || 'N/A'}</td>
                                    <td className="py-3 px-4 border-b text-dark">{seat.id_seattype || 'N/A'}</td>
                                    <td className="py-3 px-4 border-b text-dark">{seat.seat_row}</td>
                                    <td className="py-3 px-4 border-b text-dark">{seat.seat_number}</td>
                                    <td className="py-3 px-4 border-b text-dark">
                                        <span
                                            className={`px-2 py-1 rounded ${seat.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : seat.status === 'maintenance'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {seat.status === 'active'
                                                ? 'Hoạt động'
                                                : seat.status === 'maintenance'
                                                ? 'Bảo trì'
                                                : 'Không hoạt động'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <div className="flex gap-2">
                                            <Link href={`/admin/seat/edit/${seat.id_seats}`}>
                                                <button className="bg-yellow-500 hover:bg-yellow-700 text-white px-2 py-1 rounded text-sm">
                                                    Sửa
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteSeat(seat.id_seats)}
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
                    <p className="text-xl text-dark">Chưa có ghế nào trong cơ sở dữ liệu</p>
                    <p className="mt-2 text-gray-500">
                        Sử dụng nút &quot;Thêm ghế mới&quot; để bắt đầu thêm ghế
                    </p>
                </div>
            )}
        </div>
    );
}