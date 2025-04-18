'use client';

import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Grid } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/grid';
import ProductCard from './ProductCard';
import type { Swiper as SwiperType } from 'swiper';
import { ProductProps1, ProductProps2, ProductProps3,ProductProps4, comboProducts, softDrinks, beverages,foodProducts } from '@/lib/product';
import { SwiperProvider, useSwiper } from '../swiper/SwiperContext';
import SwiperNavigation from '../swiper/SwiperNavigation';
import { useTranslation } from 'react-i18next';

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
const ProductCarousel1 = ({ slides = comboProducts, className }: { slides?: ProductProps1[], className?: string }) => (
    <BaseProductCarousel<ProductProps1> slides={slides} className={className} title="COMBO 2 NGĂN" />
);

const ProductCarousel2 = ({ slides = softDrinks, className }: { slides?: ProductProps2[], className?: string }) => (
    <BaseProductCarousel<ProductProps2> slides={slides} className={className} title="NƯỚC NGỌT" />
);

const ProductCarousel3 = ({ slides = beverages, className }: { slides?: ProductProps3[], className?: string }) => (
    <BaseProductCarousel<ProductProps3> slides={slides} className={className} title="NƯỚC SUỐI & NƯỚC ÉP" />
);

const ProductCarousel4 = ({ slides = foodProducts, className }: { slides?: ProductProps4[], className?: string }) => (
    <BaseProductCarousel<ProductProps4> slides={slides} className={className} title="SNACKS - KẸO" />
);


interface ProductGridProps {
    title: string;
    products: ProductProps1[] | ProductProps2[] | ProductProps3[] | ProductProps4[];
    className?: string;
}

const ProductGridInner = ({ title, products, className = '' }: ProductGridProps) => {
    const { t } = useTranslation();
    const { swiperRef } = useSwiper();
    const [quantities, setQuantities] = useState<{ [key: string]: number }>(
        Object.fromEntries(products.map(product => [product.id, product.quantity]))
    );

    const handleIncrease = (productId: string) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: (prev[productId] || 0) + 1
        }));
    };

    const handleDecrease = (productId: string) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: Math.max((prev[productId] || 0) - 1, 0)
        }));
    };

    const calculateRows = (totalProducts: number, slidesPerView: number) => {
        return Math.ceil(totalProducts / slidesPerView);
    };

    return (
        <div className={`product-grid ${className} relative w-full bg-gradient-to-b bg-cinestar-darkblue py-8 `}>
            <h2 className="text-4xl font-bold text-white mb-8 text-center">{title}</h2>

            <Swiper
                modules={[Navigation, Grid]}
                spaceBetween={20}
                slidesPerView={3}
                grid={{
                    rows: calculateRows(products.length, 3),
                    fill: 'row'
                }}
                breakpoints={{
                    320: {
                        slidesPerView: 1,
                        grid: { rows: calculateRows(products.length, 1), fill: 'row' }
                    },
                    640: {
                        slidesPerView: 1,
                        grid: { rows: calculateRows(products.length, 1), fill: 'row' }
                    },
                    768: {
                        slidesPerView: 2,
                        grid: { rows: calculateRows(products.length, 2), fill: 'row' }
                    },
                    1024: {
                        slidesPerView: 3,
                        grid: { rows: calculateRows(products.length, 3), fill: 'row' }
                    }
                }}
                navigation={false}
                className="product-swiper"
            >
                {products.map((product) => (
                    <SwiperSlide key={product.id}>
                       
                        <ProductCard
                            {...product}
                            quantity={quantities[product.id] || 0}
                            onIncrease={() => handleIncrease(product.id)}
                            onDecrease={() => handleDecrease(product.id)}
                        />
                        
                    </SwiperSlide>
                ))}
            </Swiper>

            <SwiperNavigation showArrows={true} showDots={false} className="mt-4" />
        </div>
    );
};

// Wrapper component to provide SwiperContext
const ProductGrid = (props: ProductGridProps) => {
    return (
        <SwiperProvider id="product-grid">
            <ProductGridInner {...props} />
        </SwiperProvider>
    );
};

// Create specific components for each product category
export const ComboGrid = ({ className }: { className?: string }) => (
    <ProductGrid
        title="COMBO 2 NGĂN"
        products={comboProducts}
        className={className}
    />
);

export const SoftDrinksGrid = ({ className }: { className?: string }) => (
    <ProductGrid
        title="NƯỚC NGỌT"
        products={softDrinks}
        className={className}
    />
);

export const BeveragesGrid = ({ className }: { className?: string }) => (
    <ProductGrid
        title="NƯỚC SUỐI & NƯỚC ÉP"
        products={beverages}
        className={className}
    />
);

export const FoodProductsGrid = ({ className }: { className?: string }) => (
    <ProductGrid
        title="SNACKS - KẸO"
        products={foodProducts}
        className={className}
    />
);

export { ProductCarousel1, ProductCarousel2, ProductCarousel3, ProductCarousel4 };