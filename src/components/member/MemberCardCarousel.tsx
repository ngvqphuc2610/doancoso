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

interface MemberCarouselProps {
    slides?: MemberProps[];
}

const MemberCardCarousel = ({ slides = memberCards }: MemberCarouselProps) => {
    const swiperRef = useRef<SwiperType>();
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleSlideChange = (swiper: SwiperType) => {
        setCurrentSlide(swiper.activeIndex);
    };

    const onSwiper = (swiper: SwiperType) => {
        swiperRef.current = swiper;
    };

    return (
        <div className="relative w-full text-center bg-[url('/images/background_heeder.webp')] bg-cover bg-center py-8 bg-gradient-to-b from-blue-900 to-blue-800 py-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6"> CHƯƠNG TRÌNH THÀNH VIÊN</h2>
            <Swiper
                modules={[Navigation]}
                spaceBetween={24}
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
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
            <div className="text-center mt-8">
                <Link href="/member">
                    <button type="button" className="cinestar-button-to font-bold text-sm md:text-base">
                        TẤT CẢ THÀNH VIÊN
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default MemberCardCarousel;
