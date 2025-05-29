'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Grid } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { useTranslation } from 'react-i18next';

// Import styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/grid';

// Import components and utils
import ProductCard from './ProductCard';
import { SwiperProvider, useSwiper } from '../swiper/SwiperContext';
import SwiperNavigation from '../swiper/SwiperNavigation';

// Import product types and functions
import { getProductsByType } from '@/lib/productDb';
import { Product } from '@/lib/types/database';

interface BaseProductCarouselProps {
    slides: Product[];
    className?: string;
    title: string;
    image?: string;
}

const BaseProductCarousel = ({
    slides,
    className = '',
    title
}: BaseProductCarouselProps) => {
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
                {slides.map((slide) => (<SwiperSlide key={slide.id_product}>
                    <ProductCard
                        id={slide.id_product.toString()}
                        title={slide.product_name}
                        image={slide.image || '/images/product/default-product.png'}
                        price={new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }).format(slide.price)}
                        description={slide.description || ''}
                        quantity={0}
                    />
                </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

interface ProductGridProps {
    title: string;
    products: Product[];
    className?: string;
    onQuantityChange?: (productId: string, quantity: number, price: number, productName?: string) => void;
    resetQuantities?: boolean;
}

const ProductGridInner = ({ title, products, className = '', onQuantityChange, resetQuantities }: ProductGridProps) => {
    const [quantities, setQuantities] = useState<{ [key: string]: number }>(
        Object.fromEntries(products.map(product => [product.id_product.toString(), 0]))
    );
    const [pendingCallbacks, setPendingCallbacks] = useState<Array<{ productId: string, quantity: number, price: number, productName?: string }>>([]);

    // Use ref to store the latest callback to avoid dependency issues
    const onQuantityChangeRef = useRef(onQuantityChange);
    onQuantityChangeRef.current = onQuantityChange;

    // Load saved quantities from localStorage on mount
    useEffect(() => {
        if (resetQuantities) {
            // Clear localStorage and reset quantities
            localStorage.removeItem('cartQuantities');
            setQuantities(Object.fromEntries(products.map(product => [product.id_product.toString(), 0])));
        } else {
            const savedQuantities = localStorage.getItem('cartQuantities');
            if (savedQuantities) {
                const parsed = JSON.parse(savedQuantities);
                setQuantities(prev => ({
                    ...prev,
                    ...parsed
                }));
            }
        }
    }, [resetQuantities, products]);

    // Handle pending callbacks after render
    useEffect(() => {
        if (pendingCallbacks.length > 0 && onQuantityChangeRef.current) {
            pendingCallbacks.forEach(({ productId, quantity, price, productName }) => {
                onQuantityChangeRef.current?.(productId, quantity, price, productName);
            });
            setPendingCallbacks([]);
        }
    }, [pendingCallbacks]);

    // Don't auto-sync from localStorage to avoid render conflicts
    // Let the parent component manage its own state initialization

    const handleIncrease = (productId: string) => {
        setQuantities(prev => {
            const newQuantity = (prev[productId] || 0) + 1;
            const newQuantities = {
                ...prev,
                [productId]: newQuantity
            };
            localStorage.setItem('cartQuantities', JSON.stringify(newQuantities));

            // Queue callback to be executed after render
            const product = products.find(p => p.id_product.toString() === productId);
            if (product) {
                setPendingCallbacks(current => [...current, {
                    productId,
                    quantity: newQuantity,
                    price: product.price,
                    productName: product.product_name
                }]);
            }

            return newQuantities;
        });
    };

    const handleDecrease = (productId: string) => {
        setQuantities(prev => {
            const newQuantity = Math.max((prev[productId] || 0) - 1, 0);
            const newQuantities = {
                ...prev,
                [productId]: newQuantity
            };
            localStorage.setItem('cartQuantities', JSON.stringify(newQuantities));

            // Queue callback to be executed after render
            const product = products.find(p => p.id_product.toString() === productId);
            if (product) {
                setPendingCallbacks(current => [...current, {
                    productId,
                    quantity: newQuantity,
                    price: product.price,
                    productName: product.product_name
                }]);
            }

            return newQuantities;
        });
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
                {products.map((product) => (<SwiperSlide key={product.id_product}>
                    <ProductCard
                        id={product.id_product.toString()}
                        title={product.product_name}
                        image={product.image || '/images/product/default-product.png'}
                        price={new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }).format(product.price)}
                        description={product.description || ''}
                        quantity={quantities[product.id_product.toString()] || 0}
                        onIncrease={() => handleIncrease(product.id_product.toString())}
                        onDecrease={() => handleDecrease(product.id_product.toString())}
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

// Create specific components for each product category with async data loading
export const ComboGrid = ({ className, onQuantityChange, resetQuantities }: {
    className?: string;
    onQuantityChange?: (productId: string, quantity: number, price: number, productName?: string) => void;
    resetQuantities?: boolean;
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [title, setTitle] = useState('Combo');

    useEffect(() => {
        getProductsByType(1).then(products => {
            setProducts(products);
            // Get type_name from the first product or use default
            if (products.length > 0 && products[0].type_name) {
                setTitle(products[0].type_name);
            }
        });
    }, []);

    return (
        <ProductGrid
            title={title}
            products={products}
            className={className}
            onQuantityChange={onQuantityChange}
            resetQuantities={resetQuantities}
        />
    );
};

export const SoftDrinksGrid = ({ className, onQuantityChange, resetQuantities }: {
    className?: string;
    onQuantityChange?: (productId: string, quantity: number, price: number, productName?: string) => void;
    resetQuantities?: boolean;
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [title, setTitle] = useState('Nước ngọt');

    useEffect(() => {
        getProductsByType(2).then(products => {
            setProducts(products);
            if (products.length > 0 && products[0].type_name) {
                setTitle(products[0].type_name);
            }
        });
    }, []);

    return (
        <ProductGrid
            title={title}
            products={products}
            className={className}
            onQuantityChange={onQuantityChange}
            resetQuantities={resetQuantities}
        />
    );
};

export const BeveragesGrid = ({ className, onQuantityChange, resetQuantities }: {
    className?: string;
    onQuantityChange?: (productId: string, quantity: number, price: number, productName?: string) => void;
    resetQuantities?: boolean;
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [title, setTitle] = useState('Nước suối & Nước ép');

    useEffect(() => {
        getProductsByType(3).then(products => {
            setProducts(products);
            if (products.length > 0 && products[0].type_name) {
                setTitle(products[0].type_name);
            }
        });
    }, []);

    return (
        <ProductGrid
            title={title}
            products={products}
            className={className}
            onQuantityChange={onQuantityChange}
            resetQuantities={resetQuantities}
        />
    );
};

export const FoodProductsGrid = ({ className, onQuantityChange, resetQuantities }: {
    className?: string;
    onQuantityChange?: (productId: string, quantity: number, price: number, productName?: string) => void;
    resetQuantities?: boolean;
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [title, setTitle] = useState('Snacks - Kẹo');

    useEffect(() => {
        getProductsByType(4).then(products => {
            setProducts(products);
            if (products.length > 0 && products[0].type_name) {
                setTitle(products[0].type_name);
            }
        });
    }, []);

    return (
        <ProductGrid
            title={title}
            products={products}
            className={className}
            onQuantityChange={onQuantityChange}
            resetQuantities={resetQuantities}
        />
    );
};