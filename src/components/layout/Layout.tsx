'use client'

import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import QuickBookingForm from '../home/QuickBookingForm';
interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-cinestar-darkblue">
      <div className="flex-grow container mx-auto px-2 sm:px-4 lg:px-6">
        <div className="grid grid-cols-12 gap-2 sm:gap-4 lg:gap-6">
          {/* Left spacer - hidden on mobile and tablet */}
          <div className="col-span-0 lg:col-span-1 bg-cinestar-darkblue hidden lg:block"></div>

          {/* Main content - full width on mobile/tablet, centered on desktop */}
          <main className="col-span-12 lg:col-span-10">
            <Header />
            {children}
          </main>

          {/* Right spacer - hidden on mobile and tablet */}
          <div className="col-span-0 lg:col-span-1 bg-cinestar-darkblue hidden lg:block"></div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
