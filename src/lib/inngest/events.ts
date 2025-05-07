import { inngest } from './client';

/**
 * Gửi sự kiện để đồng bộ phim từ TMDB API
 */
export async function triggerMovieSync(fullSync: boolean = true) {
    try {
        const result = await inngest.send({
            name: 'movie/sync',
            data: {
                source: 'tmdb',
                fullSync
            }
        });

        return {
            success: true,
            message: 'Đã kích hoạt đồng bộ phim',
            eventId: result.ids[0]
        };
    } catch (error) {
        console.error('Lỗi khi gửi sự kiện đồng bộ phim:', error);
        return {
            success: false,
            message: 'Không thể kích hoạt đồng bộ phim',
            error: String(error)
        };
    }
}

/**
 * Gửi sự kiện để cập nhật một phim cụ thể
 */
export async function triggerMovieUpdate(movieId: number, fields: string[] = []) {
    try {
        const result = await inngest.send({
            name: 'movie/update',
            data: {
                movieId,
                fields
            }
        });

        return {
            success: true,
            message: `Đã kích hoạt cập nhật phim ID ${movieId}`,
            eventId: result.ids[0]
        };
    } catch (error) {
        console.error(`Lỗi khi gửi sự kiện cập nhật phim ID ${movieId}:`, error);
        return {
            success: false,
            message: `Không thể kích hoạt cập nhật phim ID ${movieId}`,
            error: String(error)
        };
    }
}

/**
 * Gửi sự kiện để xóa một phim
 */
export async function triggerMovieDelete(movieId: number) {
    try {
        const result = await inngest.send({
            name: 'movie/delete',
            data: {
                movieId
            }
        });

        return {
            success: true,
            message: `Đã kích hoạt xóa phim ID ${movieId}`,
            eventId: result.ids[0]
        };
    } catch (error) {
        console.error(`Lỗi khi gửi sự kiện xóa phim ID ${movieId}:`, error);
        return {
            success: false,
            message: `Không thể kích hoạt xóa phim ID ${movieId}`,
            error: String(error)
        };
    }
}