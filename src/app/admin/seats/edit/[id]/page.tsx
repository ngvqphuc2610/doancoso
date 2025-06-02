"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { apiConfig } from '@/lib/apiUtils';

interface Screen {
    id_screen: number;
    screen_name: string;
    cinema_name: string;
}

interface SeatType {
    id_seattype: number;
    type_name: string;
    description?: string;
}

interface Seat {
    id_seats: number;
    id_screen: number;
    id_seattype: number;
    seat_row: string;
    seat_number: number;
    status: string;
}

export default function EditSeatPage() {
    const router = useRouter();
    const params = useParams();
    const seatId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [screens, setScreens] = useState<Screen[]>([]);
    const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
    const [formData, setFormData] = useState({
        id_screen: '',
        id_seattype: '',
        seat_row: '',
        seat_number: '',
        status: 'active'
    });

    // Fetch seat data, screens and seat types
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch current seat data
                const seatResponse = await axios.get(`/api/admin/seats/${seatId}`, apiConfig);
                if (seatResponse.data.success) {
                    const seat = seatResponse.data.data;
                    setFormData({
                        id_screen: seat.id_screen?.toString() || '',
                        id_seattype: seat.id_seattype?.toString() || '',
                        seat_row: seat.seat_row || '',
                        seat_number: seat.seat_number?.toString() || '',
                        status: seat.status || 'active'
                    });
                }

                // Fetch screens
                const screensResponse = await axios.get('/api/admin/screen', apiConfig);
                if (screensResponse.data.success) {
                    setScreens(screensResponse.data.data || []);
                }

                // Fetch seat types
                const seatTypesResponse = await axios.get('/api/admin/seat-types', apiConfig);
                if (seatTypesResponse.data.success) {
                    setSeatTypes(seatTypesResponse.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Không thể tải thông tin ghế');
            } finally {
                setInitialLoading(false);
            }
        };

        if (seatId) {
            fetchData();
        }
    }, [seatId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.id_screen || !formData.id_seattype || !formData.seat_row || !formData.seat_number) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc');
                setLoading(false);
                return;
            }

            const response = await axios.put(`/api/admin/seats/${seatId}`, {
                id_screen: parseInt(formData.id_screen),
                id_seattype: parseInt(formData.id_seattype),
                seat_row: formData.seat_row.toUpperCase(),
                seat_number: parseInt(formData.seat_number),
                status: formData.status
            }, apiConfig);

            if (response.data.success) {
                alert('Cập nhật ghế thành công!');
                router.push('/admin/seats');
            } else {
                alert(`Lỗi: ${response.data.message}`);
            }
        } catch (error: any) {
            console.error('Error updating seat:', error);
            alert(`Đã xảy ra lỗi: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-xl">Đang tải thông tin ghế...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 text-dark">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => router.back()}
                        className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        ← Quay lại
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Chỉnh sửa ghế #{seatId}</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Screen Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phòng chiếu <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="id_screen"
                                value={formData.id_screen}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Chọn phòng chiếu</option>
                                {screens.map((screen) => (
                                    <option key={screen.id_screen} value={screen.id_screen}>
                                        {screen.screen_name} - {screen.cinema_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Seat Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loại ghế <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="id_seattype"
                                value={formData.id_seattype}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Chọn loại ghế</option>
                                {seatTypes.map((seatType) => (
                                    <option key={seatType.id_seattype} value={seatType.id_seattype}>
                                        {seatType.type_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Seat Row */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hàng ghế <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="seat_row"
                                value={formData.seat_row}
                                onChange={handleInputChange}
                                required
                                maxLength={2}
                                placeholder="A, B, C..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-sm text-gray-500 mt-1">Nhập chữ cái hàng ghế (A, B, C...)</p>
                        </div>

                        {/* Seat Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số ghế <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="seat_number"
                                value={formData.seat_number}
                                onChange={handleInputChange}
                                required
                                min="1"
                                max="50"
                                placeholder="1, 2, 3..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-sm text-gray-500 mt-1">Nhập số ghế (1-50)</p>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="active">Hoạt động</option>
                                <option value="maintenance">Bảo trì</option>
                                <option value="inactive">Không hoạt động</option>
                            </select>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? 'Đang cập nhật...' : 'Cập nhật ghế'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}