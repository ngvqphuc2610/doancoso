import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export interface MemberProps {
  id: string;
  title: string;
  image: string;
  link: string;
}

export const promotions: MemberProps[] = [
  {
    id: '1',
    title: 'THÀNH VIÊN C’FRIEND',
    image: '/images/CMember_heeder.webp',
    link: '/member/student-discount',
  },
  {
    id: '2',
    title: 'THÀNH VIÊN C’VIP',
    image: '/images/c-vip_header.webp',
    link: '/member/morning-discount',
  },
  
];

export default function MemberCard({ id, title, image, link }: MemberProps) {
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
