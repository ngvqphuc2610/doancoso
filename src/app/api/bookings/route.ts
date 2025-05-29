import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('📝 Received booking request:', JSON.stringify(body, null, 2));

        // Extract data from the actual structure
        const {
            customerInfo,
            showtimeId,
            selectedSeats,
            ticketInfo,
            productInfo,
            totalPrice,
            paymentMethod,
            transactionId,
            bookingCode,
            status
        } = body;

        // Extract customer details
        const customer_name = customerInfo?.name;
        const customer_email = customerInfo?.email;
        const customer_phone = customerInfo?.phone;
        const id_showtime = showtimeId;
        const selected_seats = selectedSeats;
        const total_amount = totalPrice;
        const payment_method = paymentMethod;
        const transaction_id = transactionId;
        const booking_code = bookingCode;

        console.log('🔍 Field validation:', {
            customer_name: !!customer_name,
            customer_email: !!customer_email,
            customer_phone: !!customer_phone,
            id_showtime: !!id_showtime,
            selected_seats: !!selected_seats && Array.isArray(selected_seats) && selected_seats.length > 0,
            total_amount: !!total_amount
        });

        // Validate required fields
        if (!customer_name || !customer_email || !customer_phone || !id_showtime || !selected_seats || selected_seats.length === 0) {
            console.log('❌ Validation failed - missing required fields');
            return NextResponse.json({
                success: false,
                error: 'Missing required booking information',
                received_fields: {
                    customer_name: !!customer_name,
                    customer_email: !!customer_email,
                    customer_phone: !!customer_phone,
                    id_showtime: !!id_showtime,
                    selected_seats: !!selected_seats && Array.isArray(selected_seats) && selected_seats.length > 0,
                    total_amount: !!total_amount
                },
                raw_data: body
            }, { status: 400 });
        }

        // Start transaction - use connection.beginTransaction() instead of query
        const { db } = await import('@/config/db');
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            console.log('💾 Creating booking with data:', {
                id_showtime,
                total_amount,
                booking_code,
                customer_name,
                customer_email,
                customer_phone
            });

            // 1. Create booking record
            // Note: Database schema doesn't have customer fields directly in bookings table
            // For now, we'll create booking without user reference (guest booking)
            const [bookingResult] = await connection.execute(
                `INSERT INTO bookings
                 (id_showtime, total_amount, payment_status, booking_status, booking_code)
                 VALUES (?, ?, ?, ?, ?)`,
                [id_showtime, total_amount, 'unpaid', status || 'pending', booking_code || null]
            );

            const bookingId = (bookingResult as any).insertId;

            // 2. Create booking details for seats
            // Convert seat names (like "B12") to actual seat IDs from database
            for (let i = 0; i < selected_seats.length; i++) {
                const seatName = selected_seats[i];
                console.log(`🪑 Processing seat: ${seatName}`);

                // Extract row and number from seat name (e.g., "B12" -> row="B", number=12)
                const seatRow = seatName.charAt(0);
                const seatNumber = parseInt(seatName.slice(1));

                // Get actual seat ID from database
                const [seatResult] = await connection.execute(
                    `SELECT s.id_seats, st.type_name as seat_type
                     FROM seat s
                     JOIN seat_type st ON s.id_seattype = st.id_seattype
                     WHERE s.seat_row = ? AND s.seat_number = ?
                     AND s.id_screen = (SELECT id_screen FROM showtimes WHERE id_showtime = ?)`,
                    [seatRow, seatNumber, id_showtime]
                );

                if (!seatResult || (seatResult as any[]).length === 0) {
                    throw new Error(`Seat ${seatName} not found`);
                }

                const seatData = (seatResult as any[])[0];
                const actualSeatId = seatData.id_seats;
                const seatType = seatData.seat_type;

                console.log(`✅ Found seat ${seatName}: ID=${actualSeatId}, Type=${seatType}`);

                // Get ticket type ID from ticketInfo (use the first ticket type for now)
                const ticketTypeIds = Object.keys(ticketInfo).filter(typeId => ticketInfo[parseInt(typeId)] > 0);
                const ticketTypeId = ticketTypeIds.length > 0 ? parseInt(ticketTypeIds[0]) : 2; // Default to "Người Lớn"

                console.log(`🎫 Using ticket type ID: ${ticketTypeId}`);

                // Check compatibility before inserting
                const [compatibilityCheck] = await connection.execute(
                    `SELECT COUNT(*) as count
                     FROM ticket_seat_constraint tsc
                     JOIN seat s ON s.id_seats = ?
                     WHERE tsc.id_tickettype = ? AND tsc.id_seattype = s.id_seattype`,
                    [actualSeatId, ticketTypeId]
                );

                const isCompatible = (compatibilityCheck as any[])[0]?.count > 0;
                console.log(`🔍 Compatibility check: Ticket ${ticketTypeId} + Seat ${actualSeatId} (${seatType}) = ${isCompatible ? 'COMPATIBLE' : 'NOT COMPATIBLE'}`);

                if (!isCompatible) {
                    throw new Error(`Ticket type ${ticketTypeId} cannot use seat type ${seatType} for seat ${seatName}`);
                }

                await connection.execute(
                    `INSERT INTO detail_booking (id_booking, id_seats, price, id_tickettype)
                     VALUES (?, ?, ?, ?)`,
                    [bookingId, actualSeatId, Math.floor(total_amount / selected_seats.length), ticketTypeId]
                );

                console.log(`✅ Created booking detail for seat ${seatName}`);
            }

            // 3. Create booking details for products (if any)
            if (productInfo && Object.keys(productInfo).length > 0) {
                for (const [productId, quantity] of Object.entries(productInfo)) {
                    await connection.execute(
                        `INSERT INTO order_product (id_booking, id_product, quantity, price, order_status)
                         VALUES (?, ?, ?, ?, ?)`,
                        [bookingId, parseInt(productId), quantity, 0, 'pending'] // TODO: Get actual product price
                    );
                }
            }

            // 4. Update seat availability (mark as temporarily reserved)
            // TODO: Update seats based on actual seat IDs from database
            console.log('✅ Booking created successfully, seat update skipped for now');

            await connection.commit();
            connection.release();

            return NextResponse.json({
                success: true,
                message: 'Booking created successfully',
                data: {
                    booking_id: bookingId,
                    booking_status: status || 'pending'
                }
            }, { status: 201 });

        } catch (error) {
            await connection.rollback();
            connection.release();
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
