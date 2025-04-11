import React from 'react';
import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export interface MemberProps {
  id: string;
  title: string;
  image: string;
  link: string;
  description: string;
}

export const promotions: MemberProps[] = [
  {
    id: '1',
    title: 'THÀNH VIÊN C’FRIEND',
    image: '/images/CMember_heeder.webp',
    link: '/member/student-discount',
    description: 'Thẻ C’FRIEND nhiều ưu đãi cho thành viên mới',
  },
  {
    id: '2',
    title: 'THÀNH VIÊN C’VIP',
    image: '/images/c-vip_header.webp',
    link: '/member/morning-discount',
    description: 'Thẻ VIP CineStar mang đến sự ưu đãi độc quyền',
  },

];

export default function MemberCard({ id, title, image, link, description }: MemberProps) {
  return (
    <Card className="relative rounded-lg overflow-hidden shadow-lg hover:cursor-pointer">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative h-48">
          <Image
            src={image}
            alt={title}
            className="object-cover"
            fill
          />
        </div>

        {/* Content Section */}
        <div className="p-4 text-white">
          {/* Title */}
          <h3 className="text-lg font-bold text-left">{title}</h3>

          {/* Description */}
          <p className=" text-sm mt-2 text-left">{description}</p>

          {/* Link */}
          <button className="cinestar-button-to font-bold text-sm md:text-base">
            <Link href={link} className="block">
              TÌM HIỂU NGAY
            </Link>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}