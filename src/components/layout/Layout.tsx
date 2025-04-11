import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-cinestar-darkblue">


      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-4 flex-grow container mx-auto px-4">
       
        {/* Left Sidebar */}
        <div className="col-span-1 bg-cinestar-darkblue hidden lg:block"></div>

        {/* Main Content */}
        <main className="col-span-10">
          {/* Header */}
          <Header />
          {children}
          
        </main>

        {/* Right Sidebar */}
        <div className="col-span-1 bg-cinestar-darkblue  hidden lg:block"></div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
