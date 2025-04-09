import React from 'react';
import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  showTimes: {
    standard?: Showtime[];
    deluxe?: Showtime[];
  };
}

interface TheaterShowtimes {
  theater: Theater;
  movies: Movie[];
}

// Mock data
const showtimesData: TheaterShowtimes[] = [
  {
    theater: {
      id: 'dl',
      name: 'Đà Lạt (TP. Đà Lạt)',
      address: 'Quảng trường Lâm Viên, P10, TP. Đà Lạt, Lâm Đồng',
    },
    movies: [
      {
        id: 'movie1',
        title: 'SÁT THỦ VŨ CÔNG CỰC HÀI (T16) LT',
        poster: '/images/movie3.jpeg',
        showTimes: {
          standard: [
            { time: '18:30', link: '/movie/451dfcc6-3e73-4e6a-9ac9-67a552f1b777/' },
            { time: '19:40', link: '/movie/451dfcc6-3e73-4e6a-9ac9-67a552f1b777/' },
            { time: '20:40', link: '/movie/451dfcc6-3e73-4e6a-9ac9-67a552f1b777/' },
            { time: '21:50', link: '/movie/451dfcc6-3e73-4e6a-9ac9-67a552f1b777/' },
            { time: '22:50', link: '/movie/451dfcc6-3e73-4e6a-9ac9-67a552f1b777/' },
            { time: '23:59', link: '/movie/451dfcc6-3e73-4e6a-9ac9-67a552f1b777/' },
          ],
        }
      },
      {
        id: 'movie2',
        title: 'QUỶ NHẬP TRÀNG (T18)',
        poster: '/images/movie2.jpeg',
        showTimes: {
          standard: [
            { time: '19:00', link: '/movie/af80d6dc-53f0-4187-87ae-fa3a63394294/' },
            { time: '20:00', link: '/movie/af80d6dc-53f0-4187-87ae-fa3a63394294/' },
            { time: '21:25', link: '/movie/af80d6dc-53f0-4187-87ae-fa3a63394294/' },
            { time: '22:25', link: '/movie/af80d6dc-53f0-4187-87ae-fa3a63394294/' },
            { time: '23:50', link: '/movie/af80d6dc-53f0-4187-87ae-fa3a63394294/' },
          ],
        }
      },
    ],
  },
  {
    theater: {
      id: 'qt',
      name: 'Quốc Thanh (TP.HCM)',
      address: '271 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, Thành Phố Hồ Chí Minh',
    },
    movies: [
      {
        id: 'movie1',
        title: 'SÁT THỦ VŨ CÔNG CỰC HÀI (T16) LT',
        poster: '/images/movie3.jpeg',
        showTimes: {
          standard: [
            { time: '19:20', link: '/movie/451dfcc6-3e73-4e6a-9ac9-67a552f1b777/' },
            { time: '21:30', link: '/movie/451dfcc6-3e73-4e6a-9ac9-67a552f1b777/' },
            { time: '22:30', link: '/movie/451dfcc6-3e73-4e6a-9ac9-67a552f1b777/' },
            { time: '23:59', link: '/movie/451dfcc6-3e73-4e6a-9ac9-67a552f1b777/' },
          ],
        }
      },
      {
        id: 'movie2',
        title: 'QUỶ NHẬP TRÀNG (T18)',
        poster: '/images/movie2.jpeg',
        showTimes: {
          standard: [
            { time: '18:35', link: '/movie/af80d6dc-53f0-4187-87ae-fa3a63394294/' },
            { time: '19:40', link: '/movie/af80d6dc-53f0-4187-87ae-fa3a63394294/' },
            { time: '20:15', link: '/movie/af80d6dc-53f0-4187-87ae-fa3a63394294/' },
            { time: '21:00', link: '/movie/af80d6dc-53f0-4187-87ae-fa3a63394294/' },
            { time: '22:45', link: '/movie/af80d6dc-53f0-4187-87ae-fa3a63394294/' },
            { time: '23:30', link: '/movie/af80d6dc-53f0-4187-87ae-fa3a63394294/' },
          ],
        }
      },
    ],
  },
  {
    theater: {
      id: 'hbt',
      name: 'Hai Bà Trưng (TP.HCM)',
      address: '135 Hai Bà Trưng, Phường Bến Nghé, Quận 1, Thành Phố Hồ Chí Minh',
    },
    movies: [
      {
        id: 'movie1',
        title: 'SÁT THỦ VŨ CÔNG CỰC HÀI (T16) LT',
        poster: '/images/movie3.jpeg',
        showTimes: {
          standard: [
            { time: '18:25', link: '/movie/451dfcc6-3e73-4e6a-9ac9-67a552f1b777/' },
            { time: '20:30', link: '/movie/451dfcc6-3e73-4e6a-9ac9-67a552f1b777/' },
            { time: '22:40', link: '/movie/451dfcc6-3e73-4e6a-9ac9-67a552f1b777/' },
          ],
          deluxe: [
            { time: '23:30', link: '/movie/451dfcc6-3e73-4e6a-9ac9-67a552f1b777/' },
          ],
        }
      },
      {
        id: 'movie2',
        title: 'QUỶ NHẬP TRÀNG (T18)',
        poster: '/images/movie2.jpeg',
        showTimes: {
          standard: [
            { time: '19:20', link: '/movie/af80d6dc-53f0-4187-87ae-fa3a63394294/' },
            { time: '20:10', link: '/movie/af80d6dc-53f0-4187-87ae-fa3a63394294/' },
            { time: '21:40', link: '/movie/af80d6dc-53f0-4187-87ae-fa3a63394294/' },
            { time: '22:30', link: '/movie/af80d6dc-53f0-4187-87ae-fa3a63394294/' },
            { time: '23:59', link: '/movie/af80d6dc-53f0-4187-87ae-fa3a63394294/' },
          ],
        }
      },
    ],
  },
];

export default function ShowtimesPage() {
  // Get current date for display
  const today = new Date();
  const formattedDate = today.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

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
            <select className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700">
              <option value="">Chọn phim</option>
              <option value="movie1">SÁT THỦ VŨ CÔNG CỰC HÀI (T16) LT</option>
              <option value="movie2">QUỶ NHẬP TRÀNG (T18)</option>
              <option value="movie3">ÂM DƯƠNG LỘ (T16)</option>
              <option value="movie4">NGHI LỄ TRỤC QUỶ (T18)</option>
            </select>
          </div>

          <div className="space-y-2 border border-gray-700 p-4 rounded-md">
            <div className="flex items-center gap-2">
              <span className="bg-cinestar-yellow text-cinestar-darkblue font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
              <span>Rạp</span>
            </div>
            <select className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700">
              <option value="">Chọn rạp</option>
              <option value="dl">Cinestar Đà Lạt (TP. Đà Lạt)</option>
              <option value="qt">Cinestar Quốc Thanh (TP.HCM)</option>
              <option value="hbt">Cinestar Hai Bà Trưng (TP.HCM)</option>
              <option value="sv">Cinestar Sinh Viên (Bình Dương)</option>
              <option value="hue">Cinestar Huế (TP Huế)</option>
              <option value="ld">Cinestar Lâm Đồng (Đức Trọng)</option>
              <option value="mt">Cinestar Mỹ Tho (Tiền Giang)</option>
              <option value="kg">Cinestar Kiên Giang (Rạch Sỏi)</option>
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
            {showtimesData.map((theaterData) => (
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
                              Kinh Dị
                            </div>
                            <div>2D</div>
                            <div className="flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM8 14C4.7 14.1 2 11.4 2 8.1C2 4.7 4.7 2 8 2C11.3 2 14 4.7 14 8C14 11.3 11.3 14 8 14Z" fill="#EBDB40"/>
                                <path d="M10 7H9V5C9 4.4 8.6 4 8 4C7.4 4 7 4.4 7 5V8C7 8.6 7.4 9 8 9H10C10.6 9 11 8.6 11 8C11 7.4 10.6 7 10 7Z" fill="#EBDB40"/>
                              </svg>
                              107'
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
                                href={showtime.link}
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
                                href={showtime.link}
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
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
