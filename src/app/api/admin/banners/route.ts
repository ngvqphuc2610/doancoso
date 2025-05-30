import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export interface HomepageBanner {
    id_banner: number;
    id_movie: number;
    title: string;
    description: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Movie details
    movie_title: string;
    movie_poster: string | null;
    movie_banner: string | null;
    movie_status: string;
}

// GET - Lấy danh sách banners
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active') === 'true';

        let sql = `
            SELECT 
                hb.*,
                m.title as movie_title,
                m.poster_image as movie_poster,
                m.banner_image as movie_banner,
                m.status as movie_status
            FROM homepage_banners hb
            JOIN movies m ON hb.id_movie = m.id_movie
        `;

        if (activeOnly) {
            sql += ' WHERE hb.is_active = TRUE';
        }

        sql += ' ORDER BY hb.display_order ASC, hb.created_at DESC';

        const banners = await query(sql) as HomepageBanner[];

        return NextResponse.json({
            success: true,
            data: banners
        });

    } catch (error: any) {
        console.error('Error fetching banners:', error);
        return NextResponse.json(
            { success: false, message: `Lỗi khi lấy danh sách banner: ${error.message}` },
            { status: 500 }
        );
    }
}

// POST - Tạo banner mới
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id_movie, title, description, display_order, is_active } = body;

        // Validate required fields
        if (!id_movie || !title) {
            return NextResponse.json(
                { success: false, message: 'Movie ID và title là bắt buộc' },
                { status: 400 }
            );
        }

        // Kiểm tra movie có tồn tại không
        const movieExists = await query(
            'SELECT id_movie FROM movies WHERE id_movie = ?',
            [id_movie]
        ) as any[];

        if (movieExists.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Movie không tồn tại' },
                { status: 400 }
            );
        }

        // Nếu set active, deactivate banner cũ của movie này
        if (is_active) {
            await query(
                'UPDATE homepage_banners SET is_active = FALSE WHERE id_movie = ? AND is_active = TRUE',
                [id_movie]
            );
        }

        // Tạo banner mới
        const result = await query(`
            INSERT INTO homepage_banners (id_movie, title, description, display_order, is_active)
            VALUES (?, ?, ?, ?, ?)
        `, [id_movie, title, description || null, display_order || 1, is_active || true]) as any;

        return NextResponse.json({
            success: true,
            message: 'Banner đã được tạo thành công',
            data: { id_banner: result.insertId }
        });

    } catch (error: any) {
        console.error('Error creating banner:', error);
        return NextResponse.json(
            { success: false, message: `Lỗi khi tạo banner: ${error.message}` },
            { status: 500 }
        );
    }
}

// PUT - Cập nhật banner
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id_banner, id_movie, title, description, display_order, is_active } = body;

        if (!id_banner) {
            return NextResponse.json(
                { success: false, message: 'Banner ID là bắt buộc' },
                { status: 400 }
            );
        }

        // Nếu set active, deactivate banner cũ của movie này
        if (is_active && id_movie) {
            await query(
                'UPDATE homepage_banners SET is_active = FALSE WHERE id_movie = ? AND is_active = TRUE AND id_banner != ?',
                [id_movie, id_banner]
            );
        }

        // Cập nhật banner
        await query(`
            UPDATE homepage_banners 
            SET id_movie = ?, title = ?, description = ?, display_order = ?, is_active = ?
            WHERE id_banner = ?
        `, [id_movie, title, description, display_order, is_active, id_banner]);

        return NextResponse.json({
            success: true,
            message: 'Banner đã được cập nhật thành công'
        });

    } catch (error: any) {
        console.error('Error updating banner:', error);
        return NextResponse.json(
            { success: false, message: `Lỗi khi cập nhật banner: ${error.message}` },
            { status: 500 }
        );
    }
}

// DELETE - Xóa banner
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id_banner = searchParams.get('id');

        if (!id_banner) {
            return NextResponse.json(
                { success: false, message: 'Banner ID là bắt buộc' },
                { status: 400 }
            );
        }

        await query('DELETE FROM homepage_banners WHERE id_banner = ?', [id_banner]);

        return NextResponse.json({
            success: true,
            message: 'Banner đã được xóa thành công'
        });

    } catch (error: any) {
        console.error('Error deleting banner:', error);
        return NextResponse.json(
            { success: false, message: `Lỗi khi xóa banner: ${error.message}` },
            { status: 500 }
        );
    }
}
