import { NextRequest, NextResponse } from 'next/server';
import { updateMovie } from '@/lib/movieDb';

export async function POST(request: NextRequest) {
    try {
        const testData = {
            title: "Test Movie Update 2",
            banner_url: "https://image.tmdb.org/t/p/w1280/new-banner-test.jpg",
            poster_url: "https://image.tmdb.org/t/p/w500/test-poster.jpg"
        };

        console.log('🧪 Testing movie update with data:', testData);

        // Test update movie ID 42
        const result = await updateMovie(42, testData);

        return NextResponse.json({
            success: true,
            message: 'Test update completed',
            result,
            testData
        });

    } catch (error: any) {
        console.error('Test update error:', error);
        return NextResponse.json(
            { success: false, message: `Lỗi: ${error.message}` },
            { status: 500 }
        );
    }
}
