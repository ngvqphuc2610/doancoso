import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/db';

// Route để lấy chi tiết một rạp
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const cinemas = await query(`
            SELECT * FROM cinemas WHERE id_cinema = ?
        `, [id]);

        if (!cinemas || (cinemas as any[]).length === 0) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy rạp chiếu' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: (cinemas as any[])[0]
        });
    } catch (error: any) {
        const { id } = await params;
        console.error(`Error fetching cinema ${id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể tải thông tin rạp chiếu' },
            { status: 500 }
        );
    }
}

// Route để cập nhật thông tin rạp
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Validate cinema exists
        const existingCinema = await query(`
            SELECT id_cinema FROM cinemas WHERE id_cinema = ?
        `, [id]);

        if (!existingCinema || (existingCinema as any[]).length === 0) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy rạp chiếu' },
                { status: 404 }
            );
        }

        // Update cinema
        const { cinema_name, address, city, contact_number, status } = body;

        await query(`
            UPDATE cinemas
            SET cinema_name = ?, address = ?, city = ?, contact_number = ?, status = ?
            WHERE id_cinema = ?
        `, [cinema_name, address, city, contact_number, status, id]);

        return NextResponse.json({
            success: true,
            message: 'Cập nhật rạp chiếu thành công'
        });
    } catch (error: any) {
        const { id } = await params;
        console.error(`Error updating cinema ${id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật thông tin rạp chiếu' },
            { status: 500 }
        );
    }
}

// Route để xóa rạp
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Validate cinema exists
        const existingCinema = await query(`
            SELECT id_cinema FROM cinemas WHERE id_cinema = ?
        `, [id]);

        if (!existingCinema || (existingCinema as any[]).length === 0) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy rạp chiếu' },
                { status: 404 }
            );
        }

        // Check if cinema has screens (foreign key constraint)
        const screens = await query(`
            SELECT id_screen FROM screen WHERE id_cinema = ?
        `, [id]);

        if (screens && (screens as any[]).length > 0) {
            return NextResponse.json(
                { success: false, message: 'Không thể xóa rạp chiếu vì còn có phòng chiếu' },
                { status: 400 }
            );
        }

        // Delete cinema
        await query(`
            DELETE FROM cinemas WHERE id_cinema = ?
        `, [id]);

        return NextResponse.json({
            success: true,
            message: 'Xóa rạp chiếu thành công'
        });
    } catch (error: any) {
        const { id } = await params;
        console.error(`Error deleting cinema ${id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể xóa rạp chiếu' },
            { status: 500 }
        );
    }
}

// Route để cập nhật trạng thái rạp (PATCH)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Validate cinema exists
        const existingCinema = await query(`
            SELECT id_cinema FROM cinemas WHERE id_cinema = ?
        `, [id]);

        if (!existingCinema || (existingCinema as any[]).length === 0) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy rạp chiếu' },
                { status: 404 }
            );
        }

        // Update only the fields provided in body
        const updates: string[] = [];
        const values: any[] = [];

        if (body.status !== undefined) {
            updates.push('status = ?');
            values.push(body.status);
        }

        if (body.cinema_name !== undefined) {
            updates.push('cinema_name = ?');
            values.push(body.cinema_name);
        }

        if (body.address !== undefined) {
            updates.push('address = ?');
            values.push(body.address);
        }

        if (body.city !== undefined) {
            updates.push('city = ?');
            values.push(body.city);
        }

        if (body.contact_number !== undefined) {
            updates.push('contact_number = ?');
            values.push(body.contact_number);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Không có trường nào để cập nhật' },
                { status: 400 }
            );
        }

        values.push(id);

        await query(`
            UPDATE cinemas SET ${updates.join(', ')} WHERE id_cinema = ?
        `, values);

        return NextResponse.json({
            success: true,
            message: 'Cập nhật rạp chiếu thành công'
        });
    } catch (error: any) {
        const { id } = await params;
        console.error(`Error updating cinema status ${id}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật trạng thái rạp chiếu' },
            { status: 500 }
        );
    }
}
