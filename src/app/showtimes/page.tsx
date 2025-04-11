'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MovieDbAPI } from '@/services/MovieDbAPI';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Theater {
  id: string;
  name: string;
  address: string;
}

interface Showtime {
  time: string;
  link: string;
}

interface Movie {
  id: string;
  title: string;
  poster: string;
  genre?: string;
  duration?: number;
  format?: string;
  showTimes: {
    standard?: Showtime[];
    deluxe?: Showtime[];
  };
}

interface TheaterShowtimes {
  theater: Theater;
  movies: Movie[];
}

// Danh sách rạp cố định
const theaters: Theater[] = [
  {
    id: 'dl',
    name: 'Đà Lạt (TP. Đà Lạt)',
    address: 'Quảng trường Lâm Viên, P10, TP. Đà Lạt, Lâm Đồng',
  },
  {
    id: 'qt',
    name: 'Quốc Thanh (TP.HCM)',
    address: '271 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, Thành Phố Hồ Chí Minh',
  },
  {
    id: 'hbt',
    name: 'Hai Bà Trưng (TP.HCM)',
    address: '135 Hai Bà Trưng, Phường Bến Nghé, Quận 1, Thành Phố Hồ Chí Minh',
  },
  {
    id: 'qt',
    name: 'Quốc Thanh (TP.HCM)',
    address: '271 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, Thành Phố Hồ Chí Minh',
    
  },
  {
    id: 'bd',
    name: 'CINESTAR SINH VIÊN(Bình Dương)',
    address: 'Nhà văn hóa sinh viên, Đại học Quốc gia HCM, P.Đông Hòa,Dĩ An, Bình Dương',
  },
  {
    id: 'mt',
    name: 'Mỹ Tho (Tiền Giang)',
    address: '52 Đinh Bộ Lĩnh, Phường 3, TP. Mỹ Tho, Tiền Giang',
  },
  {
    id: 'kd',
    name: 'Kiên Giang (TP. Kiên Giang)',
    address: 'Lô A2 - Khu 2 Trung tâm thương mại Rạch Sỏi,Đường Nguyễn Trí Thanh,Phường Rạch Sỏi,Thành Phố Rạch Giá, TP. Kiên Giang',
  },
  {
    id: 'ld',
    name: 'Lâm Đồng (TP. Lâm Đồng)',
    address: '713 QL20, Liên Nghĩa,Đức Trọng TP. Lâm Đồng',
  },
  {
    id: 'hue',
    name: 'Cinestar Huế(TP. Huế)',
    address: '25 Hai Bà Trưng, Vĩnh Ninh, Quận Thuận Hóa, TP. Huế',
  },

];

// Cấu trúc giờ chiếu mẫu
const standardShowtimes: Showtime[] = [
  { time: '10:30', link: '#' },
  { time: '12:45', link: '#' },
  { time: '15:20', link: '#' },
  { time: '18:30', link: '#' },
  { time: '20:15', link: '#' },
  { time: '22:45', link: '#' },
];

const deluxeShowtimes: Showtime[] = [
  { time: '11:15', link: '#' },
  { time: '14:30', link: '#' },
  { time: '19:45', link: '#' },
  { time: '23:00', link: '#' },
];

export default function ShowtimesPage() {
  const [nowShowingMovies, setNowShowingMovies] = useState<any[]>([]);
  const [comingSoonMovies, setComingSoonMovies] = useState<any[]>([]);
  const [showtimesData, setShowtimesData] = useState<TheaterShowtimes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheater, setSelectedTheater] = useState<string>("");
  const [selectedMovie, setSelectedMovie] = useState<string>("");

  // Get current date for display
  const today = new Date();
  const formattedDate = today.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        // Lấy dữ liệu phim từ API
        const nowPlaying = await MovieDbAPI.getNowPlayingMovies();
        setNowShowingMovies(nowPlaying);

        const upcoming = await MovieDbAPI.getUpcomingMovies();
        setComingSoonMovies(upcoming);

        // Tạo dữ liệu lịch chiếu mẫu cho mỗi rạp
        const theaterShowtimes = theaters.map(theater => {
          // Chọn các phim đang chiếu cho mỗi rạp (ví dụ: lấy 5 phim đầu tiên)
          const moviesInTheater = nowPlaying.slice(0, 5).map(movie => ({
            id: movie.id,
            title: movie.title,
            poster: movie.poster,
            genre: movie.genre,
            duration: movie.duration,
            format: movie.format || '2D',
            showTimes: {
              standard: [...standardShowtimes],
              // Chỉ một số phim có suất chiếu Deluxe
              deluxe: Math.random() > 0.5 ? [...deluxeShowtimes] : undefined
            }
          }));

          return {
            theater,
            movies: moviesInTheater
          };
        });

        setShowtimesData(theaterShowtimes);
        setLoading(false);
      } catch (err) {
        console.error("Không thể lấy dữ liệu phim:", err);
        setError("Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Lọc dữ liệu theo rạp và phim đã chọn
  const filteredShowtimes = showtimesData.filter(data => {
    if (selectedTheater && data.theater.id !== selectedTheater) return false;
    if (selectedMovie) {
      const hasMovie = data.movies.some(movie => movie.id === selectedMovie);
      if (!hasMovie) return false;
    }
    return true;
  }).map(data => {
    // Nếu có phim được chọn, lọc chỉ hiển thị phim đó
    if (selectedMovie) {
      return {
        ...data,
        movies: data.movies.filter(movie => movie.id === selectedMovie)
      };
    }
    return data;
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-500 text-white p-4 rounded-md">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="space-y-2 border border-gray-700 p-4 rounded-md">
            <div className="flex items-center gap-2">
              <span className="bg-cinestar-yellow text-cinestar-darkblue font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
              <span>Ngày</span>
            </div>
            <select className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700">
              <option value={formattedDate}>Hôm nay {formattedDate.split('/').slice(0, 2).join('/')}</option>
              {/* Additional dates would go here */}
            </select>
          </div>

          <div className="space-y-2 border border-gray-700 p-4 rounded-md">
            <div className="flex items-center gap-2">
              <span className="bg-cinestar-yellow text-cinestar-darkblue font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
              <span>Phim</span>
            </div>
            <select
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              value={selectedMovie}
              onChange={(e) => setSelectedMovie(e.target.value)}
            >
              <option value="">Chọn phim</option>
              {nowShowingMovies.map(movie => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 border border-gray-700 p-4 rounded-md">
            <div className="flex items-center gap-2">
              <span className="bg-cinestar-yellow text-cinestar-darkblue font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
              <span>Rạp</span>
            </div>
            <select
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              value={selectedTheater}
              onChange={(e) => setSelectedTheater(e.target.value)}
            >
              <option value="">Chọn rạp</option>
              {theaters.map(theater => (
                <option key={theater.id} value={theater.id}>
                  Cinestar {theater.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Tabs defaultValue="all-movies" className="w-full">
          <TabsList className="w-full mb-8 bg-cinestar-darkblue">
            <TabsTrigger
              value="all-movies"
              className="flex-1 py-3 text-base data-[state=active]:bg-cinestar-yellow data-[state=active]:text-cinestar-darkblue data-[state=active]:font-bold"
            >
              TẤT CẢ CÁC PHIM
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all-movies">
            {filteredShowtimes.length > 0 ? (
              filteredShowtimes.map((theaterData) => (
                <div key={theaterData.theater.id} className="mb-10">
                  <div className="bg-cinestar-purple text-white p-4 rounded-t-md">
                    <h2 className="text-xl font-bold">{theaterData.theater.name}</h2>
                    <p className="text-sm opacity-80">{theaterData.theater.address}</p>
                  </div>

                  {theaterData.movies.map((movie) => (
                    <div key={movie.id} className="bg-gray-800 p-4 rounded-b-md mb-4 flex flex-col md:flex-row gap-4 border-b border-gray-700">
                      <div className="w-full md:w-1/3 lg:w-1/4">
                        <div className="flex gap-4">
                          <Link href={`/movie/${movie.id}`} className="block w-24 h-32 relative overflow-hidden rounded">
                            <Image
                              src={movie.poster}
                              alt={movie.title}
                              fill
                              className="object-cover"
                            />
                          </Link>
                          <div className="flex flex-col">
                            <h3 className="font-semibold text-white mb-2">{movie.title}</h3>
                            <div className="text-xs space-y-1 text-gray-300">
                              <div className="flex items-center gap-1">
                                <span className="w-4 h-4 bg-red-600 rounded-full"></span>
                                {movie.genre?.split(',')[0] || 'Phim'}
                              </div>
                              <div>{movie.format || '2D'}</div>
                              <div className="flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM8 14C4.7 14.1 2 11.4 2 8.1C2 4.7 4.7 2 8 2C11.3 2 14 4.7 14 8C14 11.3 11.3 14 8 14Z" fill="#EBDB40" />
                                  <path d="M10 7H9V5C9 4.4 8.6 4 8 4C7.4 4 7 4.4 7 5V8C7 8.6 7.4 9 8 9H10C10.6 9 11 8.6 11 8C11 7.4 10.6 7 10 7Z" fill="#EBDB40" />
                                </svg>
                                {movie.duration || 120}'
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        {movie.showTimes.standard && (
                          <div className="mb-4">
                            <p className="uppercase text-sm font-bold mb-2">Standard</p>
                            <div className="flex flex-wrap gap-2">
                              {movie.showTimes.standard.map((showtime, index) => (
                                <Link
                                  key={index}
                                  href={`/booking/${movie.id}?time=${showtime.time}`}
                                  className="inline-block px-3 py-1 border border-white rounded hover:bg-cinestar-yellow hover:text-cinestar-darkblue hover:border-cinestar-yellow"
                                >
                                  {showtime.time}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {movie.showTimes.deluxe && (
                          <div>
                            <p className="uppercase text-sm font-bold mb-2">Deluxe</p>
                            <div className="flex flex-wrap gap-2">
                              {movie.showTimes.deluxe.map((showtime, index) => (
                                <Link
                                  key={index}
                                  href={`/booking/${movie.id}?time=${showtime.time}&type=deluxe`}
                                  className="inline-block px-3 py-1 border border-white rounded hover:bg-cinestar-yellow hover:text-cinestar-darkblue hover:border-cinestar-yellow"
                                >
                                  {showtime.time}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center p-12 text-lg text-gray-400">
                {selectedMovie || selectedTheater ?
                  "Không tìm thấy lịch chiếu phù hợp với lựa chọn của bạn." :
                  "Không có lịch chiếu nào hiện tại."}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
