import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET - Lấy lịch sử đặt vé của user
export async function GET(req: NextRequest) {
    try {
        // Get token from cookie
        const token = req.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({
                success: false,
                message: 'Không tìm thấy token xác thực'
            }, { status: 401 });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const userId = decoded.userId;

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status'); // pending, confirmed, cancelled
        const offset = (page - 1) * limit;

        // Build dynamic query
        let sql = `
            SELECT
                b.id_booking,
                b.booking_code,
                b.total_amount,
                b.payment_status,
                b.booking_status,
                b.booking_date,
                u.full_name as customer_name,
                u.email as customer_email,
                u.phone_number as customer_phone,
                s.start_time,
                s.show_date,
                s.format,
                s.language,
                s.subtitle,
                m.title as movie_title,
                m.poster_image,
                m.duration,
                m.age_restriction,
                c.cinema_name,
                c.address as cinema_address,
                sc.screen_name,
                GROUP_CONCAT(DISTINCT CONCAT(seat.seat_row, seat.seat_number) ORDER BY seat.seat_row, seat.seat_number) as seats,
                COUNT(DISTINCT db.id_seats) as seat_count
            FROM bookings b
            JOIN users u ON b.id_users = u.id_users
            JOIN showtimes s ON b.id_showtime = s.id_showtime
            JOIN movies m ON s.id_movie = m.id_movie
            JOIN screen sc ON s.id_screen = sc.id_screen
            JOIN cinemas c ON sc.id_cinema = c.id_cinema
            LEFT JOIN detail_booking db ON b.id_booking = db.id_booking
            LEFT JOIN seat ON db.id_seats = seat.id_seats
            WHERE b.id_users = ${userId}
        `;

        let countSql = `
            SELECT COUNT(DISTINCT b.id_booking) as total
            FROM bookings b
            JOIN users u ON b.id_users = u.id_users
            WHERE b.id_users = ${userId}
        `;

        if (status) {
            sql += ` AND b.booking_status = '${status}'`;
            countSql += ` AND b.booking_status = '${status}'`;
        }

        sql += ` GROUP BY b.id_booking ORDER BY b.booking_date DESC LIMIT ${limit} OFFSET ${offset}`;

        // Get booking history with details
        const bookings = await query(sql);

        // Get total count for pagination
        const countResult = await query(countSql);

        const total = Array.isArray(countResult) && countResult.length > 0 ? countResult[0].total : 0;
        const totalPages = Math.ceil(total / limit);

        // Get products for each booking
        const bookingIds = (bookings as any[]).map(b => b.id_booking);
        let products: any[] = [];

        if (bookingIds.length > 0) {
            products = await query(`
                SELECT 
                    op.id_booking,
                    p.product_name,
                    op.quantity,
                    op.price as total_price,
                    (op.price / op.quantity) as unit_price
                FROM order_product op
                JOIN product p ON op.id_product = p.id_product
                WHERE op.id_booking IN (${bookingIds.map(() => '?').join(',')})
                ORDER BY op.id_booking, p.product_name
            `, bookingIds);
        }

        // Group products by booking
        const productsByBooking = (products as any[]).reduce((acc, product) => {
            if (!acc[product.id_booking]) {
                acc[product.id_booking] = [];
            }
            acc[product.id_booking].push({
                name: product.product_name,
                quantity: product.quantity,
                unitPrice: product.unit_price,
                totalPrice: product.total_price
            });
            return acc;
        }, {});

        // Format response
        const formattedBookings = (bookings as any[]).map(booking => ({
            id: booking.id_booking,
            bookingCode: booking.booking_code,
            totalAmount: booking.total_amount,
            paymentStatus: booking.payment_status,
            bookingStatus: booking.booking_status,
            bookingDate: booking.booking_date,
            customerInfo: {
                name: booking.customer_name,
                email: booking.customer_email,
                phone: booking.customer_phone
            },
            movie: {
                title: booking.movie_title,
                posterImage: booking.poster_image,
                duration: booking.duration,
                ageRestriction: booking.age_restriction
            },
            showtime: {
                startTime: booking.start_time,
                showDate: booking.show_date,
                format: booking.format,
                language: booking.language,
                subtitle: booking.subtitle
            },
            cinema: {
                name: booking.cinema_name,
                address: booking.cinema_address,
                screen: booking.screen_name
            },
            seats: booking.seats ? booking.seats.split(',') : [],
            seatCount: booking.seat_count,
            products: productsByBooking[booking.id_booking] || []
        }));

        return NextResponse.json({
            success: true,
            data: {
                bookings: formattedBookings,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error fetching booking history:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server khi lấy lịch sử đặt vé'
        }, { status: 500 });
    }
}
