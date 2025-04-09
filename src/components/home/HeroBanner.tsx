import React from 'react';
import Carousel from './Carousel';
import type { StaticImageData } from 'next/image';

interface BannerItem {
  id: string;
  image: StaticImageData; // Đảm bảo kiểu này đúng
  title: string;
  link: string;
}

interface HeroBannerProps {
  banners: BannerItem[];
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  return (
    <div className="w-full">
      <Carousel banners={banners} />
    </div>
  );
}
