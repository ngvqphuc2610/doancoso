'use client';

import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Button } from '@/components/ui/button';
import MemberCard, { promotions as memberCards, MemberProps } from './MemberCard';
import Link from 'next/link';
import type { Swiper as SwiperType } from 'swiper';
import { useTranslation } from 'react-i18next';
interface MemberCarouselProps {
  slides?: MemberProps[];
  className?: string;
}

const MemberCardCarousel = ({ slides = memberCards }: MemberCarouselProps) => {
  const { t } = useTranslation();
  const swiperRef = useRef<SwiperType>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentSlide(swiper.activeIndex);
  };

  const onSwiper = (swiper: SwiperType) => {
    swiperRef.current = swiper;
  };

  return (
    <div className="relative w-full text-center py-8"
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(30, 41, 59, 0.8), rgba(17, 24, 39, 0.9)), url("/images/background_heeder.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('member.title')}</h2>
      {/* Luôn hiển thị navigation nếu có nhiều hơn 4 phim */}
      {/* Navigation is not implemented yet, placeholder removed */}
      <Swiper
        modules={[Navigation]}
        spaceBetween={33}
        slidesPerView={2}
        navigation
        onSlideChange={handleSlideChange}
        onSwiper={onSwiper}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 16 },
          640: { slidesPerView: 2, spaceBetween: 20 },
        }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <MemberCard
              id={slide.id}
              title={slide.title}
              image={slide.image}
              link={slide.link}
              description={slide.description}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="text-center mt-8">
        <Link href="/membership">

        </Link>
      </div>
    </div>
  );
};
export default MemberCardCarousel;
