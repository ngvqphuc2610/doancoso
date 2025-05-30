import { NextRequest, NextResponse } from 'next/server';
import { getAllMovies, createMovie } from '@/lib/movieDb';
import { query } from '@/config/db';

// Route để lấy danh sách phim từ database với search và filter
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const offset = (page - 1) * limit;

        // Build query conditions
        let whereConditions = [];
        let queryParams: any[] = [];

        if (status && status !== 'all') {
            whereConditions.push('status = ?');
            queryParams.push(status);
        }

        if (search) {
            whereConditions.push('(title LIKE ? OR description LIKE ?)');
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM movies ${whereClause}`;
        const countResult = await query(countQuery, queryParams);
        const total = (countResult as any[])[0]?.total || 0;

        // Get movies with pagination
        const moviesQuery = `
            SELECT
                id_movie,
                title,
                original_title,
                director,
                actors,
                duration,
                release_date,
                end_date,
                language,
                subtitle,
                country,
                description,
                poster_image,
                trailer_url,
                age_restriction,
                status
            FROM movies
            ${whereClause}
            ORDER BY release_date DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const movies = await query(moviesQuery, queryParams);

        return NextResponse.json({
            success: true,
            data: {
                movies,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error: any) {
        console.error('Error fetching movies:', error.message);

        return NextResponse.json(
            {
                success: false,
                message: 'Không thể tải danh sách phim',
                error: error.message
            },
            { status: 500 }
        );
    }
}

// Route để thêm phim mới vào database
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.title) {
            return NextResponse.json(
                { success: false, message: 'Tiêu đề phim là bắt buộc' },
                { status: 400 }
            );
        }

        // Sử dụng hàm createMovie từ movieDb.ts
        const result = await createMovie(body);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Thêm phim mới thành công',
                movieId: result.movieId
            });
        } else {
            return NextResponse.json(
                { success: false, message: result.message || 'Không thể tạo phim mới' },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error('Error creating movie:', error.message);

        return NextResponse.json(
            {
                success: false,
                message: 'Không thể tạo phim mới',
                error: error.message
            },
            { status: 500 }
        );
    }
}