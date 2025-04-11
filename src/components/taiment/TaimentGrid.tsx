'use client';

import React from 'react';
import TaimentCard, { TaimentProps, taimentItems } from '@/components/taiment/TaimentCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination, Grid } from 'swiper/modules'; // Thêm Grid module
import { Button } from '@/components/ui/button';
import { SwiperProvider, useSwiper } from '../swiper/SwiperContext';
import SwiperNavigation from '@/components/swiper/SwiperNavigation';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/grid'; // Thêm CSS cho Grid

interface TaimentCarouselProps {
    title?: string;
    taiment?: TaimentProps[];
    className?: string;
    showNavigation?: boolean;
    id?: string;
}

const TaimentCarouselInner = ({
    title = "TẤT CẢ CÁC GIẢI TRÍ",
    taiment = taimentItems,
    className = '',
    showNavigation = true
}: TaimentCarouselProps) => {
    const { swiperRef, setCurrentSlide, setTotalSlides } = useSwiper();

    const handleSlideChange = (swiper: SwiperType) => {
        setCurrentSlide(swiper.activeIndex);
    };

    const onSwiper = (swiper: SwiperType) => {
        swiperRef.current = swiper;
        // Tính số lượng slides dựa trên số hàng và số cột
        const slidesPerView = swiper.params.slidesPerView as number;
        const slidesPerGroup = swiper.params.slidesPerGroup as number;
        const totalSlides = Math.ceil(taiment.length / (slidesPerView * 2)); // 2 hàng
        setTotalSlides(totalSlides);
    };

    return (
        <div className={`taiment-carousel ${className}`}>
            {title && <h1 className="text-3xl font-bold mb-6 text-center text-white">{title}</h1>}
            <p className="text-center mb-6">Ngoài hệ thống rạp chiếu phim chất lượng cao, Cinestar còn cung cấp cho bạn nhiều loại <br />
                 hình giải trí tuyệt vời khác.</p>

            {showNavigation && <SwiperNavigation showArrows={true} showDots={false} className="mb-4" />}

            <Swiper
                onSwiper={onSwiper}
                onSlideChange={handleSlideChange}
                modules={[Navigation, Pagination, Grid]} // Thêm Grid module
                spaceBetween={20}
                slidesPerView={3}
                slidesPerGroup={3}
                grid={{
                    rows: 2,
                    fill: 'row'
                }}
                speed={500}
                watchSlidesProgress={true}
                breakpoints={{
                    320: {
                        slidesPerView: 1,
                        grid: { rows: 2, fill: 'row' },
                        spaceBetween: 16
                    },
                    640: {
                        slidesPerView: 2,
                        grid: { rows: 2, fill: 'row' },
                        spaceBetween: 20
                    },
                    768: {
                        slidesPerView: 2,
                        grid: { rows: 2, fill: 'row' },
                        spaceBetween: 20
                    },
                    1024: {
                        slidesPerView: 3,
                        grid: { rows: 2, fill: 'row' },
                        spaceBetween: 24
                    },
                }}
                navigation={false}
                pagination={false}
                className="grid-swiper"
            >
                {taiment.map((item) => (
                    <SwiperSlide key={item.id} className="pb-1">
                        <TaimentCard {...item} />
                    </SwiperSlide>
                ))}
            </Swiper>

            {showNavigation && <SwiperNavigation showArrows={false} showDots={true} className="mt-4" />}

        
        </div>
    );
};

// Wrapper component to provide SwiperContext
const TaimentCarousel = (props: TaimentCarouselProps) => {
    return (
        <SwiperProvider id={props.id || "taiment-carousel"}>
            <TaimentCarouselInner {...props} />
        </SwiperProvider>
    );
};

export default TaimentCarousel;