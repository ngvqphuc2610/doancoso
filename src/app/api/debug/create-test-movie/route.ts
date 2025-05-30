import { NextRequest, NextResponse } from 'next/server';
import { createMovie } from '@/lib/movieDb';

export async function POST(request: NextRequest) {
    try {
        
        console.log('🎬 Creating test movie with banner:', testMovieData);

        const result = await createMovie(testMovieData);

        return NextResponse.json({
            success: true,
            message: 'Test movie created successfully',
            result,
            movieData: testMovieData
        });

    } catch (error: any) {
        console.error('Error creating test movie:', error);
        return NextResponse.json(
            { success: false, message: `Lỗi: ${error.message}` },
            { status: 500 }
        );
    }
}
