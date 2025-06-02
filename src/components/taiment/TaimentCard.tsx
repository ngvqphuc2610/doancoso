import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export interface TaimentProps {
  id: string;
  title: string;
  image: string;
  link?: string;
  description?: string;
  translationKey?: string;
}

export default function TaimentCard({ id, translationKey, image, link, title }: TaimentProps) {
  const { t } = useTranslation();

  // Tạo URL động: nếu có link thì dùng link, không thì dùng /entertainment/[id]
  const href = link || `/entertainment/${id}`;

  return (
    <Card className="relative rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform">
      <Link href={href}>
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={image}
            alt={title || t(`taiment.items.${translationKey}.title`)}
            className="object-cover"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
        </div>
      </Link>
    </Card>
  );
}



