import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import QuickBookingForm from '../home/QuickBookingForm';

interface LayoutProps2 {
  children: ReactNode;
  // Thêm className prop với ? để nó là optional
}

export default function Layout2({ children }: LayoutProps2) {
  return (
    <div className="flex flex-col min-h-screen bg-cinestar-darkblue">
      <div className="grid grid-cols-12 gap-4 flex-grow container mx-auto px-4">
        <div className="col-span-1 bg-cinestar-darkblue hidden lg:block"></div>
        <main className="col-span-10">
          <Header />
          
          {children}
        </main>
        <div className="col-span-1 bg-cinestar-darkblue hidden lg:block"></div>
      </div>
      <Footer />
    </div>
  );
}