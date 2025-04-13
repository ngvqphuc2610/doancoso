"use client";

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import MovieCarousel from '@/components/movies/MovieCarousel';
import { MovieProps } from '@/components/movies/MovieCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getNowShowingMovies, getComingSoonMovies, fallbackNowShowingMovies, fallbackComingSoonMovies } from '@/lib/film';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import QuickBookingForm from '@/components/home/QuickBookingForm';
export default function MoviePage() {
  const { t } = useTranslation();
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
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-0 py-8">
        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        <QuickBookingForm  />


        <MovieCarousel
          title={t('movie.nowShowing')}
          movies={nowShowingMovies.map(movie => ({ ...movie, isComingSoon: false }))}
          className="mt-8 pb-[100px]"
        />

        <MovieCarousel
          title={t('movie.comingSoon')}
          movies={comingSoonMovies.map(movie => ({ ...movie, isComingSoon: true }))}
          className="mt-8 pb-[100px]"
        />


      </div>
    </Layout>
  );
}