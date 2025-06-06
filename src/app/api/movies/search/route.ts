import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/db';

export async function GET(request: NextRequest) {
    try {
        const urlSearchParams = request.nextUrl.searchParams;
        const searchQuery = urlSearchParams.get('q');
        const statusFilter = urlSearchParams.get('status');
        const limit = parseInt(urlSearchParams.get('limit') || '10');

        if (!searchQuery || searchQuery.trim().length < 1) {
            return NextResponse.json({
                success: false,
                message: 'Search query is required'
            }, { status: 400 });
        }

        // Tìm kiếm với filter status đơn giản
        const searchTerm = `%${searchQuery.trim()}%`;

        let searchResults;
        if (statusFilter && statusFilter !== 'all') {
            // Có filter status
            searchResults = await query(
                'SELECT id_movie, title, poster_image, status, release_date, duration, director, actors, country, age_restriction, description FROM movies WHERE title LIKE ? AND status = ? LIMIT 10',
                [searchTerm, statusFilter]
            );
        } else {
            // Không có filter status
            searchResults = await query(
                'SELECT id_movie, title, poster_image, status, release_date, duration, director, actors, country, age_restriction, description FROM movies WHERE title LIKE ? LIMIT 10',
                [searchTerm]
            );
        }

        let countResult;
        if (statusFilter && statusFilter !== 'all') {
            countResult = await query(
                'SELECT COUNT(*) as total FROM movies WHERE title LIKE ? AND status = ?',
                [searchTerm, statusFilter]
            );
        } else {
            countResult = await query(
                'SELECT COUNT(*) as total FROM movies WHERE title LIKE ?',
                [searchTerm]
            );
        }

        const total = Array.isArray(countResult) && countResult.length > 0
            ? (countResult[0] as any).total
            : 0;

        return NextResponse.json({
            success: true,
            data: searchResults || [],
            pagination: {
                total,
                limit,
                offset: 0,
                hasMore: limit < total
            },
            query: searchQuery
        });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to search movies'
        }, { status: 500 });
    }
}
