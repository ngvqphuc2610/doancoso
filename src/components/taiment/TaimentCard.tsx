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

export default function TaimentCard({ id, translationKey, image, link }: TaimentProps) {
  const { t } = useTranslation();

  return (
    <Card className="relative rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform">
      <Link href={link || '#'}>
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={image}
            alt={t(`taiment.items.${translationKey}.title`)}
            className="object-cover"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
        </div>
      </Link>
    </Card>
  );
}



