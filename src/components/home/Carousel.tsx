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
    image: StaticImageData;
    title: string;
    link: string;
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
                modules={[Navigation]}
                effect="fade"  // Chỉnh hiệu ứng chuyển slide thành fade
                speed={750}   // Chỉnh tốc độ chuyển slide (1s)
                className="mySwiper w-1200 h-361"
            >
                {banners.map((banner, index) => (
                    <SwiperSlide key={banner.id}>
                        <div className="w-1200 h-361 flex justify-center items-center relative">
                            <Image
                                src={banner.image}
                                alt={banner.title}
                                width={1200}
                                height={361}
                                className='object-contain'
                                priority={index === 0}
                            />
                            <div className="absolute right-[100px] bottom-[10px] z-20 w-[260px] h-[45px] ">
                                <Link href={banner.link} className="cinestar-button-to font-bold text-sm md:text-base button-datve">
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