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

export default function MemberCard({ id, title, image, link, description }: MemberProps) {
  const { t } = useTranslation();

  // Xác định translation key dựa vào id
  const getMemberTranslation = (memberId: string) => {
    switch (memberId) {
      case "1":
        return {
          name: "member.name",
          description: "member.description"
        };
      case "2":
        return {
          name: "member.name2",
          description: "member.description2"
        };
      default:
        return {
          name: "member.name",
          description: "member.description"
        };
    }
  };

  const translationKeys = getMemberTranslation(id);

  return (
    <Card className="relative bg-transparent border-none rounded-lg overflow-hidden shadow-lg hover:cursor-pointer">
      <Link href="/membership">
        <CardContent className="p-0 bg-transparent">
          {/* Image Section */}
          <div className="relative w-[586px] h-[319px] shadow-[0_0_30px_#ebdb40]">
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

            {/* Button */}
            <Button
              variant="custom7"
              size="custom7"
              width="custom7"
              className="md:text-base"
            >
              {t("member.button")}
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}