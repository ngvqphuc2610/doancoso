'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardProduct } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ProductCardProps {
    id: string;
    title: string;
    image: string;
    price: string;
    description?: string;
    className?: string;
    quantity: number;
    onIncrease?: () => void;
    onDecrease?: () => void;
}

export default function ProductCard({
    id,
    title,
    image,
    price,
    description,
    quantity,
    onIncrease,
    onDecrease,
    className = ''
}: ProductCardProps) {
    const { t } = useTranslation();

    return (
        <CardProduct
            id={id}
            title={title}
            image={image}
            price={price}
            description={description}
            quantity={quantity}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            variant="default"
            size="default"
            className={className}
        />
    );
}