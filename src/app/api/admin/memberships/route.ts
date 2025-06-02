import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Lấy danh sách memberships cho admin
export async function GET(req: NextRequest) {
    try {
        console.log('[ADMIN MEMBERSHIPS API] Fetching memberships');

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        // Build query conditions
        let whereConditions = [];
        let queryParams: any[] = [];

        if (status && status !== 'all') {
            whereConditions.push('m.status = ?');
            queryParams.push(status);
        }

        if (search) {
            whereConditions.push('(m.title LIKE ? OR m.code LIKE ? OR m.description LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM membership m
            ${whereClause}
        `;
        const countResult = await query(countQuery, queryParams) as any[];
        const total = countResult[0]?.total || 0;

        // Get memberships with pagination - sử dụng string interpolation để tránh lỗi prepared statement với LIMIT/OFFSET
        const membershipsQuery = `
            SELECT
                m.*,
                (SELECT COUNT(*) FROM member mem WHERE mem.id_membership = m.id_membership) as member_count
            FROM membership m
            ${whereClause}
            ORDER BY m.id_membership DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const memberships = await query(membershipsQuery, queryParams) as any[];

        console.log(`[ADMIN MEMBERSHIPS API] Found ${memberships.length} memberships`);

        return NextResponse.json({
            success: true,
            data: memberships,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('[ADMIN MEMBERSHIPS API] Error:', error);
        return NextResponse.json(
            { success: false, message: 'Lỗi khi lấy danh sách gói thành viên' },
            { status: 500 }
        );
    }
}

// POST - Tạo membership mới
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code, title, image, link, description, benefits, criteria, status } = body;

        console.log('[ADMIN MEMBERSHIPS API] Creating membership:', { code, title });

        // Validate required fields
        if (!code || !title) {
            return NextResponse.json(
                { success: false, message: 'Code và title là bắt buộc' },
                { status: 400 }
            );
        }

        // Check if code already exists
        const existingMembership = await query(
            'SELECT id_membership FROM membership WHERE code = ?',
            [code]
        ) as any[];

        if (existingMembership.length > 0) {
            return NextResponse.json(
                { success: false, message: 'Code đã tồn tại' },
                { status: 400 }
            );
        }

        // Insert new membership
        const result = await query(
            `INSERT INTO membership (code, title, image, link, description, benefits, criteria, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [code, title, image, link, description, benefits, criteria, status || 'active']
        ) as any;

        console.log('[ADMIN MEMBERSHIPS API] Membership created with ID:', result.insertId);

        return NextResponse.json({
            success: true,
            message: 'Tạo gói thành viên thành công',
            data: {
                id_membership: result.insertId,
                code,
                title,
                image,
                link,
                description,
                benefits,
                criteria,
                status: status || 'active'
            }
        });

    } catch (error) {
        console.error('[ADMIN MEMBERSHIPS API] Error creating membership:', error);
        return NextResponse.json(
            { success: false, message: 'Lỗi khi tạo gói thành viên' },
            { status: 500 }
        );
    }
}
