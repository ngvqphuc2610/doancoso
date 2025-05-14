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
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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
        documentation: '/api/docs', endpoints: {
            movies: '/api/admin/movies',
            cinema: '/api/admin/cinema',
            members: '/api/admin/members',
            products: '/api/admin/products',
            promotions: '/api/admin/promotions',
            entertainment: '/api/admin/entertainment',
            contacts: '/api/contacts',
            showtimes: '/api/admin/showtimes',
            seats: '/api/admin/seats',
            screen: '/api/admin/screen',
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

// API kiểm tra kết nối cơ sở dữ liệu
app.get('/api/test-db-connection', async (req: Request, res: Response) => {
    try {
        // Thử thực hiện một câu query đơn giản
        const result = await query('SELECT 1 as test');
        res.json({
            success: true,
            message: 'Kết nối đến cơ sở dữ liệu thành công',
            data: result
        });
    } catch (error: any) {
        console.error('Lỗi kết nối đến cơ sở dữ liệu:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể kết nối đến cơ sở dữ liệu',
            error: error.message
        });
    }
});

// API liệt kê tất cả các bảng trong database
app.get('/api/list-tables', async (req: Request, res: Response) => {
    try {
        const tables = await query('SHOW TABLES');
        res.json({
            success: true,
            message: 'Danh sách các bảng trong CSDL',
            data: tables
        });
    } catch (error: any) {
        console.error('Lỗi khi lấy danh sách bảng:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách bảng',
            error: error.message
        });
    }
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

        // Sử dụng hàm syncMoviesFromTMDB trực tiếp 
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
    const movies = await query('SELECT * FROM MOVIES ORDER BY id_movie ASC');
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

// ==================== QUẢN LÝ RẠP CHIẾU (CINEMA) ====================

// Lấy danh sách tất cả các rạp chiếu
app.get('/api/admin/cinema', asyncHandler(async (req: Request, res: Response) => {
    try {
        const result = await query('SELECT * FROM CINEMAS ORDER BY id_cinema ASC');

        // Đảm bảo cinemas luôn là mảng
        let cinemas;
        if (Array.isArray(result)) {
            // Nếu result là mảng (kết quả thông thường của MySQL)
            cinemas = result;
        } else if (Array.isArray(result[0])) {
            // Nếu result[0] là mảng (kết quả của mysql2)
            cinemas = result[0];
        } else {
            // Trường hợp còn lại, đảm bảo luôn là mảng
            cinemas = result && typeof result === 'object' ?
                (Object.keys(result).length > 0 ? [result] : []) :
                (result ? [result] : []);
        }

        console.log('Kết quả truy vấn danh sách rạp:', cinemas);
        console.log('Số lượng rạp:', Array.isArray(cinemas) ? cinemas.length : 0);

        // Trả về kết quả thành công
        res.json({
            success: true,
            data: cinemas // Đảm bảo trả về mảng
        });
    } catch (error: any) {
        // In ra chi tiết lỗi để debug
        console.error('Lỗi khi truy vấn danh sách rạp chiếu:', error);
        console.error('Chi tiết lỗi:', error.message);
        console.error('Stack trace:', error.stack);

        // Trả về thông tin lỗi chi tiết
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách rạp chiếu',
            errorDetails: {
                message: error.message,
                code: error.code,
                sqlMessage: error.sqlMessage,
                sqlState: error.sqlState
            }
        });
    }
}));
// Lấy thông tin chi tiết của một rạp chiếu
app.get('/api/admin/cinema/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT * FROM CINEMAS WHERE id_cinema = ?', [id]);
        const cinemas = result[0];

        if (!Array.isArray(cinemas) || cinemas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy rạp chiếu với ID này'
            });
        }

        res.json({
            success: true,
            data: cinemas[0]
        });
    } catch (error) {
        console.error('Lỗi khi truy vấn chi tiết rạp chiếu:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thông tin rạp chiếu'
        });
    }
}));

// Thêm rạp chiếu mới
app.post('/api/admin/cinema', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { cinema_name, address, contact_number, status } = req.body;

        // Validate đầu vào
        if (!cinema_name || !address) {
            return res.status(400).json({
                success: false,
                message: 'Tên rạp và địa chỉ là bắt buộc'
            });
        } const result = await query(
            'INSERT INTO CINEMAS (cinema_name, address, contact_number, status) VALUES (?, ?, ?, ?)',
            [cinema_name, address, contact_number, status || 'active']
        );

        res.status(201).json({
            success: true,
            message: 'Thêm rạp chiếu thành công',
            data: {
                id_cinema: result.insertId,
                cinema_name,
                address,
                contact_number,
                status: status || 'active'
            }
        });
    } catch (error) {
        console.error('Lỗi khi thêm rạp chiếu:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể thêm rạp chiếu'
        });
    }
}));

// Cập nhật thông tin rạp chiếu
app.put('/api/admin/cinema/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { cinema_name, address, contact_number, status } = req.body; if (!cinema_name || !address) {
            return res.status(400).json({
                success: false,
                message: 'Tên rạp và địa chỉ là bắt buộc'
            });
        }
        const [checkExists] = await query('SELECT * FROM CINEMAS WHERE id_cinema = ?', [id]);
        if (checkExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy rạp chiếu để cập nhật'
            });
        }

        await query(
            'UPDATE CINEMAS SET cinema_name = ?, address = ?, contact_number = ?, status = ? WHERE id_cinema = ?',
            [cinema_name, address, contact_number, status, id]
        );

        res.json({
            success: true,
            message: 'Cập nhật thông tin rạp chiếu thành công',
            data: {
                id_cinema: parseInt(id),
                cinema_name,
                address,
                contact_number,
                status
            }
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin rạp chiếu:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật thông tin rạp chiếu'
        });
    }
}));

// Cập nhật trạng thái rạp chiếu
app.patch('/api/admin/cinema/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }
        const [checkExists] = await query('SELECT * FROM CINEMAS WHERE id_cinema = ?', [id]);
        if (checkExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy rạp chiếu để cập nhật'
            });
        }

        await query('UPDATE CINEMAS SET status = ? WHERE id_cinema = ?', [status, id]);

        res.json({
            success: true,
            message: 'Cập nhật trạng thái rạp chiếu thành công',
            data: {
                id_cinema: parseInt(id),
                status
            }
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái rạp chiếu:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật trạng thái rạp chiếu'
        });
    }
}));

// Xóa rạp chiếu
app.delete('/api/admin/cinema/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const [checkExists] = await query('SELECT * FROM CINEMAS WHERE id_cinema = ?', [id]);
        if (checkExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy rạp chiếu để xóa'
            });
        }

        // Kiểm tra nếu rạp có các phòng chiếu, lịch chiếu liên quan
        const [hasRooms] = await query('SELECT COUNT(*) as count FROM SCREEN WHERE id_cinema = ?', [id]);
        if (hasRooms[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa rạp vì còn các phòng chiếu liên quan'
            });
        }

        await query('DELETE FROM CINEMAS WHERE id_cinema = ?', [id]);

        res.json({
            success: true,
            message: 'Xóa rạp chiếu thành công'
        });
    } catch (error) {
        console.error('Lỗi khi xóa rạp chiếu:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa rạp chiếu'
        });
    }
}));

// ==================== QUẢN LÝ THÀNH VIÊN (MEMBERS) ====================

// Lấy danh sách tất cả các thành viên
app.get('/api/admin/members', asyncHandler(async (req: Request, res: Response) => {
    try {
        const results = await query('SELECT * FROM members ORDER BY id_member DESC');
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Lỗi khi truy vấn danh sách thành viên:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách thành viên'
        });
    }
}));

// Lấy thông tin chi tiết của một thành viên
app.get('/api/admin/members/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const results = await query('SELECT * FROM members WHERE id_member = ?', [id]);

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thành viên với ID này'
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    } catch (error) {
        console.error('Lỗi khi truy vấn chi tiết thành viên:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thông tin thành viên'
        });
    }
}));

// Thêm thành viên mới
app.post('/api/admin/members', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { full_name, email, phone, membership_level, points, status } = req.body;

        // Validate đầu vào
        if (!full_name || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Họ tên, email và số điện thoại là bắt buộc'
            });
        }

        // Kiểm tra email/phone đã tồn tại chưa
        const checkEmail = await query('SELECT * FROM members WHERE email = ?', [email]);
        if (checkEmail.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng bởi thành viên khác'
            });
        }

        const checkPhone = await query('SELECT * FROM members WHERE phone = ?', [phone]);
        if (checkPhone.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Số điện thoại đã được sử dụng bởi thành viên khác'
            });
        }

        const join_date = new Date().toISOString().slice(0, 10);

        const result = await query(
            'INSERT INTO members (full_name, email, phone, membership_level, points, join_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [full_name, email, phone, membership_level || 'regular', points || 0, join_date, status || 'active']
        );

        res.status(201).json({
            success: true,
            message: 'Thêm thành viên thành công',
            data: {
                id_member: result.insertId,
                full_name,
                email,
                phone,
                membership_level: membership_level || 'regular',
                points: points || 0,
                join_date,
                status: status || 'active'
            }
        });
    } catch (error) {
        console.error('Lỗi khi thêm thành viên:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể thêm thành viên'
        });
    }
}));

// Cập nhật thông tin thành viên
app.put('/api/admin/members/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { full_name, email, phone, membership_level, points, status } = req.body;

        if (!full_name || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Họ tên, email và số điện thoại là bắt buộc'
            });
        }

        const checkExists = await query('SELECT * FROM members WHERE id_member = ?', [id]);
        if (checkExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thành viên để cập nhật'
            });
        }

        // Kiểm tra email/phone đã tồn tại chưa (trừ chính thành viên này)
        const checkEmail = await query('SELECT * FROM members WHERE email = ? AND id_member != ?', [email, id]);
        if (checkEmail.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng bởi thành viên khác'
            });
        }

        const checkPhone = await query('SELECT * FROM members WHERE phone = ? AND id_member != ?', [phone, id]);
        if (checkPhone.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Số điện thoại đã được sử dụng bởi thành viên khác'
            });
        }

        await query(
            'UPDATE members SET full_name = ?, email = ?, phone = ?, membership_level = ?, points = ?, status = ? WHERE id_member = ?',
            [full_name, email, phone, membership_level, points, status, id]
        );

        res.json({
            success: true,
            message: 'Cập nhật thông tin thành viên thành công',
            data: {
                id_member: parseInt(id),
                full_name,
                email,
                phone,
                membership_level,
                points,
                status
            }
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin thành viên:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật thông tin thành viên'
        });
    }
}));

// Cập nhật trạng thái thành viên
app.patch('/api/admin/members/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        const checkExists = await query('SELECT * FROM members WHERE id_member = ?', [id]);
        if (checkExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thành viên để cập nhật'
            });
        }

        await query('UPDATE members SET status = ? WHERE id_member = ?', [status, id]);

        res.json({
            success: true,
            message: 'Cập nhật trạng thái thành viên thành công',
            data: {
                id_member: parseInt(id),
                status
            }
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái thành viên:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật trạng thái thành viên'
        });
    }
}));

// Xóa thành viên
app.delete('/api/admin/members/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const checkExists = await query('SELECT * FROM members WHERE id_member = ?', [id]);
        if (checkExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thành viên để xóa'
            });
        }

        await query('DELETE FROM members WHERE id_member = ?', [id]);

        res.json({
            success: true,
            message: 'Xóa thành viên thành công'
        });
    } catch (error) {
        console.error('Lỗi khi xóa thành viên:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa thành viên'
        });
    }
}));

// ==================== QUẢN LÝ SẢN PHẨM (PRODUCTS) ====================

// Lấy danh sách tất cả các sản phẩm
app.get('/api/admin/products', asyncHandler(async (req: Request, res: Response) => {
    try {
        const results = await query('SELECT * FROM product ORDER BY id_product DESC');
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Lỗi khi truy vấn danh sách sản phẩm:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách sản phẩm'
        });
    }
}));

// Lấy thông tin chi tiết của một sản phẩm
app.get('/api/admin/products/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const results = await query('SELECT * FROM products WHERE id_product = ?', [id]);

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm với ID này'
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    } catch (error) {
        console.error('Lỗi khi truy vấn chi tiết sản phẩm:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thông tin sản phẩm'
        });
    }
}));

// Thêm sản phẩm mới
app.post('/api/admin/products', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { product_name, category, price, image_url, description, stock, status } = req.body;

        // Validate đầu vào
        if (!product_name || !category || price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Tên sản phẩm, loại và giá là bắt buộc'
            });
        }

        const result = await query(
            'INSERT INTO products (product_name, category, price, image_url, description, stock, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [product_name, category, price, image_url || null, description || null, stock || 0, status || 'available']
        );

        res.status(201).json({
            success: true,
            message: 'Thêm sản phẩm thành công',
            data: {
                id_product: result.insertId,
                product_name,
                category,
                price,
                image_url: image_url || null,
                description: description || null,
                stock: stock || 0,
                status: status || 'available'
            }
        });
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể thêm sản phẩm'
        });
    }
}));

// Cập nhật thông tin sản phẩm
app.put('/api/admin/products/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { product_name, category, price, image_url, description, stock, status } = req.body;

        if (!product_name || !category || price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Tên sản phẩm, loại và giá là bắt buộc'
            });
        }

        const checkExists = await query('SELECT * FROM products WHERE id_product = ?', [id]);
        if (checkExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm để cập nhật'
            });
        }

        await query(
            'UPDATE products SET product_name = ?, category = ?, price = ?, image_url = ?, description = ?, stock = ?, status = ? WHERE id_product = ?',
            [product_name, category, price, image_url, description, stock, status, id]
        );

        res.json({
            success: true,
            message: 'Cập nhật thông tin sản phẩm thành công',
            data: {
                id_product: parseInt(id),
                product_name,
                category,
                price,
                image_url,
                description,
                stock,
                status
            }
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin sản phẩm:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật thông tin sản phẩm'
        });
    }
}));

// Cập nhật trạng thái sản phẩm
app.patch('/api/admin/products/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, stock } = req.body;

        if (status === undefined && stock === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Phải cung cấp trạng thái hoặc số lượng để cập nhật'
            });
        }

        const checkExists = await query('SELECT * FROM products WHERE id_product = ?', [id]);
        if (checkExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm để cập nhật'
            });
        }

        if (status !== undefined && stock !== undefined) {
            await query('UPDATE products SET status = ?, stock = ? WHERE id_product = ?', [status, stock, id]);
        } else if (status !== undefined) {
            await query('UPDATE products SET status = ? WHERE id_product = ?', [status, id]);
        } else if (stock !== undefined) {
            await query('UPDATE products SET stock = ? WHERE id_product = ?', [stock, id]);
        }

        res.json({
            success: true,
            message: 'Cập nhật trạng thái sản phẩm thành công',
            data: {
                id_product: parseInt(id),
                ...(status !== undefined && { status }),
                ...(stock !== undefined && { stock })
            }
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái sản phẩm:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật trạng thái sản phẩm'
        });
    }
}));

// Xóa sản phẩm
app.delete('/api/admin/products/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const checkExists = await query('SELECT * FROM products WHERE id_product = ?', [id]);
        if (checkExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm để xóa'
            });
        }

        await query('DELETE FROM products WHERE id_product = ?', [id]);

        res.json({
            success: true,
            message: 'Xóa sản phẩm thành công'
        });
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa sản phẩm'
        });
    }
}));

// ==================== QUẢN LÝ KHUYẾN MÃI (PROMOTIONS) ====================

// Lấy danh sách tất cả các khuyến mãi
app.get('/api/admin/promotions', asyncHandler(async (req: Request, res: Response) => {
    try {
        const results = await query('SELECT * FROM promotions ORDER BY id_promotion DESC');
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Lỗi khi truy vấn danh sách khuyến mãi:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách khuyến mãi'
        });
    }
}));

// Lấy thông tin chi tiết của một khuyến mãi
app.get('/api/admin/promotions/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const results = await query('SELECT * FROM promotions WHERE id_promotion = ?', [id]);

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khuyến mãi với ID này'
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    } catch (error) {
        console.error('Lỗi khi truy vấn chi tiết khuyến mãi:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thông tin khuyến mãi'
        });
    }
}));

// Thêm khuyến mãi mới
app.post('/api/admin/promotions', asyncHandler(async (req: Request, res: Response) => {
    try {
        const {
            promotion_name,
            promotion_type,
            discount_amount,
            code,
            start_date,
            end_date,
            usage_limit,
            used_count,
            status
        } = req.body;

        // Validate đầu vào
        if (!promotion_name || !promotion_type || discount_amount === undefined || !code) {
            return res.status(400).json({
                success: false,
                message: 'Tên khuyến mãi, loại giảm giá, mức giảm giá và mã khuyến mãi là bắt buộc'
            });
        }

        // Kiểm tra mã khuyến mãi đã tồn tại chưa
        const checkCode = await query('SELECT * FROM promotions WHERE code = ?', [code]);
        if (checkCode.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Mã khuyến mãi đã tồn tại'
            });
        }

        const currentDate = new Date().toISOString().split('T')[0];

        const result = await query(
            `INSERT INTO promotions (
                promotion_name, promotion_type, discount_amount, code, 
                start_date, end_date, usage_limit, used_count, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                promotion_name,
                promotion_type,
                discount_amount,
                code,
                start_date || currentDate,
                end_date || null,
                usage_limit || null,
                used_count || 0,
                status || 'active'
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Thêm khuyến mãi thành công',
            data: {
                id_promotion: result.insertId,
                promotion_name,
                promotion_type,
                discount_amount,
                code,
                start_date: start_date || currentDate,
                end_date: end_date || null,
                usage_limit: usage_limit || null,
                used_count: used_count || 0,
                status: status || 'active'
            }
        });
    } catch (error) {
        console.error('Lỗi khi thêm khuyến mãi:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể thêm khuyến mãi'
        });
    }
}));

// Cập nhật thông tin khuyến mãi
app.put('/api/admin/promotions/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            promotion_name,
            promotion_type,
            discount_amount,
            code,
            start_date,
            end_date,
            usage_limit,
            used_count,
            status
        } = req.body;

        if (!promotion_name || !promotion_type || discount_amount === undefined || !code) {
            return res.status(400).json({
                success: false,
                message: 'Tên khuyến mãi, loại giảm giá, mức giảm giá và mã khuyến mãi là bắt buộc'
            });
        }

        const checkExists = await query('SELECT * FROM promotions WHERE id_promotion = ?', [id]);
        if (checkExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khuyến mãi để cập nhật'
            });
        }

        // Kiểm tra mã khuyến mãi đã tồn tại chưa (trừ chính khuyến mãi này)
        const checkCode = await query('SELECT * FROM promotions WHERE code = ? AND id_promotion != ?', [code, id]);
        if (checkCode.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Mã khuyến mãi đã tồn tại'
            });
        }

        await query(
            `UPDATE promotions SET 
                promotion_name = ?, promotion_type = ?, discount_amount = ?, code = ?, 
                start_date = ?, end_date = ?, usage_limit = ?, used_count = ?, status = ?
            WHERE id_promotion = ?`,
            [
                promotion_name,
                promotion_type,
                discount_amount,
                code,
                start_date,
                end_date,
                usage_limit,
                used_count,
                status,
                id
            ]
        );

        res.json({
            success: true,
            message: 'Cập nhật thông tin khuyến mãi thành công',
            data: {
                id_promotion: parseInt(id),
                promotion_name,
                promotion_type,
                discount_amount,
                code,
                start_date,
                end_date,
                usage_limit,
                used_count,
                status
            }
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin khuyến mãi:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật thông tin khuyến mãi'
        });
    }
}));

// Cập nhật trạng thái khuyến mãi
app.patch('/api/admin/promotions/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, used_count } = req.body;

        if (status === undefined && used_count === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Phải cung cấp trạng thái hoặc số lượng đã sử dụng để cập nhật'
            });
        }

        const checkExists = await query('SELECT * FROM promotions WHERE id_promotion = ?', [id]);
        if (checkExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khuyến mãi để cập nhật'
            });
        }

        if (status !== undefined && used_count !== undefined) {
            await query('UPDATE promotions SET status = ?, used_count = ? WHERE id_promotion = ?', [status, used_count, id]);
        } else if (status !== undefined) {
            await query('UPDATE promotions SET status = ? WHERE id_promotion = ?', [status, id]);
        } else if (used_count !== undefined) {
            await query('UPDATE promotions SET used_count = ? WHERE id_promotion = ?', [used_count, id]);
        }

        res.json({
            success: true,
            message: 'Cập nhật trạng thái khuyến mãi thành công',
            data: {
                id_promotion: parseInt(id),
                ...(status !== undefined && { status }),
                ...(used_count !== undefined && { used_count })
            }
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái khuyến mãi:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật trạng thái khuyến mãi'
        });
    }
}));

// Xóa khuyến mãi
app.delete('/api/admin/promotions/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const checkExists = await query('SELECT * FROM promotions WHERE id_promotion = ?', [id]);
        if (checkExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khuyến mãi để xóa'
            });
        }

        await query('DELETE FROM promotions WHERE id_promotion = ?', [id]);

        res.json({
            success: true,
            message: 'Xóa khuyến mãi thành công'
        });
    } catch (error) {
        console.error('Lỗi khi xóa khuyến mãi:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa khuyến mãi'
        });
    }
}));

// ==================== QUẢN LÝ DỊCH VỤ GIẢI TRÍ (ENTERTAINMENT) ====================

// Lấy danh sách tất cả các dịch vụ giải trí
app.get('/api/admin/entertainment', asyncHandler(async (req: Request, res: Response) => {
    try {
        const results = await query('SELECT * FROM entertainment ORDER BY id_entertainment DESC');
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Lỗi khi truy vấn danh sách dịch vụ giải trí:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách dịch vụ giải trí'
        });
    }
}));

// Lấy thông tin chi tiết của một dịch vụ giải trí
app.get('/api/admin/entertainment/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const results = await query('SELECT * FROM entertainment WHERE id_entertainment = ?', [id]);

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy dịch vụ giải trí với ID này'
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    } catch (error) {
        console.error('Lỗi khi truy vấn chi tiết dịch vụ giải trí:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thông tin dịch vụ giải trí'
        });
    }
}));

// Thêm dịch vụ giải trí mới
app.post('/api/admin/entertainment', asyncHandler(async (req: Request, res: Response) => {
    try {
        const {
            name,
            type,
            location,
            description,
            image_url,
            price,
            opening_hours,
            status
        } = req.body;

        // Validate đầu vào
        if (!name || !type || !location) {
            return res.status(400).json({
                success: false,
                message: 'Tên dịch vụ, loại và địa điểm là bắt buộc'
            });
        }

        const result = await query(
            `INSERT INTO entertainment (
                name, type, location, description, image_url, 
                price, opening_hours, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                type,
                location,
                description || null,
                image_url || null,
                price || 0,
                opening_hours || null,
                status || 'active'
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Thêm dịch vụ giải trí thành công',
            data: {
                id_entertainment: result.insertId,
                name,
                type,
                location,
                description: description || null,
                image_url: image_url || null,
                price: price || 0,
                opening_hours: opening_hours || null,
                status: status || 'active'
            }
        });
    } catch (error) {
        console.error('Lỗi khi thêm dịch vụ giải trí:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể thêm dịch vụ giải trí'
        });
    }
}));

// Cập nhật thông tin dịch vụ giải trí
app.put('/api/admin/entertainment/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            name,
            type,
            location,
            description,
            image_url,
            price,
            opening_hours,
            status
        } = req.body;

        if (!name || !type || !location) {
            return res.status(400).json({
                success: false,
                message: 'Tên dịch vụ, loại và địa điểm là bắt buộc'
            });
        }

        const checkExists = await query('SELECT * FROM entertainment WHERE id_entertainment = ?', [id]);
        if (checkExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy dịch vụ giải trí để cập nhật'
            });
        }

        await query(
            `UPDATE entertainment SET 
                name = ?, type = ?, location = ?, description = ?, 
                image_url = ?, price = ?, opening_hours = ?, status = ?
            WHERE id_entertainment = ?`,
            [
                name,
                type,
                location,
                description,
                image_url,
                price,
                opening_hours,
                status,
                id
            ]
        );

        res.json({
            success: true,
            message: 'Cập nhật thông tin dịch vụ giải trí thành công',
            data: {
                id_entertainment: parseInt(id),
                name,
                type,
                location,
                description,
                image_url,
                price,
                opening_hours,
                status
            }
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin dịch vụ giải trí:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật thông tin dịch vụ giải trí'
        });
    }
}));

// Cập nhật trạng thái dịch vụ giải trí
app.patch('/api/admin/entertainment/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái là bắt buộc'
            });
        }

        const checkExists = await query('SELECT * FROM entertainment WHERE id_entertainment = ?', [id]);
        if (checkExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy dịch vụ giải trí để cập nhật'
            });
        }

        await query('UPDATE entertainment SET status = ? WHERE id_entertainment = ?', [status, id]);

        res.json({
            success: true,
            message: 'Cập nhật trạng thái dịch vụ giải trí thành công',
            data: {
                id_entertainment: parseInt(id),
                status
            }
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái dịch vụ giải trí:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật trạng thái dịch vụ giải trí'
        });
    }
}));

// Xóa dịch vụ giải trí
app.delete('/api/admin/entertainment/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const checkExists = await query('SELECT * FROM entertainment WHERE id_entertainment = ?', [id]);
        if (checkExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy dịch vụ giải trí để xóa'
            });
        }

        await query('DELETE FROM entertainment WHERE id_entertainment = ?', [id]);

        res.json({
            success: true,
            message: 'Xóa dịch vụ giải trí thành công'
        });
    } catch (error) {
        console.error('Lỗi khi xóa dịch vụ giải trí:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa dịch vụ giải trí'
        });
    }
}));

// ==================== SHOW TIMES============
// Lấy danh sách tất cả các show time
app.get('/api/admin/showtimes', asyncHandler(async (req: Request, res: Response) => {
    try {
        const result = await query('SELECT * FROM showtimes ORDER BY id_showtime ASC');

        // Đảm bảo cinemas luôn là mảng
        let showtimes;
        if (Array.isArray(result)) {
            // Nếu result là mảng (kết quả thông thường của MySQL)
            showtimes = result;
        } else if (Array.isArray(result[0])) {
            // Nếu result[0] là mảng (kết quả của mysql2)
            showtimes = result[0];
        } else {
            // Trường hợp còn lại, đảm bảo luôn là mảng
            showtimes = result && typeof result === 'object' ?
                (Object.keys(result).length > 0 ? [result] : []) :
                (result ? [result] : []);
        }

        console.log('Kết quả truy vấn danh sách rạp:', showtimes);
        console.log('Số lượng rạp:', Array.isArray(showtimes) ? showtimes.length : 0);

        // Trả về kết quả thành công
        res.json({
            success: true,
            data: showtimes // Đảm bảo trả về mảng
        });
    } catch (error: any) {
        // In ra chi tiết lỗi để debug
        console.error('Lỗi khi truy vấn danh sách showtimes:', error);
        console.error('Chi tiết lỗi:', error.message);
        console.error('Stack trace:', error.stack);

        // Trả về thông tin lỗi chi tiết
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách showtimes',
            errorDetails: {
                message: error.message,
                code: error.code,
                sqlMessage: error.sqlMessage,
                sqlState: error.sqlState
            }
        });
    }
}));

//==============seat==========
// Lấy danh sách tất cả các show time
app.get('/api/admin/seats', asyncHandler(async (req: Request, res: Response) => {
    try {
        const result = await query('SELECT * FROM seat ORDER BY id_seats ASC');

        // Đảm bảo cinemas luôn là mảng
        let seats;
        if (Array.isArray(result)) {
            // Nếu result là mảng (kết quả thông thường của MySQL)
            seats = result;
        } else if (Array.isArray(result[0])) {
            // Nếu result[0] là mảng (kết quả của mysql2)
            seats = result[0];
        } else {
            // Trường hợp còn lại, đảm bảo luôn là mảng
            seats = result && typeof result === 'object' ?
                (Object.keys(result).length > 0 ? [result] : []) :
                (result ? [result] : []);
        }

        console.log('Kết quả truy vấn danh sách ghế', seats);
        console.log('Số lượng ghế : ', Array.isArray(seats) ? seats.length : 0);

        // Trả về kết quả thành công
        res.json({
            success: true,
            data: seats // Đảm bảo trả về mảng
        });
    } catch (error: any) {
        // In ra chi tiết lỗi để debug
        console.error('Lỗi khi truy vấn danh sách seats:', error);
        console.error('Chi tiết lỗi:', error.message);
        console.error('Stack trace:', error.stack);

        // Trả về thông tin lỗi chi tiết
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách seats',
            errorDetails: {
                message: error.message,
                code: error.code,
                sqlMessage: error.sqlMessage,
                sqlState: error.sqlState
            }
        });
    }
}));

//===============screen=======
app.get('/api/admin/screen', asyncHandler(async (req: Request, res: Response) => {
    try {
        const result = await query('SELECT * FROM screen ORDER BY id_screen ASC');

        // Đảm bảo cinemas luôn là mảng
        let screen;
        if (Array.isArray(result)) {
            // Nếu result là mảng (kết quả thông thường của MySQL)
            screen = result;
        } else if (Array.isArray(result[0])) {
            // Nếu result[0] là mảng (kết quả của mysql2)
            screen = result[0];
        } else {
            // Trường hợp còn lại, đảm bảo luôn là mảng
            screen = result && typeof result === 'object' ?
                (Object.keys(result).length > 0 ? [result] : []) :
                (result ? [result] : []);
        }

        console.log('Kết quả truy vấn danh sách phòng chiếu', screen);
        console.log('Số lượng phòng chiếu : ', Array.isArray(screen) ? screen.length : 0);

        // Trả về kết quả thành công
        res.json({
            success: true,
            data: screen // Đảm bảo trả về mảng
        });
    } catch (error: any) {
        // In ra chi tiết lỗi để debug
        console.error('Lỗi khi truy vấn danh sách screen:', error);
        console.error('Chi tiết lỗi:', error.message);
        console.error('Stack trace:', error.stack);

        // Trả về thông tin lỗi chi tiết
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách screen',
            errorDetails: {
                message: error.message,
                code: error.code,
                sqlMessage: error.sqlMessage,
                sqlState: error.sqlState
            }
        });
    }
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy ở http://localhost:${PORT}`);
});