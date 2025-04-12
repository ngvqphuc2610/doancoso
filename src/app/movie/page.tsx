"use client";

import React, { useState, useEffect } from 'react';
import Layout2 from '@/components/layout/Layout2';
import MovieCarousel from '@/components/movies/MovieCarousel';
import { MovieProps } from '@/components/movies/MovieCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getNowShowingMovies, getComingSoonMovies, fallbackNowShowingMovies, fallbackComingSoonMovies } from '@/lib/film';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function MoviePage() {
  const [nowShowingMovies, setNowShowingMovies] = useState<MovieProps[]>([]);
  const [comingSoonMovies, setComingSoonMovies] = useState<MovieProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        // Sử dụng các hàm từ lib/film.tsx thay vì gọi API trực tiếp
        const nowPlayingMovies = await getNowShowingMovies();
        setNowShowingMovies(nowPlayingMovies);

        const upcomingMovies = await getComingSoonMovies();
        setComingSoonMovies(upcomingMovies);

        setLoading(false);
      } catch (err) {
        console.error("Không thể lấy dữ liệu phim:", err);

        // Sử dụng dữ liệu fallback khi API gặp lỗi
        setNowShowingMovies(fallbackNowShowingMovies);
        setComingSoonMovies(fallbackComingSoonMovies);

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


        <MovieCarousel
          title="PHIM ĐANG CHIẾU"
          movies={nowShowingMovies.map(movie => ({ ...movie, isComingSoon: false }))}
          className="mt-8 pb-[100px]"
        />

        <MovieCarousel
          title="PHIM SẮP CHIẾU"
          movies={comingSoonMovies.map(movie => ({ ...movie, isComingSoon: true }))}
          className="mt-8 pb-[100px]"
        />


      </div>
    </Layout2>
  );
}