// src/app/api/seat-locks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SeatLockingService } from '@/services/SeatLockingService';
// Removed WebSocket broadcasting - using database polling only



export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { showtimeId, seatId, sessionId } = body;

        if (!showtimeId || !seatId || !sessionId) {
            return NextResponse.json({
                success: false,
                error: 'Missing required parameters'
            }, { status: 400 });
        }

        // Use SeatLockingService for business logic
        const result = await SeatLockingService.lockSeat(showtimeId, seatId, sessionId);

        if (!result.success) {
            return NextResponse.json({
                success: false,
                error: result.error,
                errorCode: result.errorCode
            }, { status: result.errorCode === 'SEAT_LOCKED' ? 409 : 400 });
        }

        // Database-only approach - no broadcasting needed

        return NextResponse.json({
            success: true,
            message: 'Seat locked successfully',
            data: {
                expiresAt: result.data?.expiresAt,
                seatId: result.data?.seatId,
                seatDbId: result.data?.seatDbId,
                isNewLock: result.data?.isNewLock
            }
        });

    } catch (error) {
        console.error('Error locking seat:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to lock seat'
        }, { status: 500 });
    }
}

// src/app/api/seat-locks/route.ts
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const showtimeId = searchParams.get('showtimeId');
        const seatId = searchParams.get('seatId');
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({
                success: false,
                error: 'Session ID is required'
            }, { status: 400 });
        }

        if (showtimeId && seatId) {
            // Unlock specific seat using SeatLockingService
            const result = await SeatLockingService.unlockSeat(showtimeId, seatId, sessionId);

            if (!result.success) {
                return NextResponse.json({
                    success: false,
                    error: result.error,
                    errorCode: result.errorCode
                }, { status: 400 });
            }

            // Database-only approach - no broadcasting needed
        } else {
            // Unlock all seats for session
            const result = await SeatLockingService.unlockAllSeats(sessionId);

            if (!result.success) {
                return NextResponse.json({
                    success: false,
                    error: 'Failed to unlock seats'
                }, { status: 500 });
            }

            console.log(`🔓 Unlocked ${result.unlockedCount} seats for session ${sessionId}`);
        }

        return NextResponse.json({
            success: true,
            message: 'Lock removed successfully'
        });

    } catch (error) {
        console.error('Error removing seat lock:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to remove seat lock'
        }, { status: 500 });
    }
}