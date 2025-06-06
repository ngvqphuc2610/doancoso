import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/db';

// GET - Fetch all bookings with search and filters for admin
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const paymentStatus = searchParams.get('paymentStatus') || '';
        const dateFrom = searchParams.get('dateFrom') || '';
        const dateTo = searchParams.get('dateTo') || '';

        const offset = (page - 1) * limit;

        // Ensure limit and offset are valid numbers
        if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
            return NextResponse.json({
                success: false,
                error: 'Invalid page or limit parameters'
            }, { status: 400 });
        }



        // Build WHERE clause
        let whereConditions = ['1=1'];
        let queryParams: any[] = [];

        // Search in booking code, customer name, email, phone
        if (search) {
            whereConditions.push(`(
                b.booking_code LIKE ? OR 
                u.full_name LIKE ? OR 
                u.email LIKE ? OR 
                u.phone_number LIKE ? OR
                m.title LIKE ?
            )`);
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Filter by booking status
        if (status) {
            whereConditions.push('b.booking_status = ?');
            queryParams.push(status);
        }

        // Filter by payment status
        if (paymentStatus) {
            whereConditions.push('b.payment_status = ?');
            queryParams.push(paymentStatus);
        }

        // Filter by date range
        if (dateFrom) {
            whereConditions.push('DATE(b.booking_date) >= ?');
            queryParams.push(dateFrom);
        }

        if (dateTo) {
            whereConditions.push('DATE(b.booking_date) <= ?');
            queryParams.push(dateTo);
        }

        const whereClause = whereConditions.join(' AND ');

        // Try a simpler approach first - build complete SQL without placeholders for LIMIT/OFFSET
        const bookingsQuery = `
            SELECT
                b.id_booking,
                b.booking_code,
                b.booking_date,
                b.booking_status,
                b.payment_status,
                b.total_amount,
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
            WHERE ` + whereClause + `
            ORDER BY b.booking_date DESC
            LIMIT ${limit} OFFSET ${offset}
        `;



        // Now only pass queryParams (no limit/offset since they're in the SQL string)
        console.log('Query:', bookingsQuery);
        console.log('Parameters:', queryParams);

        const bookings = await query(bookingsQuery, queryParams);

        // Get seat information for each booking
        for (let booking of bookings as any[]) {
            try {
                const seats = await query(`
                    SELECT CONCAT(s.seat_row, s.seat_number) as seat_name
                    FROM detail_booking db
                    JOIN seat s ON db.id_seats = s.id_seats
                    WHERE db.id_booking = ?
                    ORDER BY s.seat_row, s.seat_number
                `, [booking.id_booking]);

                booking.seats = (seats as any[]).map(seat => seat.seat_name);
            } catch (error) {
                console.error(`Error fetching seats for booking ${booking.id_booking}:`, error);
                booking.seats = [];
            }
        }

        // Get products for each booking
        for (let booking of bookings as any[]) {
            try {
                const products = await query(`
                    SELECT
                        p.product_name as name,
                        op.quantity,
                        op.price
                    FROM order_product op
                    JOIN product p ON op.id_product = p.id_product
                    WHERE op.id_booking = ?
                `, [booking.id_booking]);

                booking.products = products || [];
            } catch (error) {
                console.error(`Error fetching products for booking ${booking.id_booking}:`, error);
                booking.products = [];
            }
        }

        // Count total for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM bookings b
            LEFT JOIN users u ON b.id_users = u.id_users
            LEFT JOIN showtimes s ON b.id_showtime = s.id_showtime
            LEFT JOIN movies m ON s.id_movie = m.id_movie
            LEFT JOIN screen sc ON s.id_screen = sc.id_screen
            LEFT JOIN cinemas c ON sc.id_cinema = c.id_cinema
            WHERE ` + whereClause;



        const countResult = await query(countQuery, queryParams);
        const total = (countResult as any[])[0]?.total || 0;
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: bookings,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching admin bookings:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch bookings'
        }, { status: 500 });
    }
}

// PATCH - Bulk update booking statuses
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { bookingIds, booking_status, payment_status } = body;

        if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Booking IDs are required'
            }, { status: 400 });
        }

        const { db } = await import('@/config/db');
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Update booking statuses
            const placeholders = bookingIds.map(() => '?').join(',');
            let updateQuery = 'UPDATE bookings SET ';
            let updateParams: any[] = [];

            if (booking_status) {
                updateQuery += 'booking_status = ?';
                updateParams.push(booking_status);
            }

            if (payment_status) {
                if (booking_status) updateQuery += ', ';
                updateQuery += 'payment_status = ?';
                updateParams.push(payment_status);
            }

            updateQuery += ` WHERE id_booking IN (${placeholders})`;
            updateParams.push(...bookingIds);

            await connection.execute(updateQuery, updateParams);

            await connection.commit();
            connection.release();

            return NextResponse.json({
                success: true,
                message: 'Bookings updated successfully'
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Error updating bookings:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update bookings'
        }, { status: 500 });
    }
}

// DELETE - Bulk delete bookings
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { bookingIds } = body;

        if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Booking IDs are required'
            }, { status: 400 });
        }

        const { db } = await import('@/config/db');
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Delete related records first for each booking
            for (const bookingId of bookingIds) {
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
            }

            // Finally delete all bookings
            const placeholders = bookingIds.map(() => '?').join(',');
            await connection.execute(
                `DELETE FROM bookings WHERE id_booking IN (${placeholders})`,
                bookingIds
            );

            await connection.commit();
            connection.release();

            return NextResponse.json({
                success: true,
                message: `${bookingIds.length} bookings deleted successfully`
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Error bulk deleting bookings:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete bookings'
        }, { status: 500 });
    }
}
