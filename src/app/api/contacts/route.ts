import { NextRequest, NextResponse } from 'next/server';
import { getContacts } from '@/services/MailAPI';

export async function GET(req: NextRequest) {
    try {
        const result = await getContacts(req, {} as any);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error getting contacts:', error);
        return NextResponse.json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy danh sách liên hệ',
            error: error.message
        }, { status: 500 });
    }
}
