"use client";

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminGuard from '@/components/auth/AdminGuard';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarItemProps {
  href: string;
  icon: ReactNode;
  title: string;
  currentPath: string;
}

const SidebarItem = ({ href, icon, title, currentPath }: SidebarItemProps) => {
  const isActive = currentPath === href || currentPath.startsWith(`${href}/`);

  return (
    <Link href={href}>
      <div
        className={`flex items-center px-4 py-3 mb-2 rounded-md transition-colors ${isActive
          ? 'bg-blue-600 text-white'
          : 'hover:bg-gray-100 text-gray-700'
          }`}
      >
        <div className="mr-3">{icon}</div>
        <span className="font-medium">{title}</span>
      </div>
    </Link>
  );
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-white rounded-md shadow-md"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-md p-5 transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="mb-8">
            <Link href="/admin">
              <h1 className="text-xl lg:text-2xl font-bold text-blue-600">CineStar Admin</h1>
            </Link>
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-600">Xin chào,</p>
              <p className="font-medium text-gray-800 truncate">{user?.fullName}</p>
              <button
                onClick={handleLogout}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Đăng xuất
              </button>
            </div>
          </div>
          <nav>
            <SidebarItem
              href="/admin/movies"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h18M3 16h18" /></svg>}
              title="Phim"
              currentPath={pathname}
            />
            <SidebarItem
              href="/admin/banners"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              title="Banner"
              currentPath={pathname}
            />
            <SidebarItem
              href="/admin/cinema"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
              title="Rạp chiếu"
              currentPath={pathname}
            />
            <SidebarItem
              href="/admin/members"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
              title="Thành viên"
              currentPath={pathname}
            />
            <SidebarItem
              href="/admin/products"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
              title="Sản phẩm"
              currentPath={pathname}
            />
            <SidebarItem
              href="/admin/promotions"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>}
              title="Khuyến mãi"
              currentPath={pathname}
            />
            <SidebarItem
              href="/admin/entertainment"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              title="Giải trí"
              currentPath={pathname}
            />

            <SidebarItem
              href="/admin/showtimes"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m8-2.5a9.5 9.5 0 11-19 0 9.5 9.5 0 0119 0z" /></svg>}

              title="Suất chiếu"
              currentPath={pathname}
            />

            <SidebarItem
              href="/admin/seats"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15a1 1 0 011-1h12a1 1 0 011 1v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 15V7a3 3 0 013-3h4a3 3 0 013 3v8" />
                </svg>
              }
              title="Quản lý ghế"
              currentPath={pathname}
            />
            <SidebarItem
              href="/admin/screen"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="6" rx="1.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  <path d="M4 14h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              }
              title="Quản lý phòng chiếu"
              currentPath={pathname}
            />
            <SidebarItem
              href="/admin/contacts"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
              title="Quản lý liên hệ"
              currentPath={pathname}
            />

          </nav>
        </div>

        {/* Overlay for mobile menu */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto lg:ml-0">
          <main className="p-4 sm:p-6 pt-16 lg:pt-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
