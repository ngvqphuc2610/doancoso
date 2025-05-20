"use client";

import { getProducts, getProductsByType, getProductById, getProductTypes } from './productDb';

export interface ProductProps1 {
    id: string;
    title: string;
    image: string;
    price: string;
    description?: string;
    className?: string;
    quantity: number;
    type?: string;
    onIncrease?: () => void;
    onDecrease?: () => void;
}

export interface ProductProps2 extends ProductProps1 { }
export interface ProductProps3 extends ProductProps1 { }
export interface ProductProps4 extends ProductProps1 { }

// Product type constants - using IDs from database
export const PRODUCT_TYPES = {
    COMBO: 1,
    SOFT_DRINKS: 2,
    BEVERAGES: 3,
    FOOD: 4
};

// Convert database product to frontend product format
function convertDbProductToProps(product: any): ProductProps1 {
    return {
        id: String(product.id),
        title: product.product_name,
        image: product.image || `/images/product/default-product.png`,
        price: new Intl.NumberFormat('vi-VN').format(product.price) + 'VND',
        description: product.description || '',
        quantity: 0,
        type: product.type_name
    };
}

// Get combo products from database
export async function getComboProducts(): Promise<ProductProps1[]> {
    try {
        const products = await getProductsByType(PRODUCT_TYPES.COMBO);
        return products.map(convertDbProductToProps);
    } catch (error) {
        console.error("Lỗi khi lấy combo sản phẩm:", error);
        return fallbackComboProducts;
    }
}

// Fallback combo products for error cases
export const fallbackComboProducts: ProductProps1[] = [
    {
        id: '1',
        title: 'COMBO GẤU',
        image: '/images/product/COMBO_GAU.png',
        description: '1 Coke 32oz + 1 Bắp 2 Ngăn 64OZ Phô Mai + Caramel',
        price: '119,000VND',
        quantity: 0
    },
    {
        id: '2',
        title: 'COMBO CÓ GẤU',
        image: '/images/product/COMBO_CO_GAU.png',
        description: '2 Coke 32oz + 1 Bắp 2 Ngăn 64OZ Phô Mai + Caramel',
        price: '129,000VND',
        quantity: 0
    },
    {
        id: '3',
        title: 'COMBO NHÀ GẤU',
        image: '/images/product/COMBO_NHA_GAU.png',
        description: '1 Coke 32oz + 1 Bắp 2 Ngăn 64OZ Phô Mai + Caramel',
        price: '119,000VND',
        quantity: 0
    },
];

// Get soft drinks from database
export async function getSoftDrinks(): Promise<ProductProps2[]> {
    try {
        const products = await getProductsByType(PRODUCT_TYPES.SOFT_DRINKS);
        return products.map(convertDbProductToProps);
    } catch (error) {
        console.error("Lỗi khi lấy nước ngọt:", error);
        return fallbackSoftDrinks;
    }
}

// Fallback soft drinks for error cases
export const fallbackSoftDrinks: ProductProps2[] = [
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
    },
];

// Get beverages from database
export async function getBeverages(): Promise<ProductProps3[]> {
    try {
        const products = await getProductsByType(PRODUCT_TYPES.BEVERAGES);
        return products.map(convertDbProductToProps);
    } catch (error) {
        console.error("Lỗi khi lấy đồ uống:", error);
        return fallbackBeverages;
    }
}

// Fallback beverages for error cases
export const fallbackBeverages: ProductProps3[] = [
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
    },
];

// Get food products from database
export async function getFoodProducts(): Promise<ProductProps4[]> {
    try {
        const products = await getProductsByType(PRODUCT_TYPES.FOOD);
        return products.map(convertDbProductToProps);
    } catch (error) {
        console.error("Lỗi khi lấy đồ ăn:", error);
        return fallbackFoodProducts;
    }
}

// Get all products from database
export async function getAllProducts(): Promise<ProductProps1[]> {
    try {
        const products = await getProducts();
        return products.map(convertDbProductToProps);
    } catch (error) {
        console.error("Lỗi khi lấy tất cả sản phẩm:", error);
        return [...fallbackComboProducts, ...fallbackSoftDrinks, ...fallbackBeverages, ...fallbackFoodProducts];
    }
}

// Fallback food products for error cases
export const fallbackFoodProducts: ProductProps4[] = [
    {
        id: '1',
        title: 'SNACK THÁI',
        image: '/images/product/snack-que-thai.png',
        price: '25,000VND',
        quantity: 0,
    },
];