"use client";

import Layout from '@/components/layout/Layout';
import HeroBanner from '@/components/home/HeroBanner';
import QuickBookingForm from '@/components/home/QuickBookingForm';
import MovieCarousel from '@/components/movies/MovieCarousel';
import { useState, useEffect } from 'react';
import { MovieProps } from '@/components/movies/MovieCard';
import { getNowShowingMovies, getComingSoonMovies, fallbackNowShowingMovies, fallbackComingSoonMovies } from '@/lib/film';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Fix: Correct image imports - no need for @/public prefix
import bannerImage1 from '../../public/images/banner.png';
import bannerImage2 from '../../public/images/banner2.jpg';
import bannerImage3 from '../../public/images/banner3.jpg';

export default function Home() {
  const [nowShowingMovies, setNowShowingMovies] = useState<MovieProps[]>([]);
  const [comingSoonMovies, setComingSoonMovies] = useState<MovieProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const banners = [
    { id: '1', image: bannerImage1, title: 'Banner 1', link: '/movie1' },
    { id: '2', image: bannerImage2, title: 'Banner 2', link: '/movie2' },
    { id: '3', image: bannerImage3, title: 'Banner 3', link: '/movie3' },
  ];

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        // Sử dụng các hàm từ lib/film.tsx để lấy dữ liệu phim
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

  return (
    <Layout>
      <HeroBanner banners={banners} />

      <div className="container mx-auto px-4">
        <QuickBookingForm />

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                <p>{error}</p>
              </div>
            )}

            <MovieCarousel
              title="PHIM ĐANG CHIẾU"
              movies={nowShowingMovies}
              className="mt-8 mb-12"
            />

            <MovieCarousel
              title="PHIM SẮP CHIẾU"
              movies={comingSoonMovies}
              className="mt-8"
            />
          </>
        )}
      </div>
    </Layout>
  );
}
