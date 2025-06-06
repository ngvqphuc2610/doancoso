"use client";


import Link from 'next/link';
import React, { ReactNode } from 'react';
interface AdminSectionProps {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}

const AdminSection = ({ title, description, href, icon }: AdminSectionProps) => {
  return (
    <Link href={href}>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
        <div className="flex items-center mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 rounded-full bg-blue-500 text-white mr-3 sm:mr-4 flex-shrink-0">
            {icon}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">{title}</h3>
        </div>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
};

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Trang quản trị CineStar</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <AdminSection
          title="Quản lý Phim"
          description="Thêm, sửa, xóa phim và đồng bộ dữ liệu từ TMDB"
          href="/admin/movies"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h18M3 16h18" /></svg>}
        />

        <AdminSection
          title="Quản lý Banner"
          description="Chọn phim để hiển thị banner trên trang chủ"
          href="/admin/banners"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />

        <AdminSection
          title="Quản lý Rạp"
          description="Quản lý thông tin, phòng chiếu và lịch chiếu của các rạp"
          href="/admin/cinema"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6M9 13h6" />
          </svg>}
        />
        <AdminSection
          title="Quản lý Đặt vé"
          description="Quản lý thông tin đặt vé"
          href="/admin/bookings"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />


        <AdminSection
          title="Quản lý Người dùng"
          description="Quản lý tài khoản và thông tin người dùng"
          href="/admin/users"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />

        <AdminSection
          title="Quản lý Thành viên"
          description="Quản lý thông tin và quyền lợi của các thành viên"
          href="/admin/members"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
          <AdminSection
          title="Quản lý membership"
          description="Quản lý membership"
          href="/admin/memberships"
           icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              }
        />

        <AdminSection
          title="Quản lý Sản phẩm"
          description="Quản lý bắp nước, đồ ăn và các sản phẩm khác"
          href="/admin/products"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />

        <AdminSection
          title="Quản lý Khuyến mãi"
          description="Quản lý các chương trình khuyến mãi và ưu đãi"
          href="/admin/promotions"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>}
        />

        <AdminSection
          title="Quản lý Giải trí"
          description="Quản lý các dịch vụ giải trí tại rạp"
          href="/admin/entertainment"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <AdminSection
          title="Quản lý showtime"
          description="Quản lý các suất chiếu của các rạp"
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
        />
        <AdminSection
          title="Quản lý ghế ngồi"
          description="Quản lý các ghế ngồi của các phòng chiếu"
          href="/admin/seats"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m8-2.5a9.5 9.5 0 11-19 0 9.5 9.5 0 0119 0z" /></svg>}
        />
        <AdminSection
          title="Quản lý phòng chiếu"
          description="Quản lý các phòng chiếu của các rạp"
          href="/admin/screen"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="4" width="18" height="6" rx="1.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              <path d="M4 14h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          }
        />
        <AdminSection
          title="Quản lý liên hệ"
          description="Quản lý và phản hồi các liên hệ từ khách hàng"
          href="/admin/contacts"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
      
      </div>
    </div>
  );
}
