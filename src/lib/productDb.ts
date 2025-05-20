"use server";

import { query } from './db';

export interface Product {
    id: number;
    id_typeproduct?: number;
    product_name: string;
    description?: string;
    price: number;
    image?: string;
    status?: string;
    type_name?: string;
}

export async function getProducts(): Promise<Product[]> {
    try {
        const products = await query<any[]>(`
            SELECT p.*, tp.type_name 
            FROM product p 
            LEFT JOIN type_product tp ON p.id_typeproduct = tp.id_typeproduct
            WHERE p.status = 'available' 
            ORDER BY p.id_typeproduct, p.product_name
        `);

        return products.map(product => ({
            id: product.id_product,
            id_typeproduct: product.id_typeproduct,
            product_name: product.product_name,
            description: product.description || '',
            price: product.price,
            image: product.image || '',
            status: product.status || 'available',
            type_name: product.type_name || 'Khác'
        }));
    } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
        return [];
    }
}

export async function getProductsByType(typeId: number): Promise<Product[]> {
    try {
        const products = await query<any[]>(
            `SELECT p.*, tp.type_name 
            FROM product p 
            LEFT JOIN type_product tp ON p.id_typeproduct = tp.id_typeproduct
            WHERE p.status = 'available' AND p.id_typeproduct = ?
            ORDER BY p.product_name`,
            [typeId]
        );

        return products.map(product => ({
            id: product.id_product,
            id_typeproduct: product.id_typeproduct,
            product_name: product.product_name,
            description: product.description || '',
            price: product.price,
            image: product.image || '',
            status: product.status || 'available',
            type_name: product.type_name || 'Khác'
        }));
    } catch (error) {
        console.error(`Lỗi khi lấy sản phẩm theo loại ${typeId}:`, error);
        return [];
    }
}

export async function getProductById(id: number): Promise<Product | null> {
    try {
        const products = await query<any[]>(
            `SELECT p.*, tp.type_name 
            FROM product p 
            LEFT JOIN type_product tp ON p.id_typeproduct = tp.id_typeproduct
            WHERE p.id_product = ?`,
            [id]
        );

        if (products.length === 0) {
            return null;
        }

        const product = products[0];
        return {
            id: product.id_product,
            id_typeproduct: product.id_typeproduct,
            product_name: product.product_name,
            description: product.description || '',
            price: product.price,
            image: product.image || '',
            status: product.status || 'available',
            type_name: product.type_name || 'Khác'
        };
    } catch (error) {
        console.error(`Lỗi khi lấy sản phẩm ID ${id}:`, error);
        return null;
    }
}

export async function getProductTypes(): Promise<any[]> {
    try {
        const types = await query<any[]>(`
            SELECT * FROM type_product 
            ORDER BY type_name
        `);

        return types;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách loại sản phẩm:", error);
        return [];
    }
}
