import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardProduct } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export interface PromotionProps {
  id: string;
  title: string;
  image: string;
  link: string;
  variant?: 'card1' | 'card2';
}

export default function ProCard({ id, title, image, link, variant = 'card1' }: PromotionProps) {
  const { t } = useTranslation();

  if (variant === 'card1') {
    return (
      <Card className="card1 overflow-hidden">
        <Link href={link}>
          <div className="relative w-full h-[200px]">
            <Image src={image} alt={title} fill className="object-cover" />
          </div>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="card2 overflow-hidden">
      <Link href={link}>
        <div className="relative w-full h-[200px]">
          <Image src={image} alt={title} fill className="object-cover" />
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold line-clamp-2">{title}</h3>
        </CardContent>
      </Link>
    </Card>
  );
}
