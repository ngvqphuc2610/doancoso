import { NextRequest, NextResponse } from 'next/server';
import { syncMoviesFromTMDB } from '@/services/movieSyncService';

// Route để đồng bộ phim từ TMDB API vào database
export async function POST(req: NextRequest) {
    try {
        console.log('Đang bắt đầu đồng bộ phim từ TMDB API...');

        // Sử dụng hàm syncMoviesFromTMDB trực tiếp
        const result = await syncMoviesFromTMDB();

        console.log('Kết quả đồng bộ phim:', result);

        return NextResponse.json({
            success: true,
            message: 'Đồng bộ phim thành công',
            data: result
        });
    } catch (error) {
        console.error('Error syncing movies from TMDB:', error);

        return NextResponse.json({
            success: false,
            message: 'Đã xảy ra lỗi khi đồng bộ phim từ TMDB',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}