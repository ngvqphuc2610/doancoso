import React from 'react';
import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
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
  const { t } = useTranslation();

  // Xác định translation key dựa vào id
  const getMemberTranslation = (memberId: string) => {
    switch (memberId) {
      case '1':
        return {
          name: 'member.name',
          description: 'member.description'
        };
      case '2':
        return {
          name: 'member.name2',
          description: 'member.description2'
        };
      default:
        return {
          name: 'member.name',
          description: 'member.description'
        };
    }
  };

  const translationKeys = getMemberTranslation(id);

  return (
    <Link href="/membership">
      <Card className="relative  bg-transparent border-none rounded-lg overflow-hidden shadow-lg hover:cursor-pointer">
        <CardContent className="p-0  bg-transparent">
          {/* Image Section */}
          <div className="relative w-[586px] h-[319px] shadow-[0_0_30px_#ebdb40] ">
            <Image
              src={image}
              alt={title}
              className="object-fill rounded-xl"
              fill
            />
          </div>

          {/* Content Section */}
            <div className="p-4 text-white flex flex-col bg-transparent">
            {/* Title */}
            <h3 className="text-lg font-bold text-left">{t(translationKeys.name)}</h3>

            {/* Description */}
            <p className="text-sm mt-2 text-left">{t(translationKeys.description)}</p>

            {/* Link */}
            <Button
            variant={"custom7"}
            size={"custom7"}
            width={"custom7"} className="md:text-base">
              <Link href="/membership" className="block">
                {t('member.button')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}