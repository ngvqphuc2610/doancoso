'use client';

import React, { useState, useEffect } from 'react';
import { MembershipCard, MembershipProps } from './MembershipCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { SwiperProvider, useSwiper } from '../swiper/SwiperContext';
import SwiperNavigation from '../swiper/SwiperNavigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTranslation } from 'react-i18next';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface MembershipCarouselProps {
    memberships?: MembershipProps[];
    className?: string;
    id?: string;
    onMembershipPage?: boolean;
}

const MembershipCarouselInner = ({ memberships, className = '', onMembershipPage = false }: MembershipCarouselProps) => {
    const { t } = useTranslation();
    const { swiperRef, setCurrentSlide, setTotalSlides } = useSwiper();
    const [membershipData, setMembershipData] = useState<MembershipProps[]>(memberships || []);
    const [loading, setLoading] = useState(!memberships);

    useEffect(() => {
        if (!memberships) {
            const fetchMemberships = async () => {
                setLoading(true);
                try {
                    const response = await fetch('/api/membership');
                    const data = await response.json();

                    if (data.success && data.data) {
                        const convertedData = data.data.map((membership: any) => ({
                            id: membership.id_membership.toString(),
                            title: membership.title,
                            image: membership.image || '/images/membership-default.jpg',
                            description: membership.description || '',
                            benefits: membership.benefits || '',
                            criteria: membership.criteria || '',
                            code: membership.code,
                            link: membership.link
                        }));
                        setMembershipData(convertedData);
                    }
                } catch (error) {
                    console.error('Error fetching memberships:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchMemberships();
        }
    }, [memberships]);

    const handleSlideChange = (swiper: SwiperType) => {
        setCurrentSlide(swiper.activeIndex);
    };

    const onSwiper = (swiper: SwiperType) => {
        swiperRef.current = swiper;
        setTotalSlides(swiper.slides.length);
    };

    if (loading) {
        return (
            <div className={`py-8 ${className}`}>
                <h2 className="text-3xl font-bold text-center text-white mb-10">{t('member.title')}</h2>
                <div className="flex justify-center items-center h-[300px]">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (!membershipData || membershipData.length === 0) {
        return (
            <div className={`py-8 ${className}`}>
                <h2 className="text-3xl font-bold text-center text-white mb-10">{t('member.title')}</h2>
                <div className="flex justify-center items-center h-[300px]">
                    <p className="text-gray-400">Không có dữ liệu gói thành viên</p>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="relative pt-8"
                style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(30, 41, 59, 0.8), rgba(17, 24, 39, 0.9)), url("/images/background_heeder.webp")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
                <h2 className="text-3xl font-bold text-center text-white mb-10">{t('member.title')}</h2>

                {/* Bọc Swiper trong một container với chiều rộng cố định và căn giữa */}
                <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
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
                        {membershipData.map((membership) => (
                            <SwiperSlide key={membership.id} className="flex justify-center">
                                <div className="w-full max-w-[586px]">
                                    <MembershipCard {...membership} onMembershipPage={onMembershipPage} />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <SwiperNavigation showArrows={true} showDots={false} className="mt-4" />
            </div>
        </div>
    );
};

// Wrapper component to provide SwiperContext
const MembershipCarousel = (props: MembershipCarouselProps) => {
    return (
        <SwiperProvider id={props.id || "member-carousel"}>
            <MembershipCarouselInner {...props} />
        </SwiperProvider>
    );
};

export default MembershipCarousel;