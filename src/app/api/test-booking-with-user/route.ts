import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('📝 Test booking with user ID:', JSON.stringify(body, null, 2));

        // Test booking data with user ID
        const testBookingData = {
            customerInfo: {
                name: "Test User",
                email: "test@example.com", 
                phone: "0123456789",
                id_users: 1, // Test with user ID 1
                agreeToTerms: true,
                agreeToPromotions: false
            },
            showtimeId: 17,
            selectedSeats: ["A01", "A02"],
            ticketInfo: { 2: 2 }, // 2 adult tickets
            productInfo: { 1: 1 }, // 1 product
            totalPrice: 200000,
            paymentMethod: "momo",
            bookingCode: "TEST" + Date.now(),
            status: "pending"
        };

        // Call the actual booking API
        const response = await fetch('http://localhost:3001/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testBookingData)
        });

        const result = await response.json();

        if (result.success) {
            // Check if booking was created with user ID
            const bookings = await query(
                'SELECT id_booking, id_users, id_showtime, total_amount, booking_code FROM bookings WHERE id_booking = ?',
                [result.data.booking_id]
            );

            return NextResponse.json({
                success: true,
                message: 'Test booking created successfully',
                bookingResult: result,
                databaseCheck: bookings[0] || null,
                userIdSaved: bookings[0]?.id_users === 1
            });
        } else {
            return NextResponse.json({
                success: false,
                error: 'Booking failed',
                details: result
            }, { status: 400 });
        }

    } catch (error) {
        console.error('Test booking error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to test booking',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        // Get recent bookings with user info
        const bookings = await query(`
            SELECT 
                b.id_booking,
                b.id_users,
                b.total_amount,
                b.booking_code,
                b.booking_date,
                u.username,
                u.email,
                u.full_name
            FROM bookings b
            LEFT JOIN users u ON b.id_users = u.id_users
            ORDER BY b.booking_date DESC
            LIMIT 10
        `);

        return NextResponse.json({
            success: true,
            data: bookings
        });

    } catch (error) {
        console.error('Get bookings error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to get bookings'
        }, { status: 500 });
    }
}
