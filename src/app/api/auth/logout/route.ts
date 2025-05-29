import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const response = NextResponse.json({
            success: true,
            message: 'Đăng xuất thành công'
        });

        // Clear the auth cookie
        response.cookies.set('auth-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0 // Expire immediately
        });

        return response;

    } catch (error: any) {
        console.error('Logout error:', error);
        return NextResponse.json({
            success: false,
            message: 'Đã xảy ra lỗi khi đăng xuất',
            error: error.message
        }, { status: 500 });
    }
}
