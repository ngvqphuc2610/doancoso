import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Bowling - Cinestar",
    description: "Tận hưởng niềm vui tại C'Bowling - Thành phố Đà Lạt & Huế!",
};

export default function BowlingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="bowling-section">
            {children}
        </section>
    );
}