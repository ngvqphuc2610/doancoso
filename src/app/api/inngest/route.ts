import { inngest } from '@/lib/inngest/client';
import { syncMoviesHandler, scheduledMovieSync } from '@/lib/inngest/handlers/movie-sync';
import { serve } from 'inngest/next';

// Tạo handler Inngest với tất cả các hàm xử lý sự kiện
export const { GET, POST } = serve({
    client: inngest,
    functions: [
        syncMoviesHandler,
        scheduledMovieSync
    ],
});