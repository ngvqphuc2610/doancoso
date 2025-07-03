'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, Search, User } from 'lucide-react';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { FaLocationDot } from "react-icons/fa6";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../language/LanguageSwitcher';
import { Cinema, getAllCinemas } from '@/lib/cinema';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [cinemaList, setCinemaList] = useState<Cinema[]>([]);
  const { user, logout, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch cinemas on component mount
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const cinemas = await getAllCinemas();
        setCinemaList(cinemas);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách rạp:", error);
      }
    };

    fetchCinemas();
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const menuItems = [
    {
      href: "#",
      label: t('menu.chooseTheater'),
      hasDropdown: true,
    },
    { href: "/showtimes/", label: t('menu.schedule') },
  ];

  const menuItems2 = [
    { href: "/chuong-trinh-khuyen-mai", label: t('menu.promotion') },
    { href: "/to-chuc-su-kien", label: t('menu.events') },
    { href: "/cac-loai-hinh-giai-tri-khac", label: t('menu.entertainment') },
    { href: "/about-us", label: t('menu.about') },
  ];

  return (
    <header className="bg-cinestar-darkblue text-white sticky top-0 right-0 w-full z-50 shadow-md">
      <div className="container mx-auto px-4 py-2">
        {/* Mobile app banner */}
        {/* Closing tag for the container */}
      </div>

      {/* giao dien mobile */}
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
                <Link href="#" className="text-lg font-bold hover:text-cinestar-yellow">{t('navigation.home')}</Link>
                <Link href="/movie" className="text-lg font-bold hover:text-cinestar-yellow">{t('header.bookTicket')}</Link>
                <Link href="/popcorn-drink" className="text-lg font-bold hover:text-cinestar-yellow">{t('header.bookSnacks')}</Link>
                <Link href="/showtimes" className="text-lg font-bold hover:text-cinestar-yellow">{t('navigation.showtimes')}</Link>
                <Link href="/promotions" className="text-lg font-bold hover:text-cinestar-yellow">{t('navigation.promotion')}</Link>
                <Link href="/membership" className="text-lg font-bold hover:text-cinestar-yellow">{t('navigation.membership')}</Link>
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
                {t('header.bookTicket')}
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
                {t('header.bookSnacks')}
              </Button>
            </Link>
          </nav>
        </div>

        {/* Search and location */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Input
              type="search"
              placeholder={t('header.search')}
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="bg-white text-black pl-5 pr-9 py-1 rounded-full w-[250px] h-[40px]"
            />
            <button type="submit" className="absolute right-2.5 top-2.5">
              <Search className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </button>
          </form>
          <div className="flex items-center gap-4 ">
            {isAuthenticated() ? (
              <div className="flex items-center gap-2 pl-7">
                <div className="relative group">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <User size={16} />
                    <span className="text-sm font-medium">{user?.fullName || user?.username}</span>
                  </div>
                  {/* Dropdown menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white text-black rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm text-gray-600">Xin chào,</p>
                        <p className="font-medium text-gray-800">{user?.fullName || user?.username}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      {user?.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        >
                          Quản trị
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                      >
                        Thông tin cá nhân
                      </Link>
                      <Link
                        href="/booking-history"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                      >
                        Lịch sử đặt vé
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-1 pl-7">
                <User size={16} />
                {t('header.login')}
              </Link>
            )}
            <LanguageSwitcher className="pl-7" />
          </div>
        </div>
      </div>

      {/* Secondary navigation */}
      <div className="hidden md:flex items-center justify-between py-2 border-t border-gray-700">
        <div className="flex items-start gap-6">
          {menuItems.map((item) => (
            item.hasDropdown ? (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className="flex items-center gap-2 hover:text-cinestar-yellow pb-3"
                >
                  <FaLocationDot className="text-cinestar-yellow" />
                  <span className="text-sm font-semibold">{item.label}</span>
                </Link>
                {/* Dropdown menu wrapper */}
                <div className="hidden group-hover:block absolute left-0 w-screen bg-cinestar-darkblue shadow-lg z-40"
                  style={{ transform: 'translateX(calc((100vw - 100%) / -2))' }}>
                  <div className="container -mx-2">
                    <ul className="grid grid-cols-3 gap-4 py-6">
                      {cinemaList.map((cinema) => (
                        <li key={cinema.id}>
                          <Link
                            href={`/chonrap/${cinema.id}`}
                            className="block px-2 py-3 text-sm text-white hover:text-cinestar-yellow transition-colors duration-200 border-l-2 border-transparent hover:border-cinestar-yellow"
                          >
                            {cinema.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 hover:text-cinestar-yellow pb-3"
              >
                <FaLocationDot className="text-cinestar-yellow" />
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            )
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
