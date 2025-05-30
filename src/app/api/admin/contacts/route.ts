import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/db';
import { requireAuth } from '@/lib/auth';

// GET - Lấy danh sách contacts
export async function GET(request: NextRequest) {
    try {
        // Check admin authentication
        const authResult = await requireAuth(request, 'admin');
        if (!authResult.success) {
            return NextResponse.json({
                success: false,
                message: authResult.message
            }, { status: authResult.status });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const offset = (page - 1) * limit;

        // Build query conditions
        let whereConditions = [];
        let whereParams: any[] = [];

        if (status && status !== 'all') {
            whereConditions.push('c.status = ?');
            whereParams.push(status);
        }

        if (search) {
            whereConditions.push('(c.name LIKE ? OR c.email LIKE ? OR c.subject LIKE ?)');
            const searchPattern = `%${search}%`;
            whereParams.push(searchPattern, searchPattern, searchPattern);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM contact c
            ${whereClause}
        `;
        const countResult = await query(countQuery, whereParams);
        const total = (countResult as any[])[0]?.total || 0;

        // Get contacts with full info and staff info
        // Build query with direct values to avoid parameter issues
        let contactsQuery = `
            SELECT
                c.id_contact,
                c.name,
                c.email,
                c.subject,
                c.message,
                c.contact_date,
                c.status,
                c.reply,
                c.reply_date,
                c.id_staff,
                s.staff_name,
                s.email as staff_email,
                s.phone_number as staff_phone
            FROM contact c
            LEFT JOIN staff s ON c.id_staff = s.id_staff
            ${whereClause}
            ORDER BY c.contact_date DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const contacts = await query(contactsQuery, whereParams);

        return NextResponse.json({
            success: true,
            data: {
                contacts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching contacts:', error);
        return NextResponse.json({
            success: false,
            message: 'Không thể tải danh sách liên hệ'
        }, { status: 500 });
    }
}

// POST - Tạo contact mới (admin tạo thay user)
export async function POST(request: NextRequest) {
    try {
        // Check admin authentication
        const authResult = await requireAuth(request, 'admin');
        if (!authResult.success) {
            return NextResponse.json({
                success: false,
                message: authResult.message
            }, { status: authResult.status });
        }

        const body = await request.json();
        const { name, email, subject, message, status = 'unread' } = body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin'
            }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                success: false,
                message: 'Địa chỉ email không hợp lệ'
            }, { status: 400 });
        }

        // Insert contact (id_staff sẽ là NULL cho đến khi có reply)
        const result = await query(
            `INSERT INTO contact (name, email, subject, message, status, contact_date, id_staff)
             VALUES (?, ?, ?, ?, ?, NOW(), NULL)`,
            [name, email, subject, message, status]
        );

        return NextResponse.json({
            success: true,
            message: 'Tạo liên hệ thành công',
            data: {
                id_contact: (result as any).insertId
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating contact:', error);
        return NextResponse.json({
            success: false,
            message: 'Không thể tạo liên hệ'
        }, { status: 500 });
    }
}