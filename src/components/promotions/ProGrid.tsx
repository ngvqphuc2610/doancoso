'use client';

import React from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import ProCard, { PromotionProps } from './ProCard';

interface ProGridProps {
  title?: string;
  promotions: PromotionProps[];
  className?: string;
}

export default function ProGrid({ title, promotions, className = '' }: ProGridProps) {
  const { t } = useTranslation();

  if (!promotions || promotions.length === 0) {
    return (
      <div className={`py-8 ${className}`}>
        {title && <h2 className="text-2xl md:text-3xl text-center font-bold mb-6">{title}</h2>}
        <div className="flex justify-center items-center h-[300px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className={`py-8 ${className}`}>
      {title && <h2 className="text-2xl md:text-3xl text-center font-bold mb-6 text-white">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {promotions.map((promotion) => (
          <ProCard key={promotion.id} {...promotion} variant="card2" />
        ))}
      </div>
    </div>
  );
}
