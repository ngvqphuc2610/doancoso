import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        // Kiểm tra quyền admin (bạn có thể thêm middleware bảo mật ở đây)
        // const cookieStore = cookies();
        // const authToken = cookieStore.get('auth_token');
        // if (!userHasAdminPermission(authToken)) {
        //     return NextResponse.json(
        //         { success: false, message: 'Unauthorized' },
        //         { status: 401 }
        //     );
        // }

        // Kích hoạt sự kiện đồng bộ phim
        const result = await inngest.send({
            name: 'movie/sync',
            data: {
                source: 'tmdb',
                fullSync: true
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Đã kích hoạt quá trình đồng bộ phim',
            eventId: result.ids[0]
        });
    } catch (error) {
        console.error('Error triggering movie sync:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Đã xảy ra lỗi khi kích hoạt đồng bộ phim',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}