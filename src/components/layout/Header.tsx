import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, Search, User } from 'lucide-react';

export default function Header() {
  const menuItems = [
    { href: "/chonrap", label: "Chọn rạp" },
    { href: "/showtimes", label: "Lịch chiếu" },
    { href: "/chuong-trinh-khuyen-mai", label: "Khuyến mãi" },
    { href: "/to-chuc-su-kien", label: "Thuê sự kiện" },
    { href: "/cac-loai-hinh-giai-tri-khac", label: "Tất cả các giải trí" },
    { href: "/about-us", label: "Giới thiệu" },
  ];

  return (
    <header className="bg-cinestar-darkblue text-white">
      <div className="container mx-auto px-4 py-2">
        {/* Mobile app banner */}


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
                  <Link href="/" className="text-lg font-bold hover:text-cinestar-yellow">Trang chủ</Link>
                  <Link href="/movie" className="text-lg font-bold hover:text-cinestar-yellow">Phim</Link>
                  <Link href="/showtimes" className="text-lg font-bold hover:text-cinestar-yellow">Lịch chiếu</Link>
                  <Link href="/about-us" className="text-lg font-bold hover:text-cinestar-yellow">Giới thiệu</Link>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Cinestar"
                width={150}
                height={40}
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-6" style={{ paddingLeft: '200px' }}>
              <Link href="/movie" className="flex items-center gap-1 font-semibold hover:text-cinestar-yellow">
               <Button  style={{height: '40px'}}>
                <svg  width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0C4.486 0 0 4.486 0 10C0 15.514 4.486 20 10 20C15.514 20 20 15.514 20 10C20 4.486 15.514 0 10 0ZM8 14.5V5.5L14 10L8 14.5Z" fill="#EBDB40" />
                </svg>
                Đặt Vé Ngay
                </Button>
              </Link>
              <Link href="/popcorn-drink" className="flex items-center gap-1 font-semibold hover:text-cinestar-yellow">
                <Button style={{height: '40px'}}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 6H16V5C16 3.9 15.1 3 14 3H6C4.9 3 4 3.9 4 5V6H3C2.45 6 2 6.45 2 7V8C2 10.21 3.79 12 6 12H7V19H13V12H14C16.21 12 18 10.21 18 8V7C18 6.45 17.55 6 17 6ZM6 5H14V6H6V5ZM14 10H6C4.9 10 4 9.1 4 8H16C16 9.1 15.1 10 14 10Z" fill="#EBDB40" />
                </svg>
                Đặt Bắp Nước
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
              className="bg-white text-black pl-7 pr-9 py-1 rounded-full w-251px h-40px"
              />
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500" />
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="flex items-center gap-1">
                <User size={16} />
                Đăng nhập
              </Link>
              <div className="flex items-center gap-1">
                <span>VN</span>
                <span className="text-gray-500">|</span>
                <span>ENG</span>
              </div>
            </div>


          </div>
        </div>

        {/* Secondary navigation */}
        {/* goi lai menuitem */}
        <div className="hidden md:flex items-center justify-center gap-6 py-2 border-t border-gray-700">
          {menuItems.map((item: { href: string; label: string }) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold hover:text-cinestar-yellow"
            >
              {item.label}
            </Link>
          ))}
        </div>

      </div>
    </header>
  );
}
