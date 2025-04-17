export interface PromotionProps {
    id: string;
    title: string;
    image: string;
    link: string;
}

export const promotions: PromotionProps[] = [
    {
        id: '1',
        title: 'STUDENT - 45K CHO HỌC SINH SINH VIÊN ',
        image: '/images/pro_MEMBER.png',
        link: 'chuong-trinh-khuyen-mai',
    },
    {
        id: '2',
        title: 'Đồng Giá 45K Trước 10H Sáng',
        image: '/images/pro_student.png',
        link: 'chuong-trinh-khuyen-mai',
    },
    {
        id: '3',
        title: 'TEN - HAPPY HOUR - 45K/ 2D MỐC 10H  ',
        image: '/images/pro_ten.png',
        link: 'chuong-trinh-khuyen-mai',
    },
    {
        id: '4',
        title: 'MONDAY - HAPPY DAY - ĐỒNG GIÁ 45K/ 2D ',
        image: '/images/pro_monday.jpg',
        link: 'chuong-trinh-khuyen-mai',
    }
];