import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bookingcinema',
    port: parseInt(process.env.DB_PORT || '3307')
};

export async function GET(request: NextRequest) {
    let connection;

    try {
        // Create database connection
        connection = await mysql.createConnection(dbConfig);

        // Get active payment methods ordered by display_order
        const [rows] = await connection.execute(
            `SELECT
                id_payment_method,
                method_code,
                method_name,
                description,
                icon_url,
                processing_fee,
                min_amount,
                max_amount,
                display_order
            FROM payment_methods
            WHERE is_active = 1
            ORDER BY display_order ASC, method_name ASC`
        );

        return NextResponse.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Payment methods fetch error:', error);

        // If database is not available, return default payment methods
        const defaultPaymentMethods = [
            {
                id_payment_method: 1,
                method_code: 'momo',
                method_name: 'Thanh toán qua Momo',
                description: 'Thanh toán nhanh chóng và an toàn qua ví điện tử Momo',
                icon_url: '📱',
                processing_fee: 0,
                min_amount: 10000,
                max_amount: 50000000,
                display_order: 1
            },
            {
                id_payment_method: 2,
                method_code: 'domestic_card',
                method_name: 'Thanh toán qua Thẻ nội địa',
                description: 'Thanh toán bằng thẻ ATM/Debit nội địa (Napas)',
                icon_url: '💳',
                processing_fee: 0,
                min_amount: 10000,
                max_amount: 50000000,
                display_order: 2
            },
            {
                id_payment_method: 3,
                method_code: 'international_card',
                method_name: 'Thanh toán qua Thẻ quốc tế',
                description: 'Thanh toán bằng thẻ Visa/Mastercard/JCB',
                icon_url: '🌍',
                processing_fee: 0,
                min_amount: 10000,
                max_amount: 50000000,
                display_order: 3
            },
            {
                id_payment_method: 4,
                method_code: 'bank_transfer',
                method_name: 'Chuyển khoản ngân hàng',
                description: 'Chuyển khoản trực tiếp qua ngân hàng',
                icon_url: '🏦',
                processing_fee: 0,
                min_amount: 10000,
                max_amount: null,
                display_order: 4
            },
            {
                id_payment_method: 5,
                method_code: 'cash',
                method_name: 'Thanh toán tại quầy',
                description: 'Thanh toán bằng tiền mặt tại rạp',
                icon_url: '💵',
                processing_fee: 0,
                min_amount: 0,
                max_amount: null,
                display_order: 5
            }
        ];

        return NextResponse.json({
            success: true,
            data: defaultPaymentMethods,
            fallback: true,
            error: 'Using fallback data due to database connection issue'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// POST method to create new payment method (for admin)
export async function POST(request: NextRequest) {
    let connection;

    try {
        const body = await request.json();
        const {
            method_code,
            method_name,
            description,
            icon_url,
            processing_fee = 0,
            min_amount = 0,
            max_amount = null,
            display_order = 0
        } = body;

        // Validate required fields
        if (!method_code || !method_name) {
            return NextResponse.json(
                { error: 'Method code and name are required' },
                { status: 400 }
            );
        }

        // Create database connection
        connection = await mysql.createConnection(dbConfig);

        // Insert new payment method
        const [result] = await connection.execute(
            `INSERT INTO payment_methods
            (method_code, method_name, description, icon_url, processing_fee, min_amount, max_amount, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [method_code, method_name, description, icon_url, processing_fee, min_amount, max_amount, display_order]
        );

        return NextResponse.json({
            success: true,
            message: 'Payment method created successfully',
            id: (result as any).insertId
        });

    } catch (error) {
        console.error('Payment method creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create payment method', details: (error as Error).message },
            { status: 500 }
        );
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
