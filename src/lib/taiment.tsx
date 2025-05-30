import { TaimentProps } from '@/components/taiment/TaimentCard';
import { Entertainment } from '@/lib/types/database';

// Function to convert database entertainment to TaimentProps
function convertDbEntertainmentToProps(entertainment: Entertainment): TaimentProps {
    return {
        id: entertainment.id_entertainment.toString(),
        title: entertainment.title,
        image: entertainment.image_url || '/images/no-image.jpg',
        translationKey: entertainment.title.toLowerCase().replace(/\s+/g, ''),
        description: entertainment.description || ''
    };
}

// Get all entertainments from database
export async function getAllEntertainments(): Promise<TaimentProps[]> {
    try {
        const response = await fetch('/api/entertainment');
        const data = await response.json();

        if (data.success && data.data) {
            return data.data.map(convertDbEntertainmentToProps);
        }
        return fallbackTaimentItems;
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu entertainment:", error);
        return fallbackTaimentItems;
    }
}

// Get featured entertainments from database
export async function getFeaturedEntertainments(): Promise<TaimentProps[]> {
    try {
        const response = await fetch('/api/entertainment');
        const data = await response.json();

        if (data.success && data.data) {
            return data.data
                .filter((entertainment: Entertainment) => entertainment.featured)
                .map(convertDbEntertainmentToProps);
        }
        return fallbackTaimentItems.slice(0, 3);
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu entertainment nổi bật:", error);
        return fallbackTaimentItems.slice(0, 3);
    }
}

// Fallback entertainment data for error cases
export const fallbackTaimentItems: TaimentProps[] = [
    {
        id: '1',
        title: 'KIDZONE',
        image: '/images/kidzone.webp',
        translationKey: 'kidzone',
        description: 'Giải phóng trí tưởng tượng của con bạn tại Kidzone, sân chơi trong nhà tuyệt đỉnh.'
    },
    {
        id: '2',
        title: 'BOWLING',
        image: '/images/bowling.webp',
        translationKey: 'bowling',
        description: 'Tận hưởng niềm vui tại C Bowling - Thành phố Đà Lạt & Huế!'
    },
    {
        id: '3',
        title: 'BILLIARD',
        image: '/images/billiards.webp',
        translationKey: 'billiard',
        description: 'Thỏa sức thể hiện tài năng ca hát của bạn tại Karaoke CineStar!'
    },
    {
        id: '4',
        title: 'NHÀ HÀNG',
        image: '/images/monngon.webp',
        translationKey: 'restaurant',
        description: 'Bắt tay vào cuộc phiêu lưu ẩm thực tại Món Ngon Đà Lạt & Huế!'
    },
    {
        id: '5',
        title: 'GYM',
        image: '/images/gym.webp',
        translationKey: 'gym',
        description: 'Đạt được mục tiêu thể hình của bạn tại C Gym - Đà Lạt & Thành phố Hồ Chí Minh!'
    },
    {
        id: '6',
        title: 'OPERA HOUSE',
        image: '/images/opera.webp',
        translationKey: 'opera',
        description: 'Chứng kiến sự hùng vĩ ở trung tâm thành phố'
    }
];

// Export for backward compatibility
export const taimentItems = fallbackTaimentItems;