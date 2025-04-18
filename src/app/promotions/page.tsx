"use client";

import React from 'react';
import Layout2 from '@/components/layout/Layout2';
import { promotions } from '@/lib/promotions';
import ProGrid from '@/components/promotions/ProGrid';
import { useTranslation } from 'react-i18next';

export default function PromotionsPage() {
    const { t } = useTranslation();

    return (
        <Layout2>
            <div className="container mx-auto px-4 py-8">
               
                <ProGrid promotions={promotions} className="mb-12" />
            </div>
        </Layout2>
    );
}