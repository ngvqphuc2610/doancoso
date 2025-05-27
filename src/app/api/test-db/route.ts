import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cinema_booking_system',
    port: 3306
};

export async function GET(request: NextRequest) {
    let connection;
    
    try {
        console.log('Testing database connection...');
        console.log('Config:', dbConfig);
        
        // Test connection
        connection = await mysql.createConnection(dbConfig);
        console.log('Database connected successfully');
        
        // Test query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('Test query result:', rows);
        
        // Test tables exist
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Available tables:', tables);
        
        // Test specific tables we need
        const [bookings] = await connection.execute('SELECT COUNT(*) as count FROM bookings');
        const [showtimes] = await connection.execute('SELECT COUNT(*) as count FROM showtimes');
        const [seats] = await connection.execute('SELECT COUNT(*) as count FROM seat');
        
        return NextResponse.json({
            success: true,
            message: 'Database connection successful',
            data: {
                testQuery: rows,
                tables: tables,
                counts: {
                    bookings: bookings,
                    showtimes: showtimes,
                    seats: seats
                }
            }
        });
        
    } catch (error) {
        console.error('Database test error:', error);
        return NextResponse.json(
            { 
                error: 'Database connection failed', 
                details: (error as Error).message,
                config: {
                    host: dbConfig.host,
                    port: dbConfig.port,
                    database: dbConfig.database,
                    user: dbConfig.user
                }
            },
            { status: 500 }
        );
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
