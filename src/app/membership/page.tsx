"use client";

import Layout from '@/components/layout/Layout';
import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import MemberCardCarousel from '@/components/member/MemberCardCarousel';
import { useTranslation } from 'react-i18next';


export default function Home() {
  const { t } = useTranslation();
  return (
    <Layout>
      <div className="container mx-auto px-4 ">
            <MemberCardCarousel className="" />
      </div>
    </Layout>
  );
}
