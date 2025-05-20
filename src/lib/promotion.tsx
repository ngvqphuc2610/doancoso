"use client";

import { getPromotions, getPromotionById, getActivePromotions } from './promotionDb';

export interface PromotionProps {
    id: string;
    title: string;
    description: string;
    image?: string;
    startDate: string;
    endDate: string;
    discountAmount?: number;
    discountType?: string;
    couponCode?: string;
}

// Convert database promotion to frontend promotion format
function convertDbPromotionToProps(promotion: any): PromotionProps {
    return {
        id: String(promotion.id),
        title: promotion.title,
        description: promotion.description || '',
        image: promotion.image || '/images/promotions/default-promotion.png',
        startDate: promotion.start_date,
        endDate: promotion.end_date,
        discountAmount: promotion.discount_amount,
        discountType: promotion.discount_type,
        couponCode: promotion.coupon_code
    };
}

// Get all promotions from database
export async function getAllPromotions(): Promise<PromotionProps[]> {
    try {
        const promotions = await getPromotions();
        return promotions.map(convertDbPromotionToProps);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
        return fallbackPromotions;
    }
}

// Get active promotions from database
export async function getCurrentPromotions(): Promise<PromotionProps[]> {
    try {
        const promotions = await getActivePromotions();
        return promotions.map(convertDbPromotionToProps);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách khuyến mãi đang hoạt động:", error);
        return fallbackPromotions;
    }
}

// Get promotion details by ID
export async function getPromotionDetails(id: string): Promise<PromotionProps | null> {
    try {
        const promotion = await getPromotionById(parseInt(id));
        if (!promotion) return null;
        return convertDbPromotionToProps(promotion);
    } catch (error) {
        console.error(`Lỗi khi lấy chi tiết khuyến mãi ID ${id}:`, error);
        return fallbackPromotions.find(promo => promo.id === id) || null;
    }
}

// Fallback promotion data in case of database errors
export const fallbackPromotions: PromotionProps[] = [
    {
        id: '1',
        title: 'HAPPY WEDNESDAY - NGÀY TRÀN NIỀM VUI',
        description: 'Ưu đãi mỗi thứ 4 hằng tuần: Giảm giá vé xem phim và combo',
        image: '/images/promotions/promotion1.jpg',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        discountAmount: 20,
        discountType: 'percent'
    },
    {
        id: '2',
        title: 'NGÀY TRI ÂN THÀNH VIÊN',
        description: 'Đặc quyền dành riêng cho thành viên vào ngày 14 hàng tháng',
        image: '/images/promotions/promotion2.jpg',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        discountAmount: 25,
        discountType: 'percent'
    },
    {
        id: '3',
        title: 'SINH NHẬT VUI VẺ',
        description: 'Quà tặng đặc biệt dành cho các thành viên trong tháng sinh nhật',
        image: '/images/promotions/promotion3.jpg',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        discountAmount: 50000,
        discountType: 'fixed'
    }
];
