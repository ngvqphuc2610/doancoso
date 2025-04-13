"use client";

import Layout2 from '@/components/layout/Layout2';
import { ProductCarousel1, ProductCarousel2, ProductCarousel3 } from '@/components/product/ProductGrid';

export default function PopcornDrinkPage() {
  return (
    <Layout2>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white text-center mb-12">MENU BẮP NƯỚC</h1>
        
        <div className="space-y-16">
          <ProductCarousel1 />
          <ProductCarousel2 />
          <ProductCarousel3 />
        </div>
      </div>
    </Layout2>
  );
}