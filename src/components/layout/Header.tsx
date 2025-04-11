import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, Search, User } from 'lucide-react';
import { FaCaretDown } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
export default function Header() {
  const menuItems = [
    { href: "/chonrap", label: "Chọn rạp" },
    { href: "/showtimes", label: "Lịch chiếu" },
  
  ];
  const menuItems2 = [
    { href: "/chuong-trinh-khuyen-mai", label: "Khuyến mãi" },
    { href: "/to-chuc-su-kien", label: "Thuê sự kiện" },
    { href: "/cac-loai-hinh-giai-tri-khac", label: "Tất cả các giải trí" },
    { href: "/about-us", label: "Giới thiệu" },
  ];

  return (
    <header className="bg-cinestar-darkblue text-white sticky top-0 right-0 w-full z-50 shadow-md">
      <div className="container mx-auto px-4 py-2">
        {/* Mobile app banner */}
        {/* Closing tag for the container */}
      </div>


        {/* Main navigation */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-cinestar-darkblue text-white">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="text-lg font-bold hover:text-cinestar-yellow">TRANG CHỦ</Link>
                  <Link href="/" className="text-lg font-bold hover:text-cinestar-yellow">ĐẶT VÉ </Link>
                  <Link href="/" className="text-lg font-bold hover:text-cinestar-yellow">BẮP NƯỚC</Link>
                  <Link href="/" className="text-lg font-bold hover:text-cinestar-yellow">LỊCH CHIẾU</Link>
                  <Link href="/" className="text-lg font-bold hover:text-cinestar-yellow">KHUYẾN MÃI</Link>
                  <Link href="/" className="text-lg font-bold hover:text-cinestar-yellow">THÀNH VIÊN</Link>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Cinestar"
                width={150}
                height={70}
                priority

              />
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-6" style={{ paddingLeft: '100px' }}>
              <Link href="/movie" className="flex items-center gap-1 font-semibold hover:text-cinestar-yellow">
                <Button variant="custom1" size="sm" width="custom1" style={{ height: '40px' }}>
                  <Image
                    src="/images/ic-ticket.svg"
                    alt="Ticket Icon"
                    width={20}
                    height={20}
                  />
                  ĐẶT VÉ NGAY
                </Button>
              </Link>
              <Link href="/popcorn-drink" className="flex items-center gap-1 font-semibold hover:text-cinestar-yellow">
                <Button variant="custom2" size="sm" width="custom1" style={{ height: '40px' }}>
                  <Image
                    src="/images/ic-ticket.svg"
                    alt="Ticket Icon"
                    width={20}
                    height={20}
                  />
                  ĐẶT BẮP NƯỚC
                </Button>
              </Link>
            </nav>
          </div>

          {/* Search and location */}
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Input
                type="search"
                placeholder="Tìm phim, rạp..."
                className="bg-white text-black pl-5 pr-9 py-1 rounded-full w-251px h-40px"
              />
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500" />
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="flex items-center gap-1">
                <User size={16} />
                Đăng nhập
              </Link>
              <div className="flex items-center gap-1">
                <Image
                  src="/images/header-vietnam.svg"
                  alt="Vietnam Icon"
                  width={20}
                  height={20}
                />
                <span className="inline-block">VN</span>
                <FaCaretDown className="inline-block" />

              </div>
            </div>


          </div>
        </div>

        {/* Secondary navigation */}
        {/* goi lai menuitem */}
        <div className="hidden md:flex items-center justify-between py-2 border-t border-gray-700">
          
            <div className="flex items-start gap-6">
            {menuItems.map((item: { href: string; label: string }) => (
              <div key={item.href} className="flex items-center gap-2 hover:text-cinestar-yellow pb-3">
              <FaLocationDot />
              <Link
                href={item.href}
                className="text-sm font-semibold "
              >
                {item.label}
              </Link>
              </div>
            ))}
            </div>
          <div className="flex items-center gap-6">
            {menuItems2.map((item: { href: string; label: string }) => (
                <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold hover:text-cinestar-yellow hover:underline pb-3"
                >
              {item.label}
                </Link>
            ))}
          </div>
          </div>
        
    </header>
  );
}
