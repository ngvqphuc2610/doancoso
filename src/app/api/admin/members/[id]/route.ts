import { NextRequest, NextResponse } from 'next/server';
import { getMemberById, updateMember, deleteMember } from '@/lib/memberDb';

// Route để lấy chi tiết một thành viên
export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json(
                { success: false, message: 'ID không hợp lệ' },
                { status: 400 }
            );
        }

        const member = await getMemberById(id);
        if (!member) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy thành viên' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: member
        });
    } catch (error: any) {
        console.error(`Error fetching member ${params.id}:`, error.message);
        return NextResponse.json(
            {
                success: false,
                message: 'Không thể tải thông tin thành viên',
                error: error.message
            },
            { status: 500 }
        );
    }
}

// Route để cập nhật thông tin thành viên
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json(
                { success: false, message: 'ID không hợp lệ' },
                { status: 400 }
            );
        }

        const body = await req.json();
        const result = await updateMember(id, body);

        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        console.error(`Error updating member ${params.id}:`, error.message);
        return NextResponse.json(
            {
                success: false,
                message: 'Không thể cập nhật thông tin thành viên',
                error: error.message
            },
            { status: 500 }
        );
    }
}

// Route để xóa thành viên
export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json(
                { success: false, message: 'ID không hợp lệ' },
                { status: 400 }
            );
        }

        const result = await deleteMember(id);

        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        console.error(`Error deleting member ${params.id}:`, error.message);
        return NextResponse.json(
            {
                success: false,
                message: 'Không thể xóa thành viên',
                error: error.message
            },
            { status: 500 }
        );
    }
}


