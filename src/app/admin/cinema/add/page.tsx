"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function AddCinema() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        cinema_name: '',
        address: '',

        status: 'active',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await axios.post('/api/admin/cinema', formData);

            if (response.data.success) {
                alert('Thêm rạp chiếu thành công!');
                router.push('/admin/cinema');
                router.refresh();
            } else {
                setError(response.data.message || 'Có lỗi xảy ra khi thêm rạp chiếu');
            }
        } catch (err: any) {
            console.error('Error adding cinema:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi thêm rạp chiếu');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Thêm rạp chiếu mới</h1>
                <Link href="/admin/cinema">
                    <button className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded">
                        Hủy
                    </button>
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cinema_name">
                        Tên rạp chiếu *
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="cinema_name"
                        name="cinema_name"
                        type="text"
                        placeholder="Nhập tên rạp chiếu"
                        value={formData.cinema_name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                        Địa chỉ *
                    </label>
                    <textarea
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="address"
                        name="address"
                        placeholder="Nhập địa chỉ rạp chiếu"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        required
                    />
                </div>


                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                        Trạng thái
                    </label>
                    <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Đóng cửa</option>
                    </select>
                </div>

                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Thêm rạp chiếu'}
                    </button>
                </div>
            </form>
        </div>
    );
}
