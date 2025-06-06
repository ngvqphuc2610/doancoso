"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface Cinema {
    id_cinema: number;
    cinema_name: string;
    address: string;

    status: string;
}

export default function EditCinema({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cinema, setCinema] = useState<Cinema | null>(null);

    const [formData, setFormData] = useState({
        cinema_name: '',
        address: '',
        phone: '',
        status: 'active'
    });

    // Fetch cinema details
    useEffect(() => {
        const fetchCinema = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`/api/admin/cinema/${id}`);
                if (response.data.success) {
                    const cinemaData = response.data.data;
                    setCinema(cinemaData);
                    setFormData({
                        cinema_name: cinemaData.cinema_name || '',
                        address: cinemaData.address || '',
                        phone: cinemaData.phone || '',
                        status: cinemaData.status || 'active'
                    });
                } else {
                    setError(response.data.message || 'Không thể tải thông tin rạp chiếu');
                }
            } catch (err: any) {
                console.error('Error fetching cinema:', err);
                setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin rạp chiếu');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCinema();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await axios.put(`/api/admin/cinema/${id}`, formData);

            if (response.data.success) {
                alert('Cập nhật rạp chiếu thành công!');
                router.push('/admin/cinema');
                router.refresh();
            } else {
                setError(response.data.message || 'Có lỗi xảy ra khi cập nhật rạp chiếu');
            }
        } catch (err: any) {
            console.error('Error updating cinema:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật rạp chiếu');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-lg">Đang tải thông tin rạp chiếu...</p>
            </div>
        );
    }

    if (!cinema && !isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    <p>Không tìm thấy thông tin rạp chiếu với id: {id}</p>
                </div>
                <Link href="/admin/cinema">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">
                        Quay lại danh sách rạp chiếu
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Cập nhật rạp chiếu</h1>
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
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Cập nhật rạp chiếu'}
                    </button>
                </div>
            </form>
        </div>
    );
}
