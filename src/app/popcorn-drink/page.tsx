"use client";

import Layout2 from '@/components/layout/Layout2';
import { ComboGrid, SoftDrinksGrid, BeveragesGrid,FoodProductsGrid  } from '@/components/product/ProductGrid';

export default function PopcornDrinkPage() {
  return (
    <Layout2>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white text-center mb-12">MENU BẮP NƯỚC</h1>

        <div className="space-y-16">
          <ComboGrid />
          <SoftDrinksGrid />
          <BeveragesGrid />
          <FoodProductsGrid />
        </div>
      </div>
    </Layout2>
  );
}