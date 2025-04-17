import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Billiard - Cinestar",
    description: "Thỏa sức thể hiện tài năng ca hát của bạn tại Karaoke CineStar!",
};

export default function BilliardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="billiard-section">
            {children}
        </section>
    );
}