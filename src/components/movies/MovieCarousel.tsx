'use client';

import React from 'react';
import MovieCard, { MovieProps } from '@/components/movies/MovieCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { Button } from '@/components/ui/button';
import { SwiperProvider, useSwiper } from '../swiper/SwiperContext';
import SwiperNavigation from '../swiper/SwiperNavigation';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface MovieCarouselProps {
  title: string;
  movies: MovieProps[];
  className?: string;
  showNavigation?: boolean;
  id?: string;
}

const MovieCarouselInner = ({ title, movies, className = '', showNavigation = true }: MovieCarouselProps) => {
  const { swiperRef, setCurrentSlide, setTotalSlides } = useSwiper();

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentSlide(swiper.activeIndex);
  };

  const onSwiper = (swiper: SwiperType) => {
    swiperRef.current = swiper;
    setTotalSlides(movies.length);
  };

  return (
    <div className={`movie-carousel ${className}`}>
      {title && <h2 className="text-4xl font-bold mb-6 text-center text-white">{title}</h2>}

      {/* Show navigation buttons above Swiper */}
      {showNavigation && <SwiperNavigation showArrows={true} showDots={false} className="mb-4" />}

      <Swiper
        onSwiper={onSwiper}
        onSlideChange={handleSlideChange}
        modules={[Navigation, Pagination]}
        spaceBetween={24}
        slidesPerView={4}
        slidesPerGroup={1}
        speed={500}
        watchSlidesProgress={true}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 16 },
          640: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 24 },
        }}
        navigation={false}
        pagination={false}
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id}>
            <div className="hover:text-[#EBDB40] transition-transform">
              <MovieCard {...movie} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Show dots below Swiper */}
      {showNavigation && <SwiperNavigation showArrows={false} showDots={true} className="mt-4" />}

      <div className="text-center mt-12">
        <Button variant={"default"} width={"full"} className="cinestar-button px-6 py-2">
          Xem Thêm
        </Button>
      </div>
    </div>
  );
};

// Wrapper component to provide SwiperContext
const MovieCarousel = (props: MovieCarouselProps) => {
  return (
    <SwiperProvider id={props.id || props.title}>
      <MovieCarouselInner {...props} />
    </SwiperProvider>
  );
};

export default MovieCarousel;