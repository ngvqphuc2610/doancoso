import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export interface TaimentProps {
  id: string;
  title: string;
  image: string;
  link?: string;
  description?: string;
}
export const taimentItems: TaimentProps[] = [
  {
    id: '1',
    title: 'KIDZONE',
    image: '/images/kidzone.webp',
    link: '/kidzone',
    description: 'Giải phóng trí tưởng tượng của con bạn tại Kidzone, sân chơi trong nhà tuyệt đỉnh.',
  },
  {
    id: '2',
    title: 'BOWLING',
    image: '/images/bowling.webp',
    link: '/bowling',
    description: 'Tận hưởng niềm vui tại C Bowling - Thành phố Đà Lạt & Huế!',
  },
    {
        id: '3',
        title: 'BILLIARD',
        image: '/images/billiards.webp',
        link: '/billiard',
        description: 'Thỏa sức thể hiện tài năng ca hát của bạn tại Karaoke CineStar!',
    },
    {
        id: '4',
        title: 'NHÀ HÀNG',
        image: '/images/monngon.webp',
        link: '/restaurant',
        description: 'Bắt tay vào cuộc phiêu lưu ẩm thực tại Món Ngon Đà Lạt & Huế!',
    },
    {
        id: '5',
        title: 'GYM',
        image: '/images/gym.webp',
        link: '/gym',
        description: 'Đạt được mục tiêu thể hình của bạn tại C Gym - Đà Lạt & Thành phố Hồ Chí Minh!',
    },
    {
        id: '6',
        title: 'OPERA HOUSE',
        image: '/images/opera.webp',
        link: '/opera',
        description: 'Chứng kiến sự hùng vĩ ở trung tâm thành phố',
    },
];

export default function TaimentCard({ id, title, image, link }: TaimentProps) {
    return (
      <Card className="relative rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform">
        <Link href={link || '#'}>
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={image}
              alt={title}
              className="object-cover"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            />
          </div>
        </Link>
      </Card>
    );
  }
 


