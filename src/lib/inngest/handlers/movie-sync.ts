import { inngest } from '../client';
import { syncMoviesFromTMDB } from '../../../services/movieSyncService';
import { query } from '../../../lib/db';

// Định nghĩa kiểu dữ liệu cho kết quả đồng bộ
interface SyncResult {
    success: boolean;
    message: string;
    error?: any;
    results?: {
        total: number;
        saved: number;
        updated: number;
        failed: number;
        errors: any[];
    };
}

/**
 * Ghi log vào database
 */
async function logToDatabase(action: string, status: string, description: string, error?: any): Promise<number | null> {
    try {
        if (error) {
            const result = await query(
                'INSERT INTO SYNC_LOGS (action, status, description, error, started_at, completed_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
                [action, status, description, typeof error === 'string' ? error : JSON.stringify(error)]
            );
            return (result as any)?.insertId || null;
        } else {
            const result = await query(
                'INSERT INTO SYNC_LOGS (action, status, description, started_at) VALUES (?, ?, ?, NOW())',
                [action, status, description]
            );
            return (result as any)?.insertId || null;
        }
    } catch (dbError) {
        console.error('Failed to write to log database:', dbError);
        return null;
    }
}

/**
 * Cập nhật log trong database
 */
async function updateLogInDatabase(logId: number | null, status: string, description: string, error?: any): Promise<boolean> {
    if (!logId) return false;

    try {
        if (error) {
            await query(
                'UPDATE SYNC_LOGS SET status = ?, description = ?, error = ?, completed_at = NOW() WHERE id_log = ?',
                [
                    status,
                    description,
                    typeof error === 'string' ? error : JSON.stringify(error),
                    logId
                ]
            );
        } else {
            await query(
                'UPDATE SYNC_LOGS SET status = ?, description = ?, completed_at = NOW() WHERE id_log = ?',
                [status, description, logId]
            );
        }
        return true;
    } catch (dbError) {
        console.error('Failed to update log in database:', dbError);
        return false;
    }
}

// Định nghĩa hàm xử lý đồng bộ phim
export const syncMoviesHandler = inngest.createFunction(
    { id: 'sync-movies-from-tmdb' },
    { event: 'movie/sync' },
    async ({ event, step }) => {
        try {
            const { fullSync = true } = event.data;

            // Ghi log bắt đầu quá trình đồng bộ
            const startLogId = await step.run('logging-start', async () => {
                return await logToDatabase(
                    'movie-sync',
                    'started',
                    `Starting movie sync from TMDB API (fullSync: ${fullSync})`
                );
            });

            // Thực hiện đồng bộ phim từ TMDB API với try-catch nội bộ
            const syncResult: SyncResult = await step.run('sync-tmdb-movies', async () => {
                try {
                    const result = await syncMoviesFromTMDB();
                    return result;
                } catch (error) {
                    console.error('Error in syncMoviesFromTMDB:', error);
                    return {
                        success: false,
                        message: 'Exception occurred during synchronization process',
                        error: error instanceof Error ? error.message : String(error)
                    };
                }
            });

            // Ghi log kết thúc quá trình đồng bộ
            if (syncResult.success) {
                await step.run('logging-success', async () => {
                    const resultDetails = syncResult.results
                        ? `(${syncResult.results.saved} new, ${syncResult.results.updated} updated, ${syncResult.results.failed} failed)`
                        : '';

                    return await updateLogInDatabase(
                        startLogId,
                        'completed',
                        `Successfully synced movies from TMDB API: ${syncResult.message} ${resultDetails}`
                    );
                });
            } else {
                // Ghi log lỗi nếu quá trình đồng bộ thất bại
                await step.run('logging-error', async () => {
                    return await updateLogInDatabase(
                        startLogId,
                        'error',
                        'Failed to sync movies from TMDB API',
                        syncResult.error || syncResult.message
                    );
                });
            }

            return {
                success: syncResult.success,
                message: syncResult.message,
                logId: startLogId,
                results: syncResult.results
            };
        } catch (error) {
            console.error('Unhandled error in sync-movies handler:', error);

            // Ghi log lỗi nếu có exception xảy ra
            await step.run('logging-exception', async () => {
                return await logToDatabase(
                    'movie-sync',
                    'error',
                    'Unhandled exception occurred during movie sync',
                    error instanceof Error
                        ? { message: error.message, stack: error.stack }
                        : error
                );
            });

            return {
                success: false,
                message: 'Đã xảy ra lỗi không xác định khi đồng bộ phim',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
);

// Định nghĩa hàm xử lý đồng bộ tự động hàng ngày
export const scheduledMovieSync = inngest.createFunction(
    { id: 'daily-movie-sync' },
    { event: 'scheduled/movie-sync' }, // Triggered by a scheduled event
    async ({ event, step }) => {
        try {
            // Ghi log bắt đầu quá trình đồng bộ tự động
            const startLogId = await step.run('logging-scheduled-start', async () => {
                return await logToDatabase(
                    'scheduled-movie-sync',
                    'started',
                    'Starting scheduled movie sync'
                );
            });

            // Thực hiện đồng bộ phim từ TMDB API với try-catch nội bộ
            const syncResult: SyncResult = await step.run('sync-tmdb-movies', async () => {
                try {
                    return await syncMoviesFromTMDB();
                } catch (error) {
                    console.error('Error in syncMoviesFromTMDB during scheduled sync:', error);
                    return {
                        success: false,
                        message: 'Exception occurred during scheduled synchronization',
                        error: error instanceof Error ? error.message : String(error)
                    };
                }
            });

            // Ghi log kết thúc quá trình đồng bộ
            if (syncResult.success) {
                await step.run('logging-success', async () => {
                    const resultDetails = syncResult.results
                        ? `(${syncResult.results.saved} new, ${syncResult.results.updated} updated, ${syncResult.results.failed} failed)`
                        : '';

                    return await updateLogInDatabase(
                        startLogId,
                        'completed',
                        `Successfully completed scheduled movie sync: ${syncResult.message} ${resultDetails}`
                    );
                });
            } else {
                await step.run('logging-error', async () => {
                    return await updateLogInDatabase(
                        startLogId,
                        'error',
                        'Failed during scheduled movie sync',
                        syncResult.error || syncResult.message
                    );
                });
            }

            return {
                success: syncResult.success,
                message: syncResult.message,
                logId: startLogId,
                results: syncResult.results
            };
        } catch (error) {
            console.error('Unhandled error in scheduled-movie-sync handler:', error);

            // Ghi log lỗi nếu có exception xảy ra
            await step.run('logging-exception', async () => {
                return await logToDatabase(
                    'scheduled-movie-sync',
                    'error',
                    'Unhandled exception occurred during scheduled movie sync',
                    error instanceof Error
                        ? { message: error.message, stack: error.stack }
                        : error
                );
            });

            return {
                success: false,
                message: 'Đã xảy ra lỗi không xác định khi thực hiện đồng bộ phim tự động',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
);