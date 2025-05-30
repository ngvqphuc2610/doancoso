'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import type { SwiperRef } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

interface Banner {
    id: string;
    image: StaticImageData | string; // Hỗ trợ cả StaticImageData và string URL
    title: string;
    link: string;
    isBanner?: boolean; // Flag để biết có phải banner thật không
}

interface CarouselProps {
    banners: Banner[];
}

const Carousel = ({ banners }: CarouselProps) => {
    const swiperRef = useRef<SwiperRef>(null);

    const handlePrev = () => {
        swiperRef.current?.swiper?.slidePrev();
    };

    const handleNext = () => {
        swiperRef.current?.swiper?.slideNext();
    };

    return (
        <div className="relative h-[200px] sm:h-[300px] md:h-[400px] lg:h-[400px] overflow-hidden">
            {/* Custom navigation buttons */}
            <button
                onClick={handlePrev}
                className="absolute left-5 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
            >
                <IoIosArrowBack size={24} />
            </button>

            <button
                onClick={handleNext}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
            >
                <IoIosArrowForward size={24} />
            </button>

            <Swiper
                ref={swiperRef}
                spaceBetween={0}
                centeredSlides={true}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                }}
                navigation={false}
                modules={[Navigation, Pagination, Autoplay]}
                effect="fade"  // Chỉnh hiệu ứng chuyển slide thành fade
                speed={750}   // Chỉnh tốc độ chuyển slide (1s)
                className="mySwiper w-[1200px] h-[361px]"
            >
                {banners.map((banner, index) => (
                    <SwiperSlide key={banner.id}>
                        <div className="w-[1200px] h-[361px] relative overflow-hidden">
                            {banner.isBanner ? (
                                // Hiển thị banner image (ngang) bình thường
                                <Image
                                    src={banner.image}
                                    alt={banner.title}
                                    fill
                                    className='object-cover'
                                    priority={index === 0}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/images/movie-placeholder.svg';
                                    }}
                                />
                            ) : (
                                // Hiển thị poster (dọc) với blur background effect
                                <>
                                    {/* Blurred background */}
                                    <div
                                        className="absolute inset-0 w-full h-full"
                                        style={{
                                            backgroundImage: `url(${banner.image})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                            filter: 'blur(8px)',
                                            transform: 'scale(1.1)'
                                        }}
                                    />
                                    {/* Poster overlay */}
                                    <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
                                        <Image
                                            src={banner.image}
                                            alt={banner.title}
                                            width={200}
                                            height={300}
                                            className='object-cover rounded-lg shadow-2xl'
                                            priority={index === 0}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/images/movie-placeholder.svg';
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Overlay gradient for better text readability */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>

                            {/* Movie title overlay */}
                            <div className={`absolute z-20 ${banner.isBanner ? 'left-4 sm:left-8 bottom-16 sm:bottom-20' : 'left-64 top-1/2 transform -translate-y-1/2'}`}>
                                
                                {!banner.isBanner && (
                                    <p className="text-white/80 text-sm sm:text-base max-w-md">
                                        Khám phá bộ phim đầy hấp dẫn này
                                    </p>
                                )}
                            </div>

                            {/* Book ticket button */}
                            <div className="absolute right-4 sm:right-8 md:right-[100px] bottom-4 sm:bottom-[10px] z-20 w-[200px] sm:w-[260px] h-[40px] sm:h-[45px]">
                                <Link href={banner.link} className="cinestar-button-to font-bold text-xs sm:text-sm md:text-base button-datve">
                                    ĐẶT VÉ NGAY
                                </Link>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Carousel;