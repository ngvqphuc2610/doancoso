"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Product {
    id_product: number;
    product_name: string;
    category: string;
    price: number;
    image_url: string;
    description: string;
    stock: number;
    status: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();    // Fetch products from the database
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

    // Delete a product
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

    // Get translated category name
    const getCategoryName = (category: string) => {
        switch (category) {
            case 'popcorn': return 'Bắp rang';
            case 'drinks': return 'Đồ uống';
            case 'combo': return 'Combo';
            case 'snacks': return 'Đồ ăn nhẹ';
            default: return category;
        }
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
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">ID</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Hình ảnh</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Tên sản phẩm</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Loại</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Giá</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Tồn kho</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Trạng thái</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id_product}>
                                    <td className="py-3 px-4 border-b">{product.id_product}</td>
                                    <td className="py-3 px-4 border-b">
                                        <img
                                            src={product.image_url || '/images/no-image.png'}
                                            alt={product.product_name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    </td>
                                    <td className="py-3 px-4 border-b">{product.product_name}</td>
                                    <td className="py-3 px-4 border-b">{getCategoryName(product.category)}</td>
                                    <td className="py-3 px-4 border-b">{formatPrice(product.price)}</td>
                                    <td className="py-3 px-4 border-b">{product.stock}</td>
                                    <td className="py-3 px-4 border-b">
                                        <span
                                            className={`px-2 py-1 rounded ${product.status === 'available'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {product.status === 'available' ? 'Có sẵn' : 'Hết hàng'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <div className="flex gap-2">
                                            <Link href={`/admin/products/edit/${product.id_product}`}>
                                                <button className="bg-yellow-500 hover:bg-yellow-700 text-white px-2 py-1 rounded text-sm">
                                                    Sửa
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id_product)}
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
                    <p className="text-xl">Chưa có sản phẩm nào trong cơ sở dữ liệu</p>
                    <p className="mt-2 text-gray-500">
                        Sử dụng nút &quot;Thêm sản phẩm mới&quot; để thêm sản phẩm
                    </p>
                </div>
            )}
        </div>
    );
}
