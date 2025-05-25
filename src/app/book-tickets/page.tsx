'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import SeatMap from '@/components/movies/SeatSelection';

interface BookingPageProps {
    params: {};
    searchParams: {
        showtime: string;
        cinemaName: string;
        screenName: string;
    };
}

export default function BookingPage({ searchParams }: BookingPageProps) {
    const showtimeId = parseInt(searchParams.showtime);
    const cinemaName = decodeURIComponent(searchParams.cinemaName || '');
    const screenName = decodeURIComponent(searchParams.screenName || '');
    const [loading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleSeatConfirmation = (selectedSeats: string[]) => {
        // Xử lý khi người dùng xác nhận ghế đã chọn
        console.log('Selected seats:', selectedSeats);
        // Chuyển đến trang thanh toán với thông tin ghế đã chọn
        const seatsParam = selectedSeats.join(',');
        window.location.href = `/checkout?showtime=${showtimeId}&seats=${seatsParam}`;
    };

    return (
        <Layout>
            <main className="min-h-screen py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-white mb-6 text-center">Chọn Ghế</h1>

                    {loading ? (
                        <div className="text-center text-white">Đang tải...</div>
                    ) : error ? (
                        <div className="text-center text-red-500">{error}</div>
                    ) : (<SeatMap
                        showtimeId={showtimeId}
                        cinemaName={cinemaName}
                        screenName={screenName}
                        onConfirm={handleSeatConfirmation}
                    />
                    )}
                </div>
            </main>
        </Layout>
    );
}
