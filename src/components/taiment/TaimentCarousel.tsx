'use client';

import React, { useState, useEffect } from 'react';
import TaimentCard, { TaimentProps } from '@/components/taiment/TaimentCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination, Grid } from 'swiper/modules';
import { SwiperProvider, useSwiper } from '../swiper/SwiperContext';
import SwiperNavigation from '@/components/swiper/SwiperNavigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { getAllEntertainments, fallbackTaimentItems } from '@/lib/taiment';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/grid';

interface TaimentCarouselProps {
    title?: string;
    taiment?: TaimentProps[];
    className?: string;
    showNavigation?: boolean;
    id?: string;
}

const TaimentCarouselInner = ({
    title = "TẤT CẢ CÁC GIẢI TRÍ",
    taiment,
    className = '',
    showNavigation = true
}: TaimentCarouselProps) => {
    const { t } = useTranslation();
    const { swiperRef, setCurrentSlide, setTotalSlides } = useSwiper();
    const [entertainments, setEntertainments] = useState<TaimentProps[]>(taiment || []);
    const [loading, setLoading] = useState(!taiment);

    useEffect(() => {
        if (!taiment) {
            const fetchEntertainments = async () => {
                setLoading(true);
                try {
                    const data = await getAllEntertainments();
                    setEntertainments(data);
                } catch (error) {
                    console.error('Error fetching entertainments:', error);
                    setEntertainments(fallbackTaimentItems);
                } finally {
                    setLoading(false);
                }
            };
            fetchEntertainments();
        }
    }, [taiment]);

    if (loading) {
        return (
            <div className={`py-8 ${className}`}>
                <h2 className="text-4xl font-bold mb-6 text-center text-[#464545]">{t('taiment.title')}</h2>
                <div className="flex justify-center items-center h-[300px]">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (!entertainments || entertainments.length === 0) {
        return (
            <div className={`py-8 ${className}`}>
                <h2 className="text-4xl font-bold mb-6 text-center text-[#464545]">{t('taiment.title')}</h2>
                <div className="flex justify-center items-center h-[300px]">
                    <p className="text-gray-500">Không có dữ liệu giải trí</p>
                </div>
            </div>
        );
    }

    const handleSlideChange = (swiper: SwiperType) => {
        setCurrentSlide(swiper.activeIndex);
    };

    const onSwiper = (swiper: SwiperType) => {
        swiperRef.current = swiper;
        const slidesPerView = swiper.params.slidesPerView as number;
        const totalSlides = Math.ceil(entertainments.length / (slidesPerView * 2)); // 2 rows
        setTotalSlides(totalSlides);
    };

    return (
        <div className={`taiment-carousel ${className}`}>
            {title && <h1 className="text-3xl font-bold mb-6 text-center text-white">{t('taiment.title')}</h1>}
            <p className="text-center mb-6">{t('taiment.subtitle')}</p>

            {showNavigation && <SwiperNavigation showArrows={true} showDots={false} className="mb-4" />}

            <Swiper
                onSwiper={onSwiper}
                onSlideChange={handleSlideChange}
                modules={[Navigation, Pagination, Grid]}
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
                {entertainments.map((item) => (
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