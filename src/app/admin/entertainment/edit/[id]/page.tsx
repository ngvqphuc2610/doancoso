import { Entertainment } from '@/lib/types/database';
import { query } from '@/lib/db';
import EditEnterClient from './EditEnterClient';

async function getEntertainment(id: string): Promise<Entertainment | null> {
    try {
        const entertainments = await query<Entertainment[]>(
            `SELECT * FROM entertainment WHERE id_entertainment = ?`,
            [parseInt(id)]
        );

        if (!entertainments.length) return null;

        return entertainments[0];
    } catch (error) {
        console.error("Lỗi khi lấy thông tin giải trí:", error);
        return null;
    }
}

export default async function EditEntertainmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const entertainment = await getEntertainment(id);

    if (!entertainment) {
        return <div className="p-6 text-red-500">Không tìm thấy mục giải trí</div>;
    }

    return <EditEnterClient entertainment={entertainment} />;
}