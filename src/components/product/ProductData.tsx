export interface ProductProps1 {
    id: string;
    title: string;
    image: string;
    price: string;
    link: string;
    description?: string;
    className?: string;
    quantity: number;
    onIncrease?: () => void;
    onDecrease?: () => void;
}

export interface ProductProps2 extends ProductProps1 { }
export interface ProductProps3 extends ProductProps1 { }

export const promotions: ProductProps1[] = [
    {
        id: '1',
        title: 'COMBO GẤU',
        image: '/images/product/COMBO_GAU.png',
        link: '/member/student-discount',
        description: '1 Coke 32oz + 1 Bắp 2 Ngăn 64OZ Phô Mai + Caramel',
        price: '119,000VND',
        quantity: 0
    },
    {
        id: '2',
        title: 'COMBO CÓ GẤU',
        image: '/images/product/COMBO_CO_GAU.png',
        link: '/member/morning-discount',
        description: '2 Coke 32oz + 1 Bắp 2 Ngăn 64OZ Phô Mai + Caramel',
        price: '129,000VND',
        quantity: 0
    },
    {
        id: '3',
        title: 'COMBO NHÀ GẤU',
        image: '/images/product/COMBO_NHA_GAU.png',
        link: '/member/morning-discount',
        description: '1 Coke 32oz + 1 Bắp 2 Ngăn 64OZ Phô Mai + Caramel',
        price: '119,000VND',
        quantity: 0
    },

];

export const promotions2: ProductProps2[] = [
    {
        id: '1',
        title: 'SPRITE 32OZ',
        image: '/images/product/sprite.png',
        link: '/member/student-discount',
        price: '37,000VND',
        quantity: 0
    },
    {
        id: '2',
        title: 'COKE 32OZ',
        image: '/images/product/coca.png',
        link: '/member/morning-discount',
        price: '37,000VND',
        quantity: 0
    },
    {
        id: '3',
        title: 'FANTA 32OZ',
        image: '/images/product/fanta.jpg',
        link: '/member/morning-discount',
        price: '37,000VND',
        quantity: 0
    },

];


export const promotions3: ProductProps3[] = [
    {
        id: '1',
        title: 'NƯỚC CAM TEPPY',
        image: '/images/product/TEPPY.png',
        link: '/member/student-discount',
        description: '327ML',
        price: '27,000VND',
        quantity: 0
    },
    {
        id: '2',
        title: 'NƯỚC TRÁI CÂY NUTRIBOOST',
        image: '/images/product/NUTRI.png',
        link: '/member/morning-discount',
        description: '297ML',
        price: '28,000VND',
        quantity: 0
    },
    {
        id: '3',
        title: 'NƯỚC SUỐI DASANI',
        image: '/images/product/dasani.png',
        link: '/member/morning-discount',
        description: '500/510ML',
        price: '20,000VND',
        quantity: 0
    },

];
