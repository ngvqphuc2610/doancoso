import { NextRequest, NextResponse } from 'next/server';
import { SeatLockingService } from '@/services/SeatLockingService';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const showtimeId = searchParams.get('showtimeId');

        if (!showtimeId) {
            return NextResponse.json({
                success: false,
                error: 'Showtime ID is required'
            }, { status: 400 });
        }

        // Use SeatLockingService for business logic
        const result = await SeatLockingService.getSeatStatus(showtimeId);

        if (!result.success) {
            return NextResponse.json({
                success: false,
                error: result.error || 'Failed to get seat status'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: result.data
        });

    } catch (error) {
        console.error('Error getting seat status:', error);

        // Return detailed error for debugging
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return NextResponse.json({
            success: false,
            error: 'Failed to get seat status',
            details: errorMessage,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
