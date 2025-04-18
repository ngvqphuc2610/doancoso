import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kidzone - Cinestar",
    description: "Khu vui chơi trong nhà dành cho trẻ em tại Cinestar",
};

export default function KidzoneLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="kidzone-section">
            {children}
        </section>
    );
}