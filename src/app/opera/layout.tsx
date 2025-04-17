import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Opera House - Cinestar",
    description: "Chứng kiến sự hùng vĩ ở trung tâm thành phố",
};

export default function OperaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="opera-section">
            {children}
        </section>
    );
}