import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { serve } from 'inngest/express';
import { Inngest } from 'inngest';
import { InngestMiddleware } from 'inngest';
import {
    handleContactForm,
    getContacts,
    getContactById,
    replyContact,
    deleteContact,
    testDatabaseConnection
} from './services/MailAPI.js';
import { syncMoviesFromTMDB } from './services/movieSyncService.js';
import { query } from './lib/db.js';
import { inngest } from './lib/inngest/client.js';
import { syncMoviesHandler, scheduledMovieSync } from './lib/inngest/handlers/movie-sync.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Inngest Dev Server (chỉ chạy trong môi trường phát triển)
console.log('Setting up Inngest Dev Server...');
app.use('/api/inngest', serve({
    client: inngest,
    functions: [syncMoviesHandler, scheduledMovieSync],
    streaming: "allow", // Cho phép streaming logs
    logLevel: "debug" // Thêm debug để xem các lỗi
}));

// Middleware xử lý lỗi async
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};

// Route cho trang chủ
app.get('/', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Chào mừng đến với Cinestar API',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
            movies: '/api/admin/movies',
            contacts: '/api/contacts',
            testDb: '/api/test-db'
        }
    });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: "Đã xảy ra lỗi trong quá trình xử lý yêu cầu."
    });
});

// API routes
app.get('/api/test-db', asyncHandler(testDatabaseConnection));
app.post('/api/contact', asyncHandler(handleContactForm));
app.get('/api/contacts', asyncHandler(getContacts));
app.get('/api/contacts/:id', asyncHandler(getContactById));
app.post('/api/contacts/:id/reply', asyncHandler(replyContact));
app.delete('/api/contacts/:id', asyncHandler(deleteContact));

// Routes cho quản lý phim
app.post('/api/admin/movies/sync', asyncHandler(async (req: Request, res: Response) => {
    try {
        console.log('Đang bắt đầu đồng bộ phim từ TMDB API...');
        
        // Sử dụng hàm syncMoviesFromTMDB trực tiếp thay vì qua Inngest
        const result = await syncMoviesFromTMDB();
        
        console.log('Kết quả đồng bộ phim:', result);
        
        res.json({
            success: true,
            message: 'Đồng bộ phim thành công',
            data: result
        });
    } catch (error) {
        console.error('Error syncing movies from TMDB:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi đồng bộ phim từ TMDB',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

app.get('/api/admin/movies', asyncHandler(async (req: Request, res: Response) => {
    const movies = await query('SELECT * FROM MOVIES ORDER BY release_date DESC');
    res.json({ success: true, data: movies });
}));

app.get('/api/admin/movies/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const movies = await query('SELECT * FROM MOVIES WHERE id_movie = ?', [id]);
    const movie: any = Array.isArray(movies) && movies.length > 0 ? movies[0] : null;

    if (!movie) {
        return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Lấy thông tin về thể loại
    const genres = await query(
        `SELECT g.id_genre, g.genre_name 
         FROM GENRE g 
         JOIN GENRE_MOVIES gm ON g.id_genre = gm.id_genre 
         WHERE gm.id_movie = ?`,
        [id]
    );

    movie.genres = genres;

    res.json({ success: true, data: movie });
}));

app.post('/api/admin/movies', asyncHandler(async (req: Request, res: Response) => {
    const {
        title,
        original_title,
        director,
        actors,
        duration,
        release_date,
        end_date,
        language,
        country,
        description,
        poster_image,
        trailer_url,
        age_restriction,
        status,
        genres
    } = req.body;

    try {
        await query('START TRANSACTION');

        // Thêm phim mới
        const result = await query(
            `INSERT INTO MOVIES 
             (title, original_title, director, actors, 
              duration, release_date, end_date, language,
              country, description, poster_image, 
              trailer_url, age_restriction, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                original_title,
                director,
                actors,
                duration,
                release_date,
                end_date,
                language,
                country,
                description,
                poster_image,
                trailer_url,
                age_restriction,
                status
            ]
        );

        // Assuming result has insertId property when cast to the appropriate type
        const resultHeader = Array.isArray(result) ? result[0] : result;
        const movieId = (resultHeader as any).insertId;

        // Thêm thể loại
        if (genres && Array.isArray(genres)) {
            for (const genre of genres) {
                // Kiểm tra thể loại tồn tại
                const existingGenres = await query(
                    'SELECT id_genre FROM GENRE WHERE genre_name = ?',
                    [genre]
                );

                let genreId;
                if (Array.isArray(existingGenres) && existingGenres.length > 0) {
                    genreId = (existingGenres[0] as any).id_genre;
                } else {
                    // Tạo thể loại mới
                    const genreResult = await query(
                        'INSERT INTO GENRE (genre_name) VALUES (?)',
                        [genre]
                    );
                    const genreHeader = Array.isArray(genreResult) ? genreResult[0] : genreResult;
                    genreId = (genreHeader as any).insertId;
                }

                // Liên kết phim với thể loại
                await query(
                    'INSERT INTO GENRE_MOVIES (id_movie, id_genre) VALUES (?, ?)',
                    [movieId, genreId]
                );
            }
        }

        await query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Movie created successfully',
            data: { id_movie: movieId }
        });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error creating movie:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create movie'
        });
    }
}));

app.put('/api/admin/movies/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        title,
        original_title,
        director,
        actors,
        duration,
        release_date,
        end_date,
        language,
        country,
        description,
        poster_image,
        trailer_url,
        age_restriction,
        status,
        genres
    } = req.body;

    try {
        await query('START TRANSACTION');

        // Kiểm tra phim tồn tại
        const existingMovies = await query(
            'SELECT id_movie FROM MOVIES WHERE id_movie = ?',
            [id]
        );

        if (!Array.isArray(existingMovies) || existingMovies.length === 0) {
            await query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        // Cập nhật thông tin phim
        await query(
            `UPDATE MOVIES SET 
             title = ?, original_title = ?, director = ?, 
             actors = ?, duration = ?, release_date = ?,
             end_date = ?, language = ?, country = ?,
             description = ?, poster_image = ?, trailer_url = ?,
             age_restriction = ?, status = ?
             WHERE id_movie = ?`,
            [
                title,
                original_title,
                director,
                actors,
                duration,
                release_date,
                end_date,
                language,
                country,
                description,
                poster_image,
                trailer_url,
                age_restriction,
                status,
                id
            ]
        );

        // Cập nhật thể loại nếu có
        if (genres && Array.isArray(genres)) {
            // Xóa thể loại hiện tại
            await query(
                'DELETE FROM GENRE_MOVIES WHERE id_movie = ?',
                [id]
            );

            // Thêm thể loại mới
            for (const genre of genres) {
                // Kiểm tra thể loại tồn tại
                const existingGenres = await query(
                    'SELECT id_genre FROM GENRE WHERE genre_name = ?',
                    [genre]
                );

                let genreId;
                if (Array.isArray(existingGenres) && existingGenres.length > 0) {
                    genreId = (existingGenres[0] as any).id_genre;
                } else {
                    // Tạo thể loại mới
                    const genreResult = await query(
                        'INSERT INTO GENRE (genre_name) VALUES (?)',
                        [genre]
                    );
                    const genreHeader = Array.isArray(genreResult) ? genreResult[0] : genreResult;
                    genreId = (genreHeader as any).insertId;
                }

                // Liên kết phim với thể loại
                await query(
                    'INSERT INTO GENRE_MOVIES (id_movie, id_genre) VALUES (?, ?)',
                    [id, genreId]
                );
            }
        }

        await query('COMMIT');

        res.json({
            success: true,
            message: 'Movie updated successfully'
        });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error updating movie:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update movie'
        });
    }
}));

app.delete('/api/admin/movies/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await query('START TRANSACTION');

        // Xóa liên kết thể loại
        await query('DELETE FROM GENRE_MOVIES WHERE id_movie = ?', [id]);

        // Xóa phim
        const result = await query('DELETE FROM MOVIES WHERE id_movie = ?', [id]);

        const resultHeader = Array.isArray(result) ? result[0] : result;
        const affectedRows = (resultHeader as any).affectedRows || 0;

        if (affectedRows === 0) {
            await query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        await query('COMMIT');

        res.json({
            success: true,
            message: 'Movie deleted successfully'
        });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error deleting movie:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete movie'
        });
    }
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy ở http://localhost:${PORT}`);
});