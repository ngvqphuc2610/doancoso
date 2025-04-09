'use client';

import React, { useRef, useState } from 'react';
import MovieCard, { MovieProps } from '@/components/movies/MovieCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface MovieCarouselProps {
  title: string;
  movies: MovieProps[];
  className?: string;
}

const MovieCarousel = ({ title, movies, className = '' }: MovieCarouselProps) => {
  const swiperRef = useRef<SwiperType>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handlePrev = () => {
    if (!swiperRef.current) return;
    const targetSlide = Math.max(0, currentSlide - 4);
    swiperRef.current.slideTo(targetSlide);
  };

  const handleNext = () => {
    if (!swiperRef.current) return;
    const targetSlide = Math.min(movies.length - 1, currentSlide + 4);
    swiperRef.current.slideTo(targetSlide);
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentSlide(swiper.activeIndex);
  };

  const onSwiper = (swiper: SwiperType) => {
    swiperRef.current = swiper;
  };

  const goToSlide = (index: number) => {
    if (!swiperRef.current) return;
    swiperRef.current.slideTo(index);
  };

  return (
    <div className={`movie-carousel ${className}`}>
      {title && <h2 className="text-2xl font-bold mb-6 text-center text-white">{title}</h2>}

      <div className="relative">
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
              <div className="hover:scale-[1.02] transition-transform">
                <MovieCard {...movie} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation arrows */}
        {movies.length > 4 && (
          <>
            <Button
              variant="ghost"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-black/30 hover:text-white"
              onClick={handlePrev}
              aria-label="Previous"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-black/30 hover:text-white"
              onClick={handleNext}
              aria-label="Next"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Dots navigation */}
        {movies.length > 4 && (
          <div className="absolute bottom-[-20px] left-0 right-0 z-20 flex justify-center gap-2">
            {Array.from({ length: Math.ceil(movies.length / 4) }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index * 4)}
                className={`w-2 h-2 rounded-full ${
                  Math.floor(currentSlide / 4) === index 
                    ? 'bg-cinestar-yellow' 
                    : 'bg-white bg-opacity-50'
                }`}
                aria-label={`Go to slide group ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="text-center mt-12">
        <Button className="cinestar-button px-6 py-2">
          Xem Thêm
        </Button>
      </div>
    </div>
  );
};

export default MovieCarousel;