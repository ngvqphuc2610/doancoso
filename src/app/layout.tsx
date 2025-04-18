import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import I18nProvider from "./i18n/Provider";
import Providers from "./i18n/Provider";
import LanguageProvider from "@/components/providers/LanguageProvider";

export const metadata: Metadata = {
  icons: {
    icon: "/images/logo-meta.png",
  },
  title: "Cinestar - Hệ thống rạp chiếu phim giá rẻ, hiện đại bậc nhất",
  description: "Hệ thống rạp chiếu phim Cinestar phục vụ khán giả với những thước phim điện ảnh chất lượng, dịch vụ tốt nhất với giá vé chỉ từ 45.000đ. Đặt vé ngay hôm nay để nhận được những ưu đãi bất ngờ từ Cinestar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
    
        <I18nProvider>
          <Providers>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </Providers>
        </I18nProvider>
      
      </body>
    </html>
  );
}
