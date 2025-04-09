import { MovieProps } from '@/components/movies/MovieCard';
import { MovieDbAPI } from '@/services/MovieDbAPI';


// Hàm lấy danh sách phim đang chiếu từ API
export async function getNowShowingMovies(): Promise<MovieProps[]> {
  try {
    // Không cần map lại vì MovieDbAPI.getNowPlayingMovies() đã format dữ liệu
    return await MovieDbAPI.getNowPlayingMovies();
  } catch (error) {
    console.error("Lỗi khi lấy phim đang chiếu:", error);
    return fallbackNowShowingMovies; // Trả về dữ liệu dự phòng khi gặp lỗi
  }
}

// Hàm lấy danh sách phim sắp chiếu từ API
export async function getComingSoonMovies(): Promise<MovieProps[]> {
  try {
    // Không cần map lại vì MovieDbAPI.getUpcomingMovies() đã format dữ liệu
    return await MovieDbAPI.getUpcomingMovies();
  } catch (error) {
    console.error("Lỗi khi lấy phim sắp chiếu:", error);
    return fallbackComingSoonMovies; // Trả về dữ liệu dự phòng khi gặp lỗi
  }
}
//du lieu phim de phong
export const fallbackNowShowingMovies: MovieProps[] = [
  {
    id: 'movie1',
    title: 'ÂM DƯƠNG LỘ (T16)',
    poster: '/images/movie1.jpeg',
    rating: 'T16',
    genre: 'Kinh Dị',
    duration: 119,
    country: 'Việt Nam',
    language: 'Phụ đề',
    format: '2D',
    trailerUrl: 'https://youtube.com/watch?v=n-5oC3oyXKE',
  },
  {
    id: 'movie2',
    title: 'QUỶ NHẬP TRÀNG (T18)',
    poster: '/images/movie2.jpeg',
    rating: 'T18',
    genre: 'Kinh Dị',
    duration: 122,
    country: 'Việt Nam',
    language: 'VN',
    format: '2D',
    trailerUrl: 'https://youtube.com/watch?v=d_C534uicPw',
  },
  {
    id: 'movie3',
    title: 'SÁT THỦ VŨ CÔNG CỰC HÀI (T16)',
    poster: '/images/movie3.jpeg',
    rating: 'T16',
    genre: 'Hài',
    duration: 107,
    country: 'Hàn Quốc',
    language: 'Lồng Tiếng',
    format: '2D',
    trailerUrl: 'https://youtube.com/watch?v=DXNno1pNlyM',
  },
  {
    id: 'movie4',
    title: 'NGHI LỄ TRỤC QUỶ (T18)',
    poster: '/images/movie4.jpeg',
    rating: 'T18',
    genre: 'Kinh Dị',
    duration: 96,
    country: 'Khác',
    language: 'Phụ đề',
    format: '2D',
    trailerUrl: 'https://youtube.com/watch?v=O7aWzuYhYNk',
  },
  {
    id: 'movie5',
    title: 'NHÀ GIÀ MA CHÓ (T18)',
    poster: '/images/movie5.jpeg',
    rating: 'T18',
    genre: 'Kinh Dị',
    duration: 89,
    country: 'Khác',
    language: 'Phụ đề',
    format: '2D',
    trailerUrl: 'https://youtube.com/watch?v=aqdPkVflLWQ',
  },
];

// Mock data for coming soon movies
export const fallbackComingSoonMovies: MovieProps[] = [
  {
    id: 'movie-cs1',
    title: 'THIẾU NỮ ÁNH TRĂNG',
    poster: '/images/coming1.jpeg',
    rating: 'T13',
    genre: 'Tình Cảm, Tâm Lý',
    duration: 109,
    country: 'Khác',
    language: 'Phụ đề',
    format: '2D',
    trailerUrl: 'https://www.youtube.com/watch?v=VwkpOMJLoB8',
  },
  {
    id: 'movie-cs2',
    title: 'PHIM ĐIỆN ẢNH NINJA RANTARO: GIẢI CỨU QUÂN SƯ',
    poster: '/images/coming2.jpeg',
    rating: 'P',
    genre: 'Hoạt hình',
    duration: 99,
    country: 'Nhật Bản',
    language: 'Phụ đề',
    format: '2D',
    trailerUrl: 'https://youtube.com/watch?v=jvaVg6wf8R8',
  },
  {
    id: 'movie-cs3',
    title: 'CÔNG CHÚA BĂNG GIÁ VÀ XỨ SỞ TRONG GƯƠNG (P)',
    poster: '/images/coming3.png',
    rating: 'P',
    genre: 'Hoạt hình',
    duration: 76,
    country: 'Khác',
    language: 'Phụ đề',
    format: '2D',
    trailerUrl: 'https://youtube.com/watch?v=eUBbKAyJ7sY',
  },
  {
    id: 'movie-cs4',
    title: 'MỘT BỘ PHIM MINECRAFT',
    poster: '/images/coming4.png',
    rating: 'K',
    genre: 'Gia đình, Phiêu Lưu, Hành động',
    duration: 99,
    country: 'Khác',
    language: 'Phụ đề',
    format: '2D',
    trailerUrl: 'https://youtube.com/watch?v=_k0Xu0KqgnQ',
  },
  {
    id: 'movie-cs5',
    title: 'BÙA HỔN HÔN KINH HOÀNG',
    poster: '/images/movie5.jpeg', // Reusing one of the existing images
    rating: 'T16',
    genre: 'Kinh Dị',
    duration: 99,
    country: 'Khác',
    language: 'Phụ đề',
    format: '2D',
    trailerUrl: 'https://youtube.com/watch?v=UvbCVGP1WOQ',
  },
];


