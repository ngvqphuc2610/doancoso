"use client";

import Layout from '@/components/layout/Layout';
import { ComboGrid, SoftDrinksGrid, BeveragesGrid,FoodProductsGrid  } from '@/components/product/ProductGrid';

export default function PopcornDrinkPage() {
  return (
    <Layout>
      <div className="container mx-auto px-0 py-8">
        <h1 className="text-4xl font-bold text-white text-center mb-12">MENU BẮP NƯỚC</h1>

        <div className="space-y-16">
          <ComboGrid />
          <SoftDrinksGrid />
          <BeveragesGrid />
          <FoodProductsGrid />
        </div>
      </div>
    </Layout>
  );
}