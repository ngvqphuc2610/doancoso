'use client';

import React, { useState } from 'react';
import { Card, CardProduct } from '@/components/ui/card';
import { ProductProps1 } from './ProductData';

const ProductCard = (props: ProductProps1) => {
    const [quantity, setQuantity] = useState(props.quantity);

    const handleIncrease = () => {
        setQuantity(prev => prev + 1);
    };

    const handleDecrease = () => {
        setQuantity(prev => Math.max(0, prev - 1));
    };

    return (
        
            <CardProduct
                {...props}
                quantity={quantity}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
            />
       
    );
};

export default ProductCard;