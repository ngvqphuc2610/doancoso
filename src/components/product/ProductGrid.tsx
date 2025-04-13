'use client';

import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ProductCard from './ProductCard';
import type { Swiper as SwiperType } from 'swiper';
import { ProductProps1, ProductProps2, ProductProps3, promotions, promotions2, promotions3 } from './ProductData';

// Make BaseProductCarouselProps generic to accept any of the three ProductProps types
interface BaseProductCarouselProps<T extends ProductProps1 | ProductProps2 | ProductProps3> {
    slides: T[];
    className?: string;
    title: string;
}

const BaseProductCarousel = <T extends ProductProps1 | ProductProps2 | ProductProps3>({
    slides,
    className = '',
    title
}: BaseProductCarouselProps<T>) => {
    const swiperRef = useRef<SwiperType>();
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleSlideChange = (swiper: SwiperType) => {
        setCurrentSlide(swiper.activeIndex);
    };

    const onSwiper = (swiper: SwiperType) => {
        swiperRef.current = swiper;
    };

    return (
        <div className={`relative w-full bg-gradient-to-b bg-cinestar-darkblue py-8 ${className}`}>
            <h2 className="text-4xl font-bold text-white text-center mb-8">{title}</h2>
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
                        <ProductCard {...slide} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

// Type the individual carousels with their specific ProductProps
const ProductCarousel1 = ({ slides = promotions, className }: { slides?: ProductProps1[], className?: string }) => (
    <BaseProductCarousel<ProductProps1> slides={slides} className={className} title="COMBO 2 NGĂN" />
);

const ProductCarousel2 = ({ slides = promotions2, className }: { slides?: ProductProps2[], className?: string }) => (
    <BaseProductCarousel<ProductProps2> slides={slides} className={className} title="NƯỚC NGỌT" />
);

const ProductCarousel3 = ({ slides = promotions3, className }: { slides?: ProductProps3[], className?: string }) => (
    <BaseProductCarousel<ProductProps3> slides={slides} className={className} title="NƯỚC SUỐI & NƯỚC ÉP" />
);

export { ProductCarousel1, ProductCarousel2, ProductCarousel3 };