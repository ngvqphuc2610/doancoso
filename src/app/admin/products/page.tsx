"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Product {
    id_product: number;
    id_typeproduct: number | null;
    product_name: string;
    description: string | null;
    price: number;
    image: string | null;
    status: string;
    quantity: number;
}

export default function AdminProductPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch products from the database
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/admin/products', {
                timeout: 8000,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (response.data.success) {
                setProducts(response.data.data || []);
            } else {
                setError(response.data.message || 'Không thể tải danh sách sản phẩm');
            }
        } catch (err: any) {
            console.error('Lỗi khi tải danh sách sản phẩm:', err);

            if (err.code === 'ECONNABORTED') {
                setError('Quá thời gian kết nối. Máy chủ không phản hồi.');
            } else if (!err.response) {
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra server đã được khởi động chưa.');
            } else {
                setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải danh sách sản phẩm');
            }
        } finally {
            setLoading(false);
        }
    };

    // Toggle product status
    const handleToggleStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
        try {
            const response = await axios.patch(`/api/admin/products/${id}`, {
                status: newStatus
            });

            if (response.data.success) {
                setProducts(products.map(product =>
                    product.id_product === id
                        ? { ...product, status: newStatus }
                        : product
                ));
            } else {
                alert(`Lỗi: ${response.data.message}`);
            }
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái sản phẩm:', err);
            alert('Đã xảy ra lỗi khi cập nhật trạng thái sản phẩm');
        }
    };

    // Delete product
    const handleDeleteProduct = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                const response = await axios.delete(`/api/admin/products/${id}`);
                if (response.data.success) {
                    setProducts(products.filter(product => product.id_product !== id));
                    alert('Xóa sản phẩm thành công!');
                } else {
                    alert(`Lỗi: ${response.data.message}`);
                }
            } catch (err) {
                console.error('Lỗi khi xóa sản phẩm:', err);
                alert('Đã xảy ra lỗi khi xóa sản phẩm');
            }
        }
    };

    // Load products when the component mounts
    useEffect(() => {
        fetchProducts();
    }, []);

    // Format price to VND
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
                <Link href="/admin/products/add">
                    <button className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded">
                        Thêm sản phẩm mới
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
                    <p className="text-xl">Đang tải danh sách sản phẩm...</p>
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-dark">
                    {products.map((product) => (
                        <div key={product.id_product} className="bg-white rounded-lg shadow-lg overflow-hidden border">
                            <div className="h-48 bg-gray-200 relative">
                                <img
                                    src={product.image || '/images/no-image.jpg'}
                                    alt={product.product_name}
                                    className="w-full h-full object-cover"
                                />
                                <span className={`absolute top-2 right-2 px-2 py-1 rounded ${product.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {product.status === 'available' ? 'Đang bán' : 'Ngừng bán'}
                                </span>
                            </div>
                            <div className="p-4">
                                <h3 className="text-xl font-bold">{product.product_name}</h3>
                                <p className="text-gray-600 mt-2">{product.description || 'Không có mô tả'}</p>
                                <div className="mt-2">
                                    <p><strong>Giá:</strong> {formatPrice(product.price)}</p>
                                    <p><strong>Số lượng:</strong> {product.quantity}</p>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Link href={`/admin/products/edit/${product.id_product}`}>
                                        <button className="bg-yellow-500 hover:bg-yellow-700 text-white px-3 py-1 rounded">
                                            Sửa
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => handleToggleStatus(product.id_product, product.status)}
                                        className={`${product.status === 'available'
                                                ? 'bg-gray-500 hover:bg-gray-700'
                                                : 'bg-green-500 hover:bg-green-700'
                                            } text-white px-3 py-1 rounded`}
                                    >
                                        {product.status === 'available' ? 'Ngừng bán' : 'Kích hoạt'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id_product)}
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
                    <p className="text-xl">Chưa có sản phẩm nào trong cơ sở dữ liệu</p>
                    <p className="mt-2 text-gray-500">
                        Sử dụng nút &quot;Thêm sản phẩm mới&quot; để thêm sản phẩm
                    </p>
                </div>
            )}
        </div>
    );
}