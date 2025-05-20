"use server";

import { query } from './db';

export interface Movie {
    id_movie: number;
    title: string;
    original_title: string | null;
    director: string | null;
    actors: string | null;
    duration: number;
    release_date: string;
    end_date: string | null;
    language: string | null;
    subtitle: string | null;
    country: string | null;
    description: string | null;
    poster_image: string | null;
    trailer_url: string | null;
    age_restriction: string | null;
    status: 'coming soon' | 'now showing' | 'ended';
    genres?: string[];
}

export async function getNowShowingMovies(): Promise<Movie[]> {
    try {
        const movies = await query<Movie[]>(`
            SELECT m.*, 
                GROUP_CONCAT(DISTINCT g.genre_name ORDER BY g.genre_name SEPARATOR ', ') as genres
            FROM movies m
            LEFT JOIN genre_movies gm ON m.id_movie = gm.id_movie
            LEFT JOIN genre g ON gm.id_genre = g.id_genre
            WHERE m.status = 'now showing'
            GROUP BY m.id_movie
            ORDER BY m.release_date DESC
        `);

        return formatMovies(movies);
    } catch (error) {
        console.error("Lỗi khi lấy phim đang chiếu:", error);
        return [];
    }
}

export async function getComingSoonMovies(): Promise<Movie[]> {
    try {
        const movies = await query<Movie[]>(`
            SELECT m.*, 
                GROUP_CONCAT(DISTINCT g.genre_name ORDER BY g.genre_name SEPARATOR ', ') as genres
            FROM movies m
            LEFT JOIN genre_movies gm ON m.id_movie = gm.id_movie
            LEFT JOIN genre g ON gm.id_genre = g.id_genre
            WHERE m.status = 'coming soon'
            GROUP BY m.id_movie
            ORDER BY m.release_date ASC
        `);

        return formatMovies(movies);
    } catch (error) {
        console.error("Lỗi khi lấy phim sắp chiếu:", error);
        return [];
    }
}

export async function getMovieById(id: number | string): Promise<Movie | null> {
    try {
        const movies = await query<Movie[]>(`
            SELECT m.*, 
                GROUP_CONCAT(DISTINCT g.genre_name ORDER BY g.genre_name SEPARATOR ', ') as genres
            FROM movies m
            LEFT JOIN genre_movies gm ON m.id_movie = gm.id_movie
            LEFT JOIN genre g ON gm.id_genre = g.id_genre
            WHERE m.id_movie = ?
            GROUP BY m.id_movie
        `, [id]);

        if (movies.length === 0) {
            return null;
        }

        const formattedMovies = formatMovies(movies);
        return formattedMovies[0] || null;
    } catch (error) {
        console.error(`Lỗi khi lấy phim với id ${id}:`, error);
        return null;
    }
}

export async function getPopularMovies(): Promise<Movie[]> {
    try {
        // Lấy các phim phổ biến dựa trên số lượng showtime
        const movies = await query<Movie[]>(`
            SELECT m.*, 
                COUNT(s.id_showtime) as showtime_count,
                GROUP_CONCAT(DISTINCT g.genre_name ORDER BY g.genre_name SEPARATOR ', ') as genres
            FROM movies m
            LEFT JOIN showtimes s ON m.id_movie = s.id_movie AND s.show_date >= CURRENT_DATE
            LEFT JOIN genre_movies gm ON m.id_movie = gm.id_movie
            LEFT JOIN genre g ON gm.id_genre = g.id_genre
            WHERE m.status = 'now showing'
            GROUP BY m.id_movie
            ORDER BY showtime_count DESC, m.release_date DESC
            LIMIT 10
        `);

        return formatMovies(movies);
    } catch (error) {
        console.error("Lỗi khi lấy phim phổ biến:", error);
        return [];
    }
}

export async function getAllMovies(): Promise<Movie[]> {
    try {
        const movies = await query<Movie[]>(`
            SELECT m.*, 
                GROUP_CONCAT(DISTINCT g.genre_name ORDER BY g.genre_name SEPARATOR ', ') as genres
            FROM movies m
            LEFT JOIN genre_movies gm ON m.id_movie = gm.id_movie
            LEFT JOIN genre g ON gm.id_genre = g.id_genre
            GROUP BY m.id_movie
            ORDER BY m.release_date DESC
        `);

        return formatMovies(movies);
    } catch (error) {
        console.error("Lỗi khi lấy tất cả phim:", error);
        return [];
    }
}

// Thêm phim mới
export async function createMovie(movieData: any): Promise<{ success: boolean; message?: string; movieId?: number }> {
    try {
        const {
            title,
            director,
            cast,
            description,
            duration,
            release_date,
            end_date,
            poster_url,
            trailer_url,
            age_restriction,
            status,
            genres
        } = movieData;

        // Validate dữ liệu đầu vào
        if (!title || !release_date || !status) {
            return {
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc (tiêu đề, ngày chiếu, trạng thái)'
            };
        }        // Thêm phim vào database
        const result = await query(`
            INSERT INTO movies 
                (title, director, actors, description, duration, release_date, end_date, poster_image, trailer_url, age_restriction, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [title, director, cast, description, duration, release_date, end_date, poster_url, trailer_url, age_restriction, status]);

        const movieId = (result as any).insertId;

        // Thêm thể loại phim nếu có
        if (genres && genres.length > 0) {
            // Xử lý theo định dạng của genres (có thể là mảng ID hoặc mảng tên)
            for (const genre of genres) {
                let genreId;

                if (typeof genre === 'number') {
                    genreId = genre;
                } else if (typeof genre === 'string') {
                    // Kiểm tra xem thể loại đã tồn tại chưa
                    const existingGenre = await query('SELECT id_genre FROM genre WHERE genre_name = ?', [genre]);

                    if (existingGenre && (existingGenre as any[]).length > 0) {
                        genreId = (existingGenre as any[])[0].id_genre;
                    } else {
                        // Thêm thể loại mới
                        const newGenre = await query('INSERT INTO genre (genre_name) VALUES (?)', [genre]);
                        genreId = (newGenre as any).insertId;
                    }
                }

                if (genreId) {
                    // Thêm vào bảng liên kết
                    await query('INSERT INTO genre_movies (id_movie, id_genre) VALUES (?, ?)', [movieId, genreId]);
                }
            }
        }

        return { success: true, movieId };
    } catch (error: any) {
        console.error('Lỗi khi thêm phim mới:', error);
        return { success: false, message: `Đã xảy ra lỗi: ${error.message}` };
    }
}

// Cập nhật phim
export async function updateMovie(id: number, movieData: any): Promise<{ success: boolean; message?: string; movie?: Movie }> {
    try {
        // Kiểm tra phim có tồn tại không
        const existingMovie = await getMovieById(id);
        if (!existingMovie) {
            return { success: false, message: 'Không tìm thấy phim cần cập nhật' };
        }

        const {
            title,
            director,
            cast,
            description,
            duration,
            release_date,
            end_date,
            poster_url,
            trailer_url,
            age_restriction,
            status,
            genres
        } = movieData;

        // Cập nhật thông tin phim
        await query(`
            UPDATE movies SET
                title = ?,
                director = ?,
                actors = ?,
                description = ?,
                duration = ?,
                release_date = ?,
                end_date = ?,
                poster_image = ?,
                trailer_url = ?,
                age_restriction = ?,
                status = ?
            WHERE id_movie = ?
        `, [
            title || existingMovie.title,
            director || existingMovie.director,
            cast || existingMovie.actors,
            description || existingMovie.description,
            duration || existingMovie.duration,
            release_date || existingMovie.release_date,
            end_date || existingMovie.end_date,
            poster_url || existingMovie.poster_image,
            trailer_url || existingMovie.trailer_url,
            age_restriction || existingMovie.age_restriction,
            status || existingMovie.status,
            id
        ]);

        // Cập nhật thể loại nếu có
        if (genres && genres.length > 0) {
            // Xóa tất cả thể loại hiện tại của phim
            await query('DELETE FROM genre_movies WHERE id_movie = ?', [id]);

            // Thêm lại các thể loại mới
            for (const genre of genres) {
                let genreId;

                if (typeof genre === 'number') {
                    genreId = genre;
                } else if (typeof genre === 'string') {
                    // Kiểm tra xem thể loại đã tồn tại chưa
                    const existingGenre = await query('SELECT id_genre FROM genre WHERE genre_name = ?', [genre]);

                    if (existingGenre && (existingGenre as any[]).length > 0) {
                        genreId = (existingGenre as any[])[0].id_genre;
                    } else {
                        // Thêm thể loại mới
                        const newGenre = await query('INSERT INTO genre (genre_name) VALUES (?)', [genre]);
                        genreId = (newGenre as any).insertId;
                    }
                }

                if (genreId) {
                    // Thêm vào bảng liên kết
                    await query('INSERT INTO genre_movies (id_movie, id_genre) VALUES (?, ?)', [id, genreId]);
                }
            }
        }

        // Lấy thông tin phim sau khi cập nhật
        const updatedMovie = await getMovieById(id);
        return { success: true, movie: updatedMovie as Movie };
    } catch (error: any) {
        console.error(`Lỗi khi cập nhật phim ID ${id}: `, error);
        return { success: false, message: `Đã xảy ra lỗi: ${error.message} ` };
    }
}

// Xóa phim
export async function deleteMovie(id: number): Promise<{ success: boolean; message?: string }> {
    try {
        // Kiểm tra phim có tồn tại không
        const existingMovie = await getMovieById(id);
        if (!existingMovie) {
            return { success: false, message: 'Không tìm thấy phim cần xóa' };
        }

        // Kiểm tra phim có đang được sử dụng trong lịch chiếu không
        const schedules = await query('SELECT COUNT(*) as count FROM showtimes WHERE id_movie = ?', [id]);
        if (schedules && (schedules as any[])[0].count > 0) {
            return {
                success: false,
                message: 'Không thể xóa phim này vì nó đang được sử dụng trong lịch chiếu'
            };
        }

        // Xóa các liên kết với thể loại
        await query('DELETE FROM genre_movies WHERE id_movie = ?', [id]);

        // Xóa các đánh giá của phim nếu có
        await query('DELETE FROM ratings WHERE movie_id = ?', [id]);

        // Xóa phim
        await query('DELETE FROM movies WHERE id_movie = ?', [id]);

        return { success: true };
    } catch (error: any) {
        console.error(`Lỗi khi xóa phim ID ${id}: `, error);
        return { success: false, message: `Đã xảy ra lỗi: ${error.message} ` };
    }
}

// Lấy danh sách thể loại phim
export async function getGenres(): Promise<{ id: number, name: string }[]> {
    try {
        const genres = await query<{ id_genre: number, genre_name: string }[]>(
            'SELECT id_genre, genre_name FROM genre ORDER BY genre_name'
        );

        return genres.map(genre => ({
            id: genre.id_genre,
            name: genre.genre_name
        }));
    } catch (error) {
        console.error('Lỗi khi lấy danh sách thể loại phim:', error);
        return [];
    }
}

// Hàm hỗ trợ để định dạng dữ liệu phim từ database
function formatMovies(movies: any[]): Movie[] {
    return movies.map(movie => {
        // Chuyển đổi trường genres từ chuỗi sang mảng nếu có
        let genresList = movie.genres ? movie.genres.split(', ') : [];

        return {
            id_movie: movie.id_movie,
            title: movie.title,
            original_title: movie.original_title || null,
            director: movie.director || null,
            actors: movie.actors || movie.cast || null,
            duration: movie.duration || 120,
            release_date: movie.release_date,
            end_date: movie.end_date || null,
            language: movie.language || null,
            subtitle: movie.subtitle || null,
            country: movie.country || null,
            description: movie.description || null,
            poster_image: movie.poster_image || movie.poster_url || null,
            trailer_url: movie.trailer_url || null,
            age_restriction: movie.age_restriction || null,
            status: (movie.status || 'coming soon') as 'coming soon' | 'now showing' | 'ended',
            genres: genresList
        };
    });
}
