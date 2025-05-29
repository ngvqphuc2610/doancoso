import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            customer_name,
            customer_email,
            customer_phone,
            id_showtime,
            selected_seats,
            ticket_types,
            products,
            total_amount,
            payment_method
        } = body;

        // Validate required fields
        if (!customer_name || !customer_email || !customer_phone || !id_showtime || !selected_seats || selected_seats.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Missing required booking information'
            }, { status: 400 });
        }

        // Start transaction
        await query('START TRANSACTION');

        try {
            // 1. Create booking record
            const bookingResult = await query(
                `INSERT INTO BOOKINGS 
                 (customer_name, customer_email, customer_phone, id_showtime, 
                  total_amount, payment_method, booking_status, booking_date) 
                 VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
                [customer_name, customer_email, customer_phone, id_showtime, 
                 total_amount, payment_method || 'cash']
            );

            const bookingId = (bookingResult as any).insertId;

            // 2. Create booking details for seats
            for (const seatId of selected_seats) {
                await query(
                    `INSERT INTO DETAIL_BOOKING (id_booking, id_seat, ticket_type, price) 
                     VALUES (?, ?, ?, ?)`,
                    [bookingId, seatId, 'standard', 0] // You may want to calculate individual seat prices
                );
            }

            // 3. Create booking details for products (if any)
            if (products && products.length > 0) {
                for (const product of products) {
                    await query(
                        `INSERT INTO BOOKING_PRODUCTS (id_booking, id_product, quantity, price) 
                         VALUES (?, ?, ?, ?)`,
                        [bookingId, product.id, product.quantity, product.price]
                    );
                }
            }

            // 4. Update seat availability (mark as temporarily reserved)
            for (const seatId of selected_seats) {
                await query(
                    `UPDATE SEATS SET status = 'reserved' WHERE id_seat = ?`,
                    [seatId]
                );
            }

            await query('COMMIT');

            return NextResponse.json({
                success: true,
                message: 'Booking created successfully',
                data: {
                    booking_id: bookingId,
                    booking_status: 'pending'
                }
            }, { status: 201 });

        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create booking'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get('bookingId');
        const customerEmail = searchParams.get('customerEmail');

        let sql = `
            SELECT 
                b.*,
                s.start_time,
                s.show_date,
                m.title as movie_title,
                c.cinema_name,
                sc.screen_name
            FROM BOOKINGS b
            JOIN SHOWTIMES s ON b.id_showtime = s.id_showtime
            JOIN MOVIES m ON s.id_movie = m.id_movie
            JOIN SCREEN sc ON s.id_screen = sc.id_screen
            JOIN CINEMAS c ON sc.id_cinema = c.id_cinema
            WHERE 1=1
        `;

        const queryParams: any[] = [];

        if (bookingId) {
            sql += ' AND b.id_booking = ?';
            queryParams.push(bookingId);
        }

        if (customerEmail) {
            sql += ' AND b.customer_email = ?';
            queryParams.push(customerEmail);
        }

        sql += ' ORDER BY b.booking_date DESC';

        const bookings = await query(sql, queryParams);

        return NextResponse.json({
            success: true,
            data: bookings
        });

    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch bookings'
        }, { status: 500 });
    }
}
