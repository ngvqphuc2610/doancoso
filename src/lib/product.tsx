"use client";

import { Product } from './types/database';
import { getProducts, getProductsByType, getProductById } from './productDb';

interface ProductCardProps {
    id: string;
    title: string;
    image: string;
    price: string;
    description?: string;
    quantity: number;
    className?: string;
    onIncrease?: () => void;
    onDecrease?: () => void;
}

// Product type constants - using IDs from database
export const PRODUCT_TYPES = {
    COMBO: 1,
    SOFT_DRINKS: 2,
    BEVERAGES: 3,
    FOOD: 4
};

// Convert database product to frontend product format
function convertDbProductToProps(product: Product): ProductCardProps {
    return {
        id: String(product.id_product),
        title: product.product_name,
        image: product.image || `/images/product/default-product.png`,
        price: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(product.price),
        description: product.description || '',
        quantity: 0
    };
}

// Get combo products from database
export async function getComboProducts(): Promise<ProductCardProps[]> {
    try {
        const products = await getProductsByType(PRODUCT_TYPES.COMBO);
        return products.map(convertDbProductToProps);
    } catch (error) {
        console.error("Lỗi khi lấy combo sản phẩm:", error);
        return fallbackComboProducts;
    }
}

// Get soft drinks from database
export async function getSoftDrinks(): Promise<ProductCardProps[]> {
    try {
        const products = await getProductsByType(PRODUCT_TYPES.SOFT_DRINKS);
        return products.map(convertDbProductToProps);
    } catch (error) {
        console.error("Lỗi khi lấy nước ngọt:", error);
        return fallbackSoftDrinks;
    }
}

// Get beverages from database
export async function getBeverages(): Promise<ProductCardProps[]> {
    try {
        const products = await getProductsByType(PRODUCT_TYPES.BEVERAGES);
        return products.map(convertDbProductToProps);
    } catch (error) {
        console.error("Lỗi khi lấy đồ uống:", error);
        return fallbackBeverages;
    }
}

// Get food products from database
export async function getFoodProducts(): Promise<ProductCardProps[]> {
    try {
        const products = await getProductsByType(PRODUCT_TYPES.FOOD);
        return products.map(convertDbProductToProps);
    } catch (error) {
        console.error("Lỗi khi lấy đồ ăn:", error);
        return fallbackFoodProducts;
    }
}

// Get all products from database
export async function getAllProducts(): Promise<ProductCardProps[]> {
    try {
        const products = await getProducts();
        return products.map(convertDbProductToProps);
    } catch (error) {
        console.error("Lỗi khi lấy tất cả sản phẩm:", error);
        return [...fallbackComboProducts, ...fallbackSoftDrinks, ...fallbackBeverages, ...fallbackFoodProducts];
    }
}

// Get product by ID from database
export async function getProductsById(id: number): Promise<ProductCardProps | null> {
    try {
        const product = await getProductById(id);
        if (!product) return null;
        return convertDbProductToProps(product);
    } catch (error) {
        console.error("Lỗi khi lấy thông tin sản phẩm:", error);
        return null;
    }
}

// Fallback products for error cases
export const fallbackComboProducts: ProductCardProps[] = [
    {
        id: '1',
        title: 'COMBO GẤU',
        image: '/images/product/COMBO_GAU.png',
        description: '1 Coke 32oz + 1 Bắp 2 Ngăn 64OZ Phô Mai + Caramel',
        price: '119.000 ₫',
        quantity: 0
    },
    {
        id: '2',
        title: 'COMBO CÓ GẤU',
        image: '/images/product/COMBO_CO_GAU.png',
        description: '2 Coke 32oz + 1 Bắp 2 Ngăn 64OZ Phô Mai + Caramel',
        price: '129.000 ₫',
        quantity: 0
    },
    {
        id: '3',
        title: 'COMBO NHÀ GẤU',
        image: '/images/product/COMBO_NHA_GAU.png',
        description: '1 Coke 32oz + 1 Bắp 2 Ngăn 64OZ Phô Mai + Caramel',
        price: '119.000 ₫',
        quantity: 0
    }
];

export const fallbackSoftDrinks: ProductCardProps[] = [
    {
        id: '1',
        title: 'SPRITE 32OZ',
        image: '/images/product/sprite.png',
        price: '37,000VND',
        quantity: 0
    },
    {
        id: '2',
        title: 'COKE 32OZ',
        image: '/images/product/coca.png',
        price: '37,000VND',
        quantity: 0
    },
    {
        id: '3',
        title: 'FANTA 32OZ',
        image: '/images/product/fanta.jpg',
        price: '37,000VND',
        quantity: 0
    }
];

export const fallbackBeverages: ProductCardProps[] = [
    {
        id: '1',
        title: 'NƯỚC CAM TEPPY',
        image: '/images/product/TEPPY.png',
        description: '327ML',
        price: '27,000VND',
        quantity: 0
    },
    {
        id: '2',
        title: 'NƯỚC TRÁI CÂY NUTRIBOOST',
        image: '/images/product/NUTRI.png',
        description: '297ML',
        price: '28,000VND',
        quantity: 0
    },
    {
        id: '3',
        title: 'NƯỚC SUỐI DASANI',
        image: '/images/product/dasani.png',
        description: '500/510ML',
        price: '20,000VND',
        quantity: 0
    }
];

export const fallbackFoodProducts: ProductCardProps[] = [
    {
        id: '1',
        title: 'SNACK THÁI',
        image: '/images/product/snack-que-thai.png',
        price: '25,000VND',
        quantity: 0
    }
];