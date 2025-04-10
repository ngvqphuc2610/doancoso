import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import ProCarousel from '../promotions/ProCarousel';
import MemberCardCarousel from '../member/MemberCardCarousel';
interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow main-gradient">
        {children}
      </main>
      
      <ProCarousel />
      <MemberCardCarousel />
      <Footer />
    </div>
  );
}
