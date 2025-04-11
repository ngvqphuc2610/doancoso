'use client';

import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Button } from '@/components/ui/button';
import ProCard, { promotions, PromotionProps } from './ProCard';
import Link from 'next/link';
import type { Swiper as SwiperType } from 'swiper';

interface PromotionCarouselProps {
  slides?: PromotionProps[];
  className?: string;
}

const ProCarousel = ({ slides = promotions, className = '' }: PromotionCarouselProps) => {
  const swiperRef = useRef<SwiperType>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handlePrev = () => {
    if (!swiperRef.current) return;
    const targetSlide = Math.max();
    swiperRef.current.slideTo(targetSlide);
  };

  const handleNext = () => {
    if (!swiperRef.current) return;
    const targetSlide = Math.min();
    swiperRef.current.slideTo(targetSlide);
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentSlide(swiper.activeIndex);
  };

  const onSwiper = (swiper: SwiperType) => {
    swiperRef.current = swiper;
  };

  return (
    <div className={`relative w-full bg-gradient-to-b bg-cinestar-darkblue py-8 ${className}`}>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">KHUYẾN MÃI</h2>
      <Swiper
        modules={[Navigation]}
        spaceBetween={24}
        slidesPerView={3}
        navigation
        onSlideChange={handleSlideChange}
        onSwiper={onSwiper}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 16 },
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 24 },
        }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <ProCard
              id={slide.id}
              title={slide.title}
              image={slide.image}
              link={slide.link}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="text-center mt-8">
        <Link href="/promotions">
          <button className="cinestar-button-to font-bold text-sm md:text-base">
            TẤT CẢ ƯU ĐÃI
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ProCarousel;