import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

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
    link: '/promotions/student-discount',
  },
  {
    id: '2',
    title: 'Đồng Giá 45K Trước 10H Sáng',
    image: '/images/pro_student.png',
    link: '/promotions/morning-discount',
  },
  {
    id: '3',
    title: 'TEN - HAPPY HOUR - 45K/ 2D MỐC 10H  ',
    image: '/images/pro_ten.png',
    link: '/promotions/monday-special',
  },
  {
    id: '4',
    title: 'MONDAY - HAPPY DAY - ĐỒNG GIÁ 45K/ 2D ',
    image: '/images/pro_monday.jpg',
    link: '/promotions/tuesday-special',
  }
];

export default function ProCard({ id, title, image, link }: PromotionProps) {
  return (
    <Card className="relative bg-white rounded-lg overflow-hidden shadow-lg h-64 hover:cursor-pointer" >
      <CardContent className="p-0 h-full">
        <div className="relative h-full">
          <Image
            src={image}
            alt={title}
            className="object-cover"
            fill
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
          <div className="absolute left-4 right-4 text-white">
     
            <Link href={link} className="inline-block mt-4 font-bold px-4 py-2 ">
              
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
