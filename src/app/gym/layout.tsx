import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gym - Cinestar",
    description: "Đạt được mục tiêu thể hình của bạn tại C Gym - Đà Lạt & Thành phố Hồ Chí Minh!",
};

export default function GymLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="gym-section">
            {children}
        </section>
    );
}