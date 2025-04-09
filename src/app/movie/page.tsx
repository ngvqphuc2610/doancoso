"use client";

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
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
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">PHIM TẠI CINESTAR</h1>

        <Tabs defaultValue="now-showing" className="w-full">
          <TabsList className="w-full mb-8 bg-cinestar-darkblue">
            <TabsTrigger
              value="now-showing"
              className="flex-1 py-3 text-base data-[state=active]:bg-cinestar-yellow data-[state=active]:text-cinestar-darkblue data-[state=active]:font-bold"
            >
              PHIM ĐANG CHIẾU
            </TabsTrigger>
            <TabsTrigger
              value="coming-soon"
              className="flex-1 py-3 text-base data-[state=active]:bg-cinestar-yellow data-[state=active]:text-cinestar-darkblue data-[state=active]:font-bold"
            >
              PHIM SẮP CHIẾU
            </TabsTrigger>
          </TabsList>

          <TabsContent value="now-showing">
            <MovieCarousel title="" movies={nowShowingMovies} />
          </TabsContent>

          <TabsContent value="coming-soon">
            <MovieCarousel title="" movies={comingSoonMovies} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}