"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Promotion {
    id_promotion: number;
    promotion_name: string;
    promotion_type: string;
    discount_amount: number;
    code: string;
    start_date: string;
    end_date: string;
    usage_limit: number;
    used_count: number;
    status: string;
}

export default function AdminPromotionsPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();    // Fetch promotions from the database
    const fetchPromotions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/admin/promotions', {
                timeout: 8000,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (response.data.success) {
                setPromotions(response.data.data || []);
            } else {
                setError(response.data.message || 'Không thể tải danh sách khuyến mãi');
            }
        } catch (err: any) {
            console.error('Lỗi khi tải danh sách khuyến mãi:', err);

            if (err.code === 'ECONNABORTED') {
                setError('Quá thời gian kết nối. Máy chủ không phản hồi.');
            } else if (!err.response) {
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra server đã được khởi động chưa.');
            } else {
                setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải danh sách khuyến mãi');
            }
        } finally {
            setLoading(false);
        }
    };

    // Toggle promotion status
    const handleToggleStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            const response = await axios.patch(`/api/admin/promotions/${id}`, {
                status: newStatus
            });

            if (response.data.success) {
                setPromotions(promotions.map(promotion =>
                    promotion.id_promotion === id
                        ? { ...promotion, status: newStatus }
                        : promotion
                ));
            } else {
                alert(`Lỗi: ${response.data.message}`);
            }
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái khuyến mãi:', err);
            alert('Đã xảy ra lỗi khi cập nhật trạng thái khuyến mãi');
        }
    };

    // Delete a promotion
    const handleDeletePromotion = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
            try {
                const response = await axios.delete(`/api/admin/promotions/${id}`);
                if (response.data.success) {
                    setPromotions(promotions.filter(promotion => promotion.id_promotion !== id));
                    alert('Xóa khuyến mãi thành công!');
                } else {
                    alert(`Lỗi: ${response.data.message}`);
                }
            } catch (err) {
                console.error('Lỗi khi xóa khuyến mãi:', err);
                alert('Đã xảy ra lỗi khi xóa khuyến mãi');
            }
        }
    };

    // Load promotions when the component mounts
    useEffect(() => {
        fetchPromotions();
    }, []);

    // Format discount amount
    const formatDiscount = (amount: number, type: string) => {
        if (type === 'percentage') {
            return `${amount}%`;
        } else {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
        }
    };

    // Get status class
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'expired': return 'bg-red-100 text-red-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    // Get status text
    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Đang hoạt động';
            case 'inactive': return 'Tạm ngưng';
            case 'expired': return 'Hết hạn';
            default: return status;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý khuyến mãi</h1>
                <Link href="/admin/promotions/add">
                    <button className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded">
                        Thêm khuyến mãi mới
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
                    <p className="text-xl">Đang tải danh sách khuyến mãi...</p>
                </div>
            ) : promotions.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">ID</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Tên khuyến mãi</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Mã</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Giảm giá</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Thời gian</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Sử dụng</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Trạng thái</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promotions.map((promotion) => (
                                <tr key={promotion.id_promotion}>
                                    <td className="py-3 px-4 border-b">{promotion.id_promotion}</td>
                                    <td className="py-3 px-4 border-b">{promotion.promotion_name}</td>
                                    <td className="py-3 px-4 border-b">
                                        <span className="bg-gray-100 px-2 py-1 rounded font-mono">
                                            {promotion.code}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        {formatDiscount(promotion.discount_amount, promotion.promotion_type)}
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        {new Date(promotion.start_date).toLocaleDateString('vi-VN')} - {new Date(promotion.end_date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        {promotion.used_count} / {promotion.usage_limit}
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <span className={`px-2 py-1 rounded ${getStatusClass(promotion.status)}`}>
                                            {getStatusText(promotion.status)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <div className="flex gap-2">
                                            <Link href={`/admin/promotions/edit/${promotion.id_promotion}`}>
                                                <button className="bg-yellow-500 hover:bg-yellow-700 text-white px-2 py-1 rounded text-sm">
                                                    Sửa
                                                </button>
                                            </Link>
                                            {promotion.status !== 'expired' && (
                                                <button
                                                    onClick={() => handleToggleStatus(promotion.id_promotion, promotion.status)}
                                                    className={`${promotion.status === 'active'
                                                            ? 'bg-gray-500 hover:bg-gray-700'
                                                            : 'bg-green-500 hover:bg-green-700'
                                                        } text-white px-2 py-1 rounded text-sm`}
                                                >
                                                    {promotion.status === 'active' ? 'Ngưng' : 'Kích hoạt'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeletePromotion(promotion.id_promotion)}
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
                    <p className="text-xl">Chưa có khuyến mãi nào trong cơ sở dữ liệu</p>
                    <p className="mt-2 text-gray-500">
                        Sử dụng nút &quot;Thêm khuyến mãi mới&quot; để thêm khuyến mãi
                    </p>
                </div>
            )}
        </div>
    );
}
