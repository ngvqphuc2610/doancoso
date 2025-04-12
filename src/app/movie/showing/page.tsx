"use client";

import React, { useState, useEffect } from 'react';
import Layout2 from '@/components/layout/Layout2';
import MovieCarousel from '@/components/movies/MovieCarousel';
import { MovieProps } from '@/components/movies/MovieCard';
import { getNowShowingMovies, fallbackNowShowingMovies } from '@/lib/film';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ShowingPage() {
    const [movies, setMovies] = useState<MovieProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                const nowPlayingMovies = await getNowShowingMovies();
                setMovies(nowPlayingMovies.map(movie => ({ ...movie, isComingSoon: false })));
                setLoading(false);
            } catch (err) {
                console.error("Không thể lấy dữ liệu phim đang chiếu:", err);
                setMovies(fallbackNowShowingMovies.map(movie => ({ ...movie, isComingSoon: false })));
                setError("Đã xảy ra lỗi khi tải dữ liệu. Đang hiển thị dữ liệu dự phòng.");
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    if (loading) {
        return (
            <Layout2>
                <div className="container mx-auto px-4 py-16 flex justify-center items-center">
                    <LoadingSpinner />
                </div>
            </Layout2>
        );
    }

    return (
        <Layout2>
            <div className="container mx-auto px-4 py-8">
                {error && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                        <p>{error}</p>
                    </div>
                )}

                <div className='mb-32'>
                    <MovieCarousel movies={movies} title="PHIM ĐANG CHIẾU" />
                </div>
            </div>
        </Layout2>
    );
}