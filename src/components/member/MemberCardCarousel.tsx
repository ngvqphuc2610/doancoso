'use client';

import React from 'react';
import MemberCard, { MemberProps } from './MemberCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { SwiperProvider, useSwiper } from '../swiper/SwiperContext';
import SwiperNavigation from '../swiper/SwiperNavigation';
import { memberItems } from '@/lib/member';
import { useTranslation } from 'react-i18next';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface MemberCarouselProps {
  slides?: MemberProps[];
  className?: string;
}

const MemberCarouselInner = ({ slides = memberItems, className = '' }: MemberCarouselProps) => {
  const { t } = useTranslation();
  const { swiperRef, setCurrentSlide, setTotalSlides } = useSwiper();

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentSlide(swiper.activeIndex);
  };

  const onSwiper = (swiper: SwiperType) => {
    swiperRef.current = swiper;
    setTotalSlides(swiper.slides.length);
  };

  return (
    <div className={className}>
      <div className="relative pt-8"
       style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(30, 41, 59, 0.8), rgba(17, 24, 39, 0.9)), url("/images/background_heeder.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <h2 className="text-3xl font-bold text-center text-white mb-10">{t('member.title')}</h2>

        <Swiper
          onSwiper={onSwiper}
          onSlideChange={handleSlideChange}
          modules={[Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          speed={500}
          breakpoints={{
            640: {
              slidesPerView: 1,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 2,
              spaceBetween: 30,
            },
          }}
          navigation={false}
          pagination={false}
          className="member-swiper"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <MemberCard {...slide} />
            </SwiperSlide>
          ))}
        </Swiper>

        <SwiperNavigation showArrows={true} showDots={false} className="mt-4" />
      </div>
    </div>
  );
};

// Wrapper component to provide SwiperContext
const MemberCardCarousel = (props: MemberCarouselProps) => {
  return (
    <SwiperProvider id="member-carousel">
      <MemberCarouselInner {...props} />
    </SwiperProvider>
  );
};

export default MemberCardCarousel;
