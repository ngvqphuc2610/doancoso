"use server";

import { query } from './db';

export interface Promotion {
    id: number;
    title: string;
    description: string;
    image?: string;
    start_date: string;
    end_date: string;
    discount_amount?: number;
    discount_type?: string;
    coupon_code?: string;
    status: string;
}

export async function getPromotions(): Promise<Promotion[]> {
    try {
        const promotions = await query<any[]>(`
            SELECT * FROM promotions 
            WHERE status = 'active' AND end_date >= CURDATE()
            ORDER BY start_date DESC
        `);

        return promotions.map(promotion => ({
            id: promotion.id_promotion,
            title: promotion.title,
            description: promotion.description || '',
            image: promotion.image_url || '',
            start_date: promotion.start_date,
            end_date: promotion.end_date,
            discount_amount: promotion.discount_amount,
            discount_type: promotion.discount_type,
            coupon_code: promotion.coupon_code,
            status: promotion.status
        }));
    } catch (error) {
        console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
        return [];
    }
}

export async function getPromotionById(id: number): Promise<Promotion | null> {
    try {
        const promotions = await query<any[]>(
            `SELECT * FROM promotions WHERE id_promotion = ?`,
            [id]
        );

        if (promotions.length === 0) {
            return null;
        }

        const promotion = promotions[0];
        return {
            id: promotion.id_promotion,
            title: promotion.title,
            description: promotion.description || '',
            image: promotion.image_url || '',
            start_date: promotion.start_date,
            end_date: promotion.end_date,
            discount_amount: promotion.discount_amount,
            discount_type: promotion.discount_type,
            coupon_code: promotion.coupon_code,
            status: promotion.status
        };
    } catch (error) {
        console.error(`Lỗi khi lấy khuyến mãi ID ${id}:`, error);
        return null;
    }
}

export async function getActivePromotions(): Promise<Promotion[]> {
    try {
        const today = new Date().toISOString().split('T')[0];
        const promotions = await query<any[]>(
            `SELECT * FROM promotions 
            WHERE status = 'active' 
            AND start_date <= ? 
            AND end_date >= ?
            ORDER BY start_date DESC`,
            [today, today]
        );

        return promotions.map(promotion => ({
            id: promotion.id_promotion,
            title: promotion.title,
            description: promotion.description || '',
            image: promotion.image_url || '',
            start_date: promotion.start_date,
            end_date: promotion.end_date,
            discount_amount: promotion.discount_amount,
            discount_type: promotion.discount_type,
            coupon_code: promotion.coupon_code,
            status: promotion.status
        }));
    } catch (error) {
        console.error("Lỗi khi lấy danh sách khuyến mãi đang hoạt động:", error);
        return [];
    }
}
