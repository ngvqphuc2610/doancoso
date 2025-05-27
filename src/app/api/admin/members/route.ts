import { NextRequest, NextResponse } from 'next/server';
import { getMembers, createMember } from '@/lib/memberDb';

// Route để lấy danh sách thành viên
export async function GET() {
    try {
        const members = await getMembers();
        return NextResponse.json({
            success: true,
            data: members
        });
    } catch (error: any) {
        console.error('Error fetching members:', error.message);
        return NextResponse.json(
            {
                success: false,
                message: 'Không thể tải danh sách thành viên',
                error: error.message
            },
            { status: 500 }
        );
    }
}

// Route để tạo thành viên mới
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.id_user || !body.id_typemember) {
            return NextResponse.json(
                { success: false, message: 'ID người dùng và loại thành viên là bắt buộc' },
                { status: 400 }
            );
        }

        const result = await createMember(body);

        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message,
            data: result.data
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating member:', error.message);
        return NextResponse.json(
            {
                success: false,
                message: 'Không thể tạo thành viên mới',
                error: error.message
            },
            { status: 500 }
        );
    }
}
