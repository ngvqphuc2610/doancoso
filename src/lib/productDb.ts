import { Product } from './types/database';
import { query } from './db';

export async function getProducts(): Promise<Product[]> {
    try {
        const products = await query<any[]>(
            `SELECT p.*, tp.type_name, CAST(p.price AS DECIMAL(10,0)) as price
            FROM product p 
            LEFT JOIN type_product tp ON p.id_typeproduct = tp.id_typeproduct
            WHERE p.status = 'available'
            ORDER BY p.product_name`
        );

        return products.map(product => ({
            id_product: product.id_product,
            id_typeproduct: product.id_typeproduct,
            product_name: product.product_name,
            price: parseInt(product.price, 10) || 0,
            image: product.image || "",
            description: product.description || "",
            quantity: product.quantity ?? 0,
            status: product.status === 'available' ? 'available' : 'unavailable',
            created_at: product.created_at,
            updated_at: product.updated_at,
            type_name: product.type_name
        } as Product));
    } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
        return [];
    }
}

export async function getProductById(id: number): Promise<Product | null> {
    try {
        const products = await query<any[]>(
            `SELECT p.*, tp.type_name, CAST(p.price AS DECIMAL(10,0)) as price
            FROM product p 
            LEFT JOIN type_product tp ON p.id_typeproduct = tp.id_typeproduct
            WHERE p.id_product = ?`,
            [id]
        );

        if (!products.length) return null;

        const product = products[0];
        return {
            id_product: product.id_product,
            id_typeproduct: product.id_typeproduct,
            product_name: product.product_name,
            price: parseInt(product.price, 10) || 0,
            image: product.image || "",
            description: product.description || "",
            quantity: product.quantity ?? 0,
            status: product.status === 'available' ? 'available' : 'unavailable',
            created_at: product.created_at,
            updated_at: product.updated_at,
            type_name: product.type_name
        } as Product;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin sản phẩm:", error);
        return null;
    }
}

export async function getProductsByType(typeId: number): Promise<Product[]> {
    try {
        const products = await query<any[]>(
            `SELECT p.*, tp.type_name, CAST(p.price AS DECIMAL(10,0)) as price
            FROM product p 
            LEFT JOIN type_product tp ON p.id_typeproduct = tp.id_typeproduct
            WHERE p.status = 'available' AND p.id_typeproduct = ?
            ORDER BY p.product_name`,
            [typeId]
        );

        return products.map(product => ({
            id_product: product.id_product,
            id_typeproduct: product.id_typeproduct,
            product_name: product.product_name,
            price: parseInt(product.price, 10) || 0,
            image: product.image || "",
            description: product.description || "",
            quantity: product.quantity ?? 0,
            status: product.status === 'available' ? 'available' : 'unavailable',
            created_at: product.created_at,
            updated_at: product.updated_at,
            type_name: product.type_name
        } as Product));
    } catch (error) {
        console.error(`Lỗi khi lấy sản phẩm theo loại ${typeId}:`, error);
        return [];
    }
}