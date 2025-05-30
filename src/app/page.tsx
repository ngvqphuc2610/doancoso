"use client";

import Layout from '@/components/layout/Layout';
import HeroBanner from '@/components/home/HeroBanner';
import QuickBookingForm from '@/components/home/QuickBookingForm';
import MovieCarousel from '@/components/movies/MovieCarousel';
import { useState, useEffect } from 'react';
import { MovieProps } from '@/components/movies/MovieCard';
import { getNowShowingMovies, getComingSoonMovies } from '@/lib/film';
import ProCarousel from '../components/promotions/ProCarousel';
import MemberCardCarousel from '../components/member/MemberCardCarousel';
import TaimentCarousel from '@/components/taiment/TaimentCarousel';
import ContactPage from '../components/contact/ContactPage';
import { useTranslation } from 'react-i18next';
import bannerImage1 from '../../public/images/banner.png';
import bannerImage2 from '../../public/images/banner2.jpg';
import { BannerItem } from '@/components/home/HeroBanner';


export default function Home() {
  const { t } = useTranslation();
  const [nowShowingMovies, setNowShowingMovies] = useState<MovieProps[]>([]);
  const [comingSoonMovies, setComingSoonMovies] = useState<MovieProps[]>([]);
  const [managedBanners, setManagedBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Tạo banners từ movies với ưu tiên banner_image
  const createBannersFromMovies = (movies: MovieProps[]): BannerItem[] => {
    if (movies.length === 0) {
      return [];
    }

    // Ưu tiên movies có banner_image, sau đó poster
    const moviesWithImages = movies.filter(movie => {
      const hasBanner = movie.banner_image &&
        movie.banner_image !== '/images/movie-placeholder.jpg' &&
        movie.banner_image !== '/images/movie-placeholder.svg' &&
        !movie.banner_image.includes('placeholder');

      const hasPoster = movie.poster &&
        movie.poster !== '/images/movie-placeholder.jpg' &&
        movie.poster !== '/images/movie-placeholder.svg' &&
        !movie.poster.includes('placeholder');

      return hasBanner || hasPoster;
    });

    // Nếu không có movies với images, sử dụng tất cả movies
    const selectedMovies = moviesWithImages.length > 0
      ? moviesWithImages.slice(0, 5)
      : movies.slice(0, 5);

    const movieBanners = selectedMovies.map((movie, index) => {
      // Ưu tiên banner_image, fallback về poster
      let imageUrl = movie.banner_image || movie.poster;

      // Nếu không có cả banner_image và poster, sử dụng ảnh mặc định
      

      return {
        id: movie.id,
        image: imageUrl,
        title: movie.title,
        link: `/movie/${movie.id}`,
        isBanner: !!movie.banner_image // Flag để biết có phải banner thật không
      };
    });

   

    return movieBanners;
  };

  // Tạo banners với ưu tiên: managed banners > movie banners > fallback
  const getBanners = (): BannerItem[] => {
    console.log('🎬 getBanners called:', {
      loading,
      managedBannersLength: managedBanners.length,
      nowShowingMoviesLength: nowShowingMovies.length
    });

    if (loading) {
      console.log('⏳ Still loading, using fallback banners');
      return [];
    }

    // Ưu tiên managed banners từ admin
    if (managedBanners.length > 0) {
      console.log('✅ Using managed banners:', managedBanners);
      return managedBanners;
    }

    // Fallback về auto-generated banners từ movies
    console.log('🎭 Using auto-generated banners from movies');
    return createBannersFromMovies(nowShowingMovies);
  };

  const banners = getBanners();
  console.log('🎯 Final banners for display:', banners);



  // Fetch managed banners từ admin
  const fetchManagedBanners = async (): Promise<BannerItem[]> => {
    try {
      console.log('🔍 Fetching managed banners...');
      const response = await fetch('/api/admin/banners?active=true');
      const data = await response.json();

      console.log('📊 API Response:', data);

      if (data.success && data.data.length > 0) {
        const banners = data.data.map((banner: any) => ({
          id: banner.id_banner.toString(),
          image: banner.movie_banner || banner.movie_poster || '/images/movie-placeholder.jpg',
          title: banner.title,
          link: `/movie/${banner.id_movie}`,
          isBanner: !!banner.movie_banner
        }));

        console.log('🎯 Processed banners:', banners);
        return banners;
      }

      console.log('⚠️ No active banners found');
      return [];
    } catch (error) {
      console.error('❌ Error fetching managed banners:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [nowPlayingMovies, upcomingMovies, banners] = await Promise.all([
          getNowShowingMovies(),
          getComingSoonMovies(),
          fetchManagedBanners()
        ]);

        setNowShowingMovies(nowPlayingMovies);
        setComingSoonMovies(upcomingMovies);
        setManagedBanners(banners);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <HeroBanner banners={banners} />
      <div className="container mx-auto px-0 sm:px-0">
        <QuickBookingForm />
        {error && (
          <div className=" bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6 text-sm sm:text-base">
            <p>{error}</p>
          </div>
        )}
        {!loading && (
          <>
            <MovieCarousel
              title={t('movie.nowShowing')}
              movies={nowShowingMovies.map(movie => ({ ...movie, isComingSoon: false }))}
              className="mt-6 sm:mt-8 pb-16 sm:pb-24 lg:pb-[100px]"
            />
            <MovieCarousel
              title={t('movie.comingSoon')}
              movies={comingSoonMovies.map(movie => ({ ...movie, isComingSoon: true }))}
              className="mt-6 sm:mt-8 pb-16 sm:pb-24 lg:pb-[100px]"
            />
            <ProCarousel className="pb-16 sm:pb-24 lg:pb-[100px]" />
            <MemberCardCarousel className="" />
            <TaimentCarousel className="pt-16 sm:pt-24 lg:pt-[120px]" />
            <ContactPage />
          </>
        )}
      </div>
    </Layout>
  );
}
