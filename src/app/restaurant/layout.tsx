import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Nhà hàng - Cinestar",
    description: "Bắt tay vào cuộc phiêu lưu ẩm thực tại Món Ngon Đà Lạt & Huế!",
};

export default function RestaurantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="restaurant-section">
            {children}
        </section>
    );
}