'use client';

import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Swiper as SwiperType } from 'swiper';
import { useTranslation } from 'react-i18next';
import { promotions, type PromotionProps } from '@/lib/promotions';
import ProCard from './ProCard';

interface PromotionCarouselProps {
  slides?: PromotionProps[];
  className?: string;
}

const ProCarousel = ({ slides = promotions, className = '' }: PromotionCarouselProps) => {
  const { t } = useTranslation();
  const swiperRef = useRef<SwiperType>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handlePrev = () => {
    if (!swiperRef.current) return;
    const targetSlide = Math.max(0, currentSlide - 1);
    swiperRef.current.slideTo(targetSlide);
  };

  const handleNext = () => {
    if (!swiperRef.current) return;
    const targetSlide = Math.min(slides.length - 1, currentSlide + 1);
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
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('discount.title')}</h2>
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
              {...slide}
              variant="card1"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="text-center mt-8">
        <Link href="/chuong-trinh-khuyen-mai">
          <Button variant="custom7"
            size="custom7"
            width="custom7"
            className="md:text-base ">
            {t('discount.button')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProCarousel;