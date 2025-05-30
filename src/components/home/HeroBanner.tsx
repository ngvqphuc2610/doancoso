import React from 'react';
import Carousel from './Carousel';
import type { StaticImageData } from 'next/image';

export interface BannerItem {
  id: string;
  image: StaticImageData | string; // Hỗ trợ cả StaticImageData và string URL
  title: string;
  link: string;
  isBanner?: boolean; // Flag để biết có phải banner thật không
}

interface HeroBannerProps {
  banners: BannerItem[];
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  return (
    <div className="w-full object-cover ">
      <Carousel banners={banners} />
    </div>
  );
}
