import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, username, email, password, fullName } = body;

        if (action === 'create') {
            // Create test user
            const hashedPassword = await bcrypt.hash(password || 'password123', 10);
            
            const result = await query(
                `INSERT INTO users (username, email, password_hash, full_name, phone_number, role, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    username || 'testuser',
                    email || 'test@example.com',
                    hashedPassword,
                    fullName || 'Test User',
                    '0123456789',
                    'user',
                    'active'
                ]
            );

            return NextResponse.json({
                success: true,
                message: 'Test user created successfully',
                userId: (result as any).insertId
            });
        }

        if (action === 'list') {
            // List all users
            const users = await query(
                'SELECT id_users, username, email, full_name, role, status FROM users ORDER BY id_users DESC LIMIT 10'
            );

            return NextResponse.json({
                success: true,
                data: users
            });
        }

        if (action === 'delete') {
            // Delete test users
            await query('DELETE FROM users WHERE username LIKE "test%" OR email LIKE "test%"');
            
            return NextResponse.json({
                success: true,
                message: 'Test users deleted'
            });
        }

        return NextResponse.json({
            success: false,
            error: 'Invalid action'
        }, { status: 400 });

    } catch (error) {
        console.error('Test user error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to handle test user request',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        // List all users
        const users = await query(
            'SELECT id_users, username, email, full_name, role, status, created_at FROM users ORDER BY id_users DESC'
        );

        return NextResponse.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to get users'
        }, { status: 500 });
    }
}
