"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Entertainment {
    id_entertainment: number;
    name: string;
    type: string;
    location: string;
    description: string;
    image_url: string;
    price: number;
    opening_hours: string;
    status: string;
}

export default function AdminEntertainmentPage() {
    const [entertainments, setEntertainments] = useState<Entertainment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();    // Fetch entertainments from the database
    const fetchEntertainments = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/admin/entertainment', {
                timeout: 8000,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (response.data.success) {
                setEntertainments(response.data.data || []);
            } else {
                setError(response.data.message || 'Không thể tải danh sách dịch vụ giải trí');
            }
        } catch (err: any) {
            console.error('Lỗi khi tải danh sách dịch vụ giải trí:', err);

            if (err.code === 'ECONNABORTED') {
                setError('Quá thời gian kết nối. Máy chủ không phản hồi.');
            } else if (!err.response) {
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra server đã được khởi động chưa.');
            } else {
                setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải danh sách dịch vụ giải trí');
            }
        } finally {
            setLoading(false);
        }
    };

    // Toggle entertainment status
    const handleToggleStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            const response = await axios.patch(`/api/admin/entertainment/${id}`, {
                status: newStatus
            });

            if (response.data.success) {
                setEntertainments(entertainments.map(entertainment =>
                    entertainment.id_entertainment === id
                        ? { ...entertainment, status: newStatus }
                        : entertainment
                ));
            } else {
                alert(`Lỗi: ${response.data.message}`);
            }
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái dịch vụ giải trí:', err);
            alert('Đã xảy ra lỗi khi cập nhật trạng thái dịch vụ giải trí');
        }
    };

    // Delete entertainment
    const handleDeleteEntertainment = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ giải trí này?')) {
            try {
                const response = await axios.delete(`/api/admin/entertainment/${id}`);
                if (response.data.success) {
                    setEntertainments(entertainments.filter(entertainment => entertainment.id_entertainment !== id));
                    alert('Xóa dịch vụ giải trí thành công!');
                } else {
                    alert(`Lỗi: ${response.data.message}`);
                }
            } catch (err) {
                console.error('Lỗi khi xóa dịch vụ giải trí:', err);
                alert('Đã xảy ra lỗi khi xóa dịch vụ giải trí');
            }
        }
    };

    // Load entertainments when the component mounts
    useEffect(() => {
        fetchEntertainments();
    }, []);

    // Format price to VND
    const formatPrice = (price: number) => {
        if (price === 0) return 'Miễn phí';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Get translated type name
    const getTypeName = (type: string) => {
        switch (type) {
            case 'kids': return 'Khu trẻ em';
            case 'sports': return 'Thể thao';
            case 'games': return 'Trò chơi điện tử';
            case 'vr': return 'Thực tế ảo';
            default: return type;
        }
    };

    // Get status class
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    // Get status text
    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Hoạt động';
            case 'inactive': return 'Tạm ngưng';
            case 'maintenance': return 'Bảo trì';
            default: return status;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý dịch vụ giải trí</h1>
                <Link href="/admin/entertainment/add">
                    <button className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded">
                        Thêm dịch vụ mới
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
                    <p className="text-xl">Đang tải danh sách dịch vụ giải trí...</p>
                </div>
            ) : entertainments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {entertainments.map((entertainment) => (
                        <div key={entertainment.id_entertainment} className="bg-white rounded-lg shadow-lg overflow-hidden border">
                            <div className="h-48 bg-gray-200 relative">
                                <img
                                    src={entertainment.image_url || '/images/no-image.jpg'}
                                    alt={entertainment.name}
                                    className="w-full h-full object-cover"
                                />
                                <span className={`absolute top-2 right-2 px-2 py-1 rounded ${getStatusClass(entertainment.status)}`}>
                                    {getStatusText(entertainment.status)}
                                </span>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold">{entertainment.name}</h3>
                                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mt-1">
                                            {getTypeName(entertainment.type)}
                                        </span>
                                    </div>
                                    <div className="text-lg font-semibold">
                                        {formatPrice(entertainment.price)}
                                    </div>
                                </div>
                                <p className="text-gray-600 mt-2">{entertainment.description}</p>
                                <div className="mt-2">
                                    <p><strong>Địa điểm:</strong> {entertainment.location}</p>
                                    <p><strong>Giờ mở cửa:</strong> {entertainment.opening_hours}</p>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Link href={`/admin/entertainment/edit/${entertainment.id_entertainment}`}>
                                        <button className="bg-yellow-500 hover:bg-yellow-700 text-white px-3 py-1 rounded">
                                            Sửa
                                        </button>
                                    </Link>
                                    {entertainment.status !== 'maintenance' && (
                                        <button
                                            onClick={() => handleToggleStatus(entertainment.id_entertainment, entertainment.status)}
                                            className={`${entertainment.status === 'active'
                                                    ? 'bg-gray-500 hover:bg-gray-700'
                                                    : 'bg-green-500 hover:bg-green-700'
                                                } text-white px-3 py-1 rounded`}
                                        >
                                            {entertainment.status === 'active' ? 'Tạm ngưng' : 'Kích hoạt'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteEntertainment(entertainment.id_entertainment)}
                                        className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded ml-auto"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-xl">Chưa có dịch vụ giải trí nào trong cơ sở dữ liệu</p>
                    <p className="mt-2 text-gray-500">
                        Sử dụng nút &quot;Thêm dịch vụ mới&quot; để thêm dịch vụ giải trí
                    </p>
                </div>
            )}
        </div>
    );
}
