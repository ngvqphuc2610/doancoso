import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/db';

// PATCH - Update individual booking
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const bookingId = parseInt(id);
        const body = await request.json();
        const { booking_status, payment_status } = body;

        if (!bookingId || isNaN(bookingId)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid booking ID'
            }, { status: 400 });
        }

        const { db } = await import('@/config/db');
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Check if booking exists
            const [existingBooking] = await connection.execute(
                'SELECT id_booking FROM bookings WHERE id_booking = ?',
                [bookingId]
            );

            if (!existingBooking || (existingBooking as any[]).length === 0) {
                await connection.rollback();
                connection.release();
                return NextResponse.json({
                    success: false,
                    error: 'Booking not found'
                }, { status: 404 });
            }

            // Update booking
            let updateQuery = 'UPDATE bookings SET ';
            let updateParams: any[] = [];
            let updates: string[] = [];

            if (booking_status) {
                updates.push('booking_status = ?');
                updateParams.push(booking_status);
            }

            if (payment_status) {
                updates.push('payment_status = ?');
                updateParams.push(payment_status);
            }

            if (updates.length === 0) {
                await connection.rollback();
                connection.release();
                return NextResponse.json({
                    success: false,
                    error: 'No fields to update'
                }, { status: 400 });
            }

            updateQuery += updates.join(', ') + ' WHERE id_booking = ?';
            updateParams.push(bookingId);

            await connection.execute(updateQuery, updateParams);

            await connection.commit();
            connection.release();

            return NextResponse.json({
                success: true,
                message: 'Booking updated successfully'
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Error updating booking:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update booking'
        }, { status: 500 });
    }
}

// DELETE - Delete booking
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const bookingId = parseInt(id);

        if (!bookingId || isNaN(bookingId)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid booking ID'
            }, { status: 400 });
        }

        const { db } = await import('@/config/db');
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Check if booking exists
            const [existingBooking] = await connection.execute(
                'SELECT id_booking FROM bookings WHERE id_booking = ?',
                [bookingId]
            );

            if (!existingBooking || (existingBooking as any[]).length === 0) {
                await connection.rollback();
                connection.release();
                return NextResponse.json({
                    success: false,
                    error: 'Booking not found'
                }, { status: 404 });
            }

            // Delete related records first due to foreign key constraints
            // Delete booking details (seats)
            await connection.execute(
                'DELETE FROM detail_booking WHERE id_booking = ?',
                [bookingId]
            );

            // Delete order products
            await connection.execute(
                'DELETE FROM order_product WHERE id_booking = ?',
                [bookingId]
            );

            // Delete payments
            await connection.execute(
                'DELETE FROM payments WHERE id_booking = ?',
                [bookingId]
            );

            // Finally delete the booking
            await connection.execute(
                'DELETE FROM bookings WHERE id_booking = ?',
                [bookingId]
            );

            await connection.commit();
            connection.release();

            return NextResponse.json({
                success: true,
                message: 'Booking deleted successfully'
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Error deleting booking:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete booking'
        }, { status: 500 });
    }
}

// GET - Get individual booking details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const bookingId = parseInt(id);

        if (!bookingId || isNaN(bookingId)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid booking ID'
            }, { status: 400 });
        }

        // Get booking details
        const bookingQuery = `
            SELECT 
                b.*,
                m.title as movie_title,
                c.cinema_name,
                sc.screen_name,
                s.start_time,
                s.show_date,
                u.full_name as customer_name,
                u.email as customer_email,
                u.phone_number as customer_phone
            FROM bookings b
            LEFT JOIN users u ON b.id_users = u.id_users
            LEFT JOIN showtimes s ON b.id_showtime = s.id_showtime
            LEFT JOIN movies m ON s.id_movie = m.id_movie
            LEFT JOIN screen sc ON s.id_screen = sc.id_screen
            LEFT JOIN cinemas c ON sc.id_cinema = c.id_cinema
            WHERE b.id_booking = ?
        `;

        const bookingResult = await query(bookingQuery, [bookingId]);

        if (!bookingResult || (bookingResult as any[]).length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Booking not found'
            }, { status: 404 });
        }

        const booking = (bookingResult as any[])[0];

        // Get seats
        const seats = await query(`
            SELECT CONCAT(s.seat_row, s.seat_number) as seat_name
            FROM detail_booking db
            JOIN seat s ON db.id_seats = s.id_seats
            WHERE db.id_booking = ?
            ORDER BY s.seat_row, s.seat_number
        `, [bookingId]);

        booking.seats = (seats as any[]).map(seat => seat.seat_name);

        // Get products
        const products = await query(`
            SELECT 
                p.product_name as name,
                op.quantity,
                op.price
            FROM order_product op
            JOIN product p ON op.id_product = p.id_product
            WHERE op.id_booking = ?
        `, [bookingId]);

        booking.products = products || [];

        return NextResponse.json({
            success: true,
            data: booking
        });

    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch booking'
        }, { status: 500 });
    }
}
