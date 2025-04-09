import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-cinestar-purple text-white pt-8 pb-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo and social */}
          <div className="col-span-1">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Cinestar"
                width={150}
                height={40}
                className="h-10 w-auto mb-4"
              />
            </Link>
            <p className="text-sm font-light mb-4">BE HAPPY. BE A STAR</p>
            <div className="flex gap-4 mb-4">
              <Link href="/movie" className="cinestar-button text-sm py-1 px-4 ">

                ĐẶT VÉ
              </Link>
              <Link href="/popcorn-drink" className="bg-transparent border border-white text-white font-bold px-4 py-1 rounded hover:bg-white/10 transition-colors text-sm">
                ĐẶT BẮP NƯỚC
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="https://facebook.com/cinestar" target="_blank" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="https://youtube.com/cinestar" target="_blank" aria-label="Youtube">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="https://tiktok.com/cinestar" target="_blank" aria-label="TikTok">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5 3.5H11C11 4.9 9.9 6 8.5 6H8V8.5H8.5C10.4 8.5 12 6.9 12 5V11C12 12.7 10.7 14 9 14H7C5.3 14 4 12.7 4 11V5C4 3.3 5.3 2 7 2H13.5V3.5Z" fill="white" />
                </svg>
              </Link>
              <Link href="https://zalo.me/cinestar" target="_blank" aria-label="Zalo">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM12 10.6C12 10.9 11.8 11.1 11.5 11.1H4.5C4.2 11.1 4 10.9 4 10.6V5.4C4 5.1 4.2 4.9 4.5 4.9H11.5C11.8 4.9 12 5.1 12 5.4V10.6Z" fill="white" />
                  <path d="M10.3 6.3H8.9V8.5H10.3C10.7 8.5 11 8.2 11 7.8V7C11 6.6 10.7 6.3 10.3 6.3Z" fill="white" />
                  <path d="M7.7 8.5H6.3V6.3H7.7C8.1 6.3 8.4 6.6 8.4 7V7.8C8.4 8.2 8.1 8.5 7.7 8.5Z" fill="white" />
                  <path d="M5.1 6.3H5.7V8.5H5.1C4.7 8.5 4.4 8.2 4.4 7.8V7C4.4 6.6 4.7 6.3 5.1 6.3Z" fill="white" />
                </svg>
              </Link>
            </div>
            <div className="text-xs mt-4 opacity-80">
              Ngôn ngữ <span className="text-cinestar-yellow font-bold">VN</span>
            </div>
          </div>

          {/* Account */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold uppercase mb-4">Tài khoản</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-cinestar-yellow">Đăng nhập</Link></li>
              <li><Link href="/register" className="hover:text-cinestar-yellow">Đăng ký</Link></li>
              <li><Link href="/membership" className="hover:text-cinestar-yellow">Membership</Link></li>
            </ul>
          </div>

          {/* Events */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold uppercase mb-4">Thuê sự kiện</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/rent" className="hover:text-cinestar-yellow">Thuê rạp</Link></li>
              <li><Link href="/corporate-events" className="hover:text-cinestar-yellow">Các loại hình cho thuê khác</Link></li>
            </ul>
          </div>

          {/* Cinemas */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold uppercase mb-4">Xem Phim</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/movie/showing" className="hover:text-cinestar-yellow">Phim đang chiếu</Link></li>
              <li><Link href="/movie/coming-soon" className="hover:text-cinestar-yellow">Phim sắp chiếu</Link></li>
              <li><Link href="/special-screenings" className="hover:text-cinestar-yellow">Suất chiếu đặc biệt</Link></li>
            </ul>
          </div>

          {/* Cinema Chain */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold uppercase mb-4">Cinestar</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about-us" className="hover:text-cinestar-yellow">Giới thiệu</Link></li>
              <li><Link href="/contact" className="hover:text-cinestar-yellow">Liên hệ</Link></li>
              <li><Link href="/careers" className="hover:text-cinestar-yellow">Tuyển dụng</Link></li>
            </ul>
          </div>
        </div>

        {/* Theaters */}
        <div className="mt-8 border-t border-white/20 pt-8">
          <h3 className="text-sm font-bold uppercase mb-4">Hệ thống rạp</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ul className="space-y-2 text-sm">
              <li><Link href="/theaters/quoc-thanh" className="hover:text-cinestar-yellow">Cinestar Quốc Thanh (TP.HCM)</Link></li>
              <li><Link href="/theaters/hai-ba-trung" className="hover:text-cinestar-yellow">Cinestar Hai Bà Trưng (TP.HCM)</Link></li>
              <li><Link href="/theaters/sinh-vien" className="hover:text-cinestar-yellow">Cinestar Sinh Viên (Bình Dương)</Link></li>
            </ul>
            <ul className="space-y-2 text-sm">
              <li><Link href="/theaters/my-tho" className="hover:text-cinestar-yellow">Cinestar Mỹ Tho (Tiền Giang)</Link></li>
              <li><Link href="/theaters/kien-giang" className="hover:text-cinestar-yellow">Cinestar Kiên Giang (Rạch Sỏi)</Link></li>
              <li><Link href="/theaters/lam-dong" className="hover:text-cinestar-yellow">Cinestar Lâm Đồng (Đức Trọng)</Link></li>
            </ul>
            <ul className="space-y-2 text-sm">
              <li><Link href="/theaters/da-lat" className="hover:text-cinestar-yellow">Cinestar Đà Lạt (TP Đà Lạt)</Link></li>
              <li><Link href="/theaters/hue" className="hover:text-cinestar-yellow">Cinestar Huế (TP Huế)</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-white/20 pt-4 text-xs text-center opacity-80">
          <p>© 2023 Cinestar. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/privacy-policy">Chính sách bảo mật</Link>
            <Link href="/terms-conditions">Tin điện ảnh</Link>
            <Link href="/faq">Hỏi và đáp</Link>
          </div>
        </div>

        {/* Certification */}
        <div className="mt-4 flex justify-center items-center">
          <Image
            src="https://ext.same-assets.com/3413067433/2584682623.webp"
            alt="Logo Certification"
            width={100}
            height={40}
            className="h-10 w-auto"
          />
          <Image
            src="https://ext.same-assets.com/559967533/1193832742.webp"
            alt="Đã thông báo"
            width={120}
            height={45}
            className="h-12 w-auto"
          />
        </div>

        {/* Company info */}
        <div className="mt-4 text-center text-xs opacity-80 max-w-4xl mx-auto">
          <p>CÔNG TY CỔ PHẦN GIẢI TRÍ PHÁT HÀNH PHIM - RẠP CHIẾU PHIM NGÔI SAO</p>
          <p>ĐỊA CHỈ: 135 HAI BÀ TRƯNG, PHƯỜNG BẾN NGHÉ, QUẬN 1, TP.HCM</p>
          <p>GIẤY CHỨNG NHẬN ĐĂNG KÝ KINH DOANH SỐ: 0312742804, ĐĂNG KÝ THAY ĐỔI LẦN THỨ 2 NGÀY 15/09/2014, CẤP BỞI SỞ KH&ĐT TP.HCM</p>
        </div>
      </div>
    </footer>
  );
}
