import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface TicketType {
    id_tickettype: number;
    type_name: string;
    description: string | null;
    price_multiplier: number;
    age_min: number | null;
    age_max: number | null;
    required_id: number;
    icon_url: string | null;
    status: string;
    fixed_price: number | null;
}

export async function GET(request: NextRequest) {
    try {
        // Thêm xử lý query param nếu cần lọc dữ liệu
        const searchParams = request.nextUrl.searchParams;
        const showAll = searchParams.get('showAll') === 'true';

        // Điều chỉnh câu query dựa theo param
        const sql = `
      SELECT 
        id_tickettype,
        type_name,
        description,
        price_multiplier,
        age_min,
        age_max,
        required_id,
        icon_url,
        status,
        fixed_price
      FROM ticket_type
      ${showAll ? '' : "WHERE status = 'active'"}
      ORDER BY ${searchParams.get('sort') === 'price' ? 'fixed_price' : 'price_multiplier'} ASC
    `;

        const ticketTypes = await query<TicketType[]>(sql, []);

        // Thêm meta data cho response
        return NextResponse.json({
            success: true,
            data: ticketTypes,
            meta: {
                count: ticketTypes.length,
                timestamp: new Date().toISOString()
            }
        }, {
            status: 200,
            headers: {
                'Cache-Control': 'max-age=60, stale-while-revalidate=300' // Cache trong 1 phút, cho phép dùng cache cũ trong 5 phút nếu cần
            }
        });
    } catch (error) {
        console.error('Error fetching ticket types:', error);
        return NextResponse.json({
            success: false,
            error: 'Lỗi khi tải dữ liệu loại vé',
            details: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        }, {
            status: 500,
        });
    }
}