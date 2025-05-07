"use server";

import { query, executeTransaction } from '../lib/db.js';
import pool from '../config/db.js';
import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const baseURL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

// Các hàm truy vấn TMDB API cần thiết cho server-side
async function getMovieDetails(movieId: number) {
    try {
        const response = await axios.get(`${baseURL}/movie/${movieId}`, {
            params: {
                api_key: API_KEY,
                language: "vi-VN",
                append_to_response: "credits,release_dates"
            }
        });

        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy chi tiết phim ${movieId}:`, error);
        return null;
    }
}

async function getMovieCredits(movieId: number) {
    try {
        const response = await axios.get(`${baseURL}/movie/${movieId}/credits`, {
            params: {
                api_key: API_KEY,
                language: "vi-VN"
            }
        });

        // Trả về danh sách diễn viên chính (ví dụ: lấy top 5)
        const cast = response.data.cast
            .slice(0, 5)
            .map((actor: any) => ({
                id: actor.id,
                name: actor.name,
                character: actor.character,
                profile_path: actor.profile_path
                    ? `https://image.tmdb.org/t/p/w300${actor.profile_path}`
                    : "/images/no-avatar.png"
            }));

        // Trả về đạo diễn (crew có job là "Director")
        const director = response.data.crew.find((member: any) => member.job === "Director");

        return {
            director: director ? {
                id: director.id,
                name: director.name,
                profile_path: director.profile_path
                    ? `https://image.tmdb.org/t/p/w300${director.profile_path}`
                    : "/images/no-avatar.png"
            } : null,
            cast
        };
    } catch (error) {
        console.error(`Lỗi khi lấy diễn viên và đạo diễn phim ${movieId}:`, error);
        return {
            director: null,
            cast: []
        };
    }
}

async function getMovieTrailer(movieId: number) {
    try {
        const response = await axios.get(`${baseURL}/movie/${movieId}/videos`, {
            params: {
                api_key: API_KEY,
                language: "en-US" // Thường trailers có sẵn nhiều hơn trong tiếng Anh
            }
        });

        const trailers = response.data.results;
        // Ưu tiên trailers chính thức
        const officialTrailer = trailers.find(
            (video: any) => video.site === "YouTube" &&
                (video.type === "Trailer" || video.type === "Teaser") &&
                video.official === true
        );

        // Nếu không có trailer chính thức, tìm bất kỳ trailer nào
        const anyTrailer = trailers.find(
            (video: any) => video.site === "YouTube" &&
                (video.type === "Trailer" || video.type === "Teaser")
        );

        return officialTrailer || anyTrailer
            ? `https://www.youtube.com/watch?v=${(officialTrailer || anyTrailer).key}`
            : null;

    } catch (error) {
        console.error("Lỗi khi lấy trailer:", error);
        return null;
    }
}

async function getNowPlayingMovies() {
    try {
        const response = await axios.get(`${baseURL}/movie/now_playing`, {
            params: {
                api_key: API_KEY,
                language: "vi-VN",
                region: "VN",
                page: 1
            }
        });

        const formattedMovies = await Promise.all(
            response.data.results.map((movie: any) => formatMovieData(movie))
        );

        return formattedMovies;
    } catch (error) {
        console.error("Lỗi khi lấy phim đang chiếu:", error);
        throw error;
    }
}

async function getUpcomingMovies() {
    try {
        const response = await axios.get(`${baseURL}/movie/upcoming`, {
            params: {
                api_key: API_KEY,
                language: "vi-VN",
                region: "VN",
                page: 1
            }
        });

        const formattedMovies = await Promise.all(
            response.data.results.map((movie: any) => formatMovieData(movie))
        );

        return formattedMovies;
    } catch (error) {
        console.error("Lỗi khi lấy phim sắp chiếu:", error);
        throw error;
    }
}

// Lấy danh sách thể loại phim
async function getGenres() {
    try {
        const response = await axios.get(`${baseURL}/genre/movie/list`, {
            params: {
                api_key: API_KEY,
                language: "vi-VN"
            }
        });

        const genres = response.data.genres;
        const genresMap: Record<number, string> = {};

        genres.forEach((genre: { id: number, name: string }) => {
            genresMap[genre.id] = genre.name;
        });

        return genresMap;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách thể loại:", error);
        return {};
    }
}

// Hàm chuyển đổi dữ liệu từ API sang định dạng cần thiết
async function formatMovieData(movie: {
    id: number;
    title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    adult: boolean;
    genre_ids?: number[];
    overview?: string;
    release_date?: string;
    vote_average?: number;
}) {
    // Lấy tất cả genres từ API
    const genresCache = await getGenres();

    // Format genres từ id thành chuỗi
    let genreNames = "Phim";
    if (movie.genre_ids && movie.genre_ids.length > 0) {
        try {
            // Lấy tên thể loại từ cache
            genreNames = movie.genre_ids
                .map(id => genresCache[id] || "")
                .filter(name => name)
                .join(", ");

            if (!genreNames) genreNames = "Phim";
        } catch (error) {
            console.error("Lỗi khi format thể loại:", error);
            genreNames = "Phim";
        }
    }

    // Lấy thêm thông tin chi tiết phim nếu cần (runtime, countries)
    let movieDetails;
    try {
        movieDetails = await getMovieDetails(movie.id);
    } catch (error) {
        console.error("Không thể lấy chi tiết phim:", error);
    }

    // Lấy trailer từ API
    const trailerUrl = await getMovieTrailer(movie.id);

    // Lấy thời lượng phim từ chi tiết nếu có
    const duration = movieDetails?.runtime || 120;

    // Lấy quốc gia sản xuất
    let country = "Khác";
    if (movieDetails?.production_countries && movieDetails.production_countries.length > 0) {
        country = movieDetails.production_countries[0].name;
    }

    // Tính rating dựa trên nhiều yếu tố
    let rating = 'P';
    if (movie.adult) {
        rating = 'T18';
    } else if (movieDetails?.release_dates) {
        // Tìm thông tin rating từ certification
        const vietnamRating = movieDetails.release_dates.results.find(
            (r: any) => r.iso_3166_1 === "VN"
        );

        if (vietnamRating && vietnamRating.release_dates.length > 0) {
            const certification = vietnamRating.release_dates[0].certification;
            if (certification) {
                rating = certification;
            }
        } else {
            // Nếu không có rating VN, dùng US thay thế
            const usRating = movieDetails.release_dates.results.find(
                (r: any) => r.iso_3166_1 === "US"
            );

            if (usRating && usRating.release_dates.length > 0) {
                const certification = usRating.release_dates[0].certification;
                if (certification) {
                    // Map US rating về định dạng VN
                    switch (certification) {
                        case "G": rating = "P"; break;
                        case "PG": rating = "C13"; break;
                        case "PG-13": rating = "C16"; break;
                        case "R": rating = "C18"; break;
                        case "NC-17": rating = "T18"; break;
                        default: rating = "P";
                    }
                }
            }
        }
    }

    return {
        id: movie.id.toString(),
        title: movie.title,
        poster: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : '/images/no-poster.png',
        backdrop: movie.backdrop_path
            ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
            : null,
        rating: rating,
        genre: genreNames,
        duration: duration,
        country: country,
        language: "Phụ đề",
        format: "2D",
        trailerUrl: trailerUrl || "",
        overview: movie.overview,
        releaseDate: movie.release_date,
        voteAverage: movie.vote_average || 0
    };
}

/**
 * Đồng bộ phim từ TMDB API và lưu vào database
 */
export async function syncMoviesFromTMDB() {
    try {
        // 1. Bắt đầu đồng bộ và ghi log
        console.log('Starting movie sync from TMDB API');

        // 2. Lấy phim từ TMDb API với xử lý lỗi tốt hơn
        let nowPlayingMovies = [];
        let upcomingMovies = [];

        try {
            nowPlayingMovies = await getNowPlayingMovies();
        } catch (error) {
            console.error('Error fetching now playing movies:', error);
        }

        try {
            upcomingMovies = await getUpcomingMovies();
        } catch (error) {
            console.error('Error fetching upcoming movies:', error);
        }

        // Kiểm tra xem cả hai cuộc gọi API có thành công không
        if (nowPlayingMovies.length === 0 && upcomingMovies.length === 0) {
            return {
                success: false,
                message: 'Không thể lấy phim từ TMDB API. Vui lòng kiểm tra kết nối và API key.'
            };
        }

        console.log(`Fetched ${nowPlayingMovies.length} now playing movies and ${upcomingMovies.length} upcoming movies`);

        // 3. Xử lý từng phim
        const results: {
            total: number;
            saved: number;
            updated: number;
            failed: number;
            errors: { title: string; error: string }[];
        } = {
            total: nowPlayingMovies.length + upcomingMovies.length,
            saved: 0,
            updated: 0,
            failed: 0,
            errors: []
        };

        // Tạo một bản sao của mảng để tránh lỗi khi thay đổi trong vòng lặp
        const allMovies = [...nowPlayingMovies, ...upcomingMovies];

        for (const movie of allMovies) {
            try {
                if (!movie || !movie.id) {
                    results.failed++;
                    results.errors.push({ title: 'Unknown movie', error: 'Invalid movie data' });
                    continue;
                }

                const saveResult = await saveMovieToDatabase(movie);
                if (saveResult.updated) {
                    results.updated++;
                } else {
                    results.saved++;
                }
            } catch (error) {
                results.failed++;
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error(`Error saving movie ${movie?.title || 'unknown'}:`, errorMsg);
                results.errors.push({ title: movie?.title || 'Unknown movie', error: errorMsg });
            }
        }

        console.log('Movie sync completed with results:', results);

        return {
            success: results.failed < results.total, // Thành công nếu không phải tất cả đều thất bại
            message: `Đã đồng bộ ${results.saved + results.updated}/${results.total} phim (${results.saved} mới, ${results.updated} cập nhật, ${results.failed} lỗi)`,
            results
        };
    } catch (error) {
        console.error('Error in syncMoviesFromTMDB:', error);
        return {
            success: false,
            message: 'Lỗi khi đồng bộ phim',
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

// Thêm kiểu dữ liệu cho kết quả truy vấn MySQL
interface MovieRow {
    id_movie: number;
    title: string;
    [key: string]: any; // cho phép các thuộc tính khác
}

interface GenreRow {
    id_genre: number;
    genre_name: string;
    [key: string]: any;
}

/**
 * Lưu một bộ phim vào database với cách xử lý không dùng transaction
 * để tránh lỗi "This command is not supported in the prepared statement protocol yet"
 */
async function saveMovieToDatabase(movie: any) {
    if (!movie || !movie.title) {
        throw new Error('Invalid movie data: missing title');
    }

    try {
        console.log(`Processing movie: ${movie.title}`);

        // 1. Kiểm tra phim đã tồn tại chưa
        const existingMoviesResult = await query(
            'SELECT id_movie FROM MOVIES WHERE title = ?',
            [movie.title]
        ) as MovieRow[];

        let movieId;
        let updated = false;
        const status = movie.releaseDate && new Date(movie.releaseDate) <= new Date()
            ? 'now showing'
            : 'coming soon';

        // Tính toán ngày kết thúc (ngày phát hành + 30 ngày)
        const releaseDate = movie.releaseDate ? new Date(movie.releaseDate) : new Date();
        const endDate = new Date(releaseDate);
        endDate.setDate(endDate.getDate() + 30);

        // Định dạng ngày theo chuẩn MySQL YYYY-MM-DD
        const formattedReleaseDate = releaseDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        // Xử lý chi tiết phim và credit
        let details;
        let credits;

        try {
            details = await getMovieDetails(parseInt(movie.id));
        } catch (error) {
            console.error(`Error fetching details for movie ID ${movie.id}:`, error);
        }

        try {
            credits = await getMovieCredits(parseInt(movie.id));
        } catch (error) {
            console.error(`Error fetching credits for movie ID ${movie.id}:`, error);
        }

        // Xử lý thông tin diễn viên và đạo diễn
        const actors = credits?.cast?.map((actor: { name: string }) => actor.name).slice(0, 10).join(', ') || '';
        const director = credits?.director ? credits.director.name : '';

        // Kiểm tra nếu existingMoviesResult có phần tử
        if (existingMoviesResult && existingMoviesResult.length > 0) {
            // 2a. Cập nhật phim đã tồn tại
            movieId = existingMoviesResult[0].id_movie;
            updated = true;

            try {
                await query(
                    `UPDATE MOVIES SET 
                    original_title = ?, director = ?, actors = ?, 
                    duration = ?, release_date = ?, end_date = ?,
                    language = ?, country = ?, description = ?,
                    poster_image = ?, trailer_url = ?,
                    age_restriction = ?, status = ?
                    WHERE id_movie = ?`,
                    [
                        details?.original_title || movie.title,
                        director || '',
                        actors || '',
                        parseInt(movie.duration) || 120,
                        formattedReleaseDate,
                        formattedEndDate,
                        'Phụ đề',
                        movie.country || 'Chưa xác định',
                        movie.overview || '',
                        movie.poster || '',
                        movie.trailerUrl || '',
                        movie.rating || 'P',
                        status,
                        movieId
                    ]
                );

                console.log(`Updated movie: ${movie.title} (ID: ${movieId})`);
            } catch (error) {
                console.error(`Error updating movie ${movie.title}:`, error);
                throw new Error(`Không thể cập nhật phim: ${error instanceof Error ? error.message : String(error)}`);
            }
        } else {
            // 2b. Thêm phim mới
            try {
                const result = await query(
                    `INSERT INTO MOVIES 
                    (title, original_title, director, actors, 
                    duration, release_date, end_date, language,
                    country, description, poster_image, 
                    trailer_url, age_restriction, status) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        movie.title,
                        details?.original_title || movie.title,
                        director || '',
                        actors || '',
                        parseInt(movie.duration) || 120,
                        formattedReleaseDate,
                        formattedEndDate,
                        'Phụ đề',
                        movie.country || 'Chưa xác định',
                        movie.overview || '',
                        movie.poster || '',
                        movie.trailerUrl || '',
                        movie.rating || 'P',
                        status
                    ]
                );

                // mysql2 trả về OkPacket với insertId
                const insertResult = result as { insertId?: number };
                movieId = insertResult.insertId;

                console.log(`Added new movie: ${movie.title} (ID: ${movieId || 'unknown'})`);
            } catch (error) {
                console.error(`Error inserting movie ${movie.title}:`, error);
                throw new Error(`Không thể thêm phim mới: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        // 3. Xử lý thể loại phim
        if (movie.genre && movieId) {
            try {
                // Xóa thể loại hiện tại của phim
                await query(
                    'DELETE FROM GENRE_MOVIES WHERE id_movie = ?',
                    [movieId]
                );

                // Thêm thể loại mới
                const genres = movie.genre.split(', ');
                for (const genreName of genres) {
                    if (!genreName.trim()) continue;

                    // Kiểm tra thể loại tồn tại
                    const genreResults = await query(
                        'SELECT id_genre FROM GENRE WHERE genre_name = ?',
                        [genreName]
                    ) as GenreRow[];

                    let genreId;

                    if (genreResults && genreResults.length > 0) {
                        genreId = genreResults[0].id_genre;
                    } else {
                        // Tạo thể loại mới
                        const insertGenreResult = await query(
                            'INSERT INTO GENRE (genre_name) VALUES (?)',
                            [genreName]
                        );

                        // Xử lý kết quả insert
                        const genreInsert = insertGenreResult as { insertId?: number };
                        genreId = genreInsert.insertId;
                    }

                    // Liên kết phim với thể loại
                    if (genreId) {
                        await query(
                            'INSERT INTO GENRE_MOVIES (id_movie, id_genre) VALUES (?, ?)',
                            [movieId, genreId]
                        );
                    }
                }
            } catch (error) {
                console.error(`Error processing genres for movie ${movie.title}:`, error);
                // Tiếp tục để phim vẫn được lưu mà không có thể loại
            }
        }

        return {
            success: true,
            movieId,
            updated
        };

    } catch (error) {
        console.error(`Error saving movie ${movie?.title || 'unknown'}:`, error);
        throw error;
    }
}