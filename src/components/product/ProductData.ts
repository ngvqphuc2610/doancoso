export interface BaseProductProps {
    id: string;
    title: string;
    description?: string;
    price: string;
    image: string;
    link: string;
    quantity: number;
}

export interface ProductProps1 extends BaseProductProps {
    type: 'combo';
}

export interface ProductProps2 extends BaseProductProps {
    type: 'softdrink';
}

export interface ProductProps3 extends BaseProductProps {
    type: 'beverage';
}

export const promotions: ProductProps1[] = [
    {
        id: '1',
        title: 'COMBO 2 NGĂN SỐ 1',
        description: 'Bắp + Nước ngọt',
        price: '75.000đ',
        image: '/images/product/combo1.jpg',
        link: '/products/combo1',
        quantity: 0,
        type: 'combo'
    },
    // Add more combo items as needed
];

export const promotions2: ProductProps2[] = [
    {
        id: '1',
        title: 'Coca Cola',
        price: '25.000đ',
        image: '/images/product/coca.jpg',
        link: '/products/coca',
        quantity: 0,
        type: 'softdrink'
    },
    // Add more soft drinks as needed
];

export const promotions3: ProductProps3[] = [
    {
        id: '1',
        title: 'Nước suối',
        price: '20.000đ',
        image: '/images/product/water.jpg',
        link: '/products/water',
        quantity: 0,
        type: 'beverage'
    },
    // Add more beverages as needed
];