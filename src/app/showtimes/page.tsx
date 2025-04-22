'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MovieDbAPI } from '@/services/MovieDbAPI';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Cinema, Showtime, CinemaShowtimes, cinemas, standardShowtimes, deluxeShowtimes } from '@/lib/cinema';

interface MovieDBResponse {
  id: number;
  title: string;
  poster_path: string;
  genres?: { id: number; name: string }[];
}

export default function ShowtimesPage() {
  const [nowShowingMovies, setNowShowingMovies] = useState<MovieDBResponse[]>([]);
  const [comingSoonMovies, setComingSoonMovies] = useState<MovieDBResponse[]>([]);
  const [showtimesData, setShowtimesData] = useState<CinemaShowtimes[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<string>("");
  const [selectedMovie, setSelectedMovie] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const nowPlaying = await MovieDbAPI.getNowPlayingMovies();
        const comingSoon = await MovieDbAPI.getUpcomingMovies();

        setNowShowingMovies(nowPlaying);
        setComingSoonMovies(comingSoon);

        // Tạo dữ liệu lịch chiếu mẫu cho mỗi rạp
        const cinemaShowtimes = cinemas.map(cinema => {
          const moviesInCinema = nowPlaying.slice(0, 5).map((movie: MovieDBResponse) => ({
            id: movie.id.toString(),
            title: movie.title,
            poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            genre: movie.genres?.join(', ') || 'Action, Drama',
            duration: 120,
            format: '2D',
            showTimes: {
              standard: standardShowtimes,
              deluxe: deluxeShowtimes
            }
          }));

          return {
            cinema,
            movies: moviesInCinema
          };
        });

        setShowtimesData(cinemaShowtimes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Lọc dữ liệu theo rạp và phim đã chọn
  const filteredShowtimes = showtimesData.filter(data => {
    if (selectedCinema && data.cinema.id !== selectedCinema) return false;
    if (selectedMovie) {
      return data.movies.some(movie => movie.id === selectedMovie);
    }
    return true;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Lịch chiếu phim</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <select
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            value={selectedCinema}
            onChange={(e) => setSelectedCinema(e.target.value)}
          >
            <option value="">Chọn rạp</option>
            {cinemas.map(cinema => (
              <option key={cinema.id} value={cinema.id}>
                {cinema.name}
              </option>
            ))}
          </select>

          <select
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
          >
            <option value="">Chọn phim</option>
            {nowShowingMovies.map(movie => (
              <option key={movie.id} value={movie.id.toString()}>
                {movie.title}
              </option>
            ))}
          </select>
        </div>

        {/* Showtimes List */}
        {filteredShowtimes.map((cinemaData) => (
          <div key={cinemaData.cinema.id} className="mb-10">
            <div className="bg-cinestar-purple text-white p-4 rounded-t-md">
              <h2 className="text-xl font-bold">{cinemaData.cinema.name}</h2>
              <p className="text-sm opacity-80">{cinemaData.cinema.address}</p>
            </div>

            {cinemaData.movies.map((movie) => (
              <div key={movie.id} className="bg-gray-800 p-4 mb-2 rounded-b-md">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/4">
                    <Image
                      src={movie.poster}
                      alt={movie.title}
                      width={200}
                      height={300}
                      className="rounded"
                    />
                  </div>
                  <div className="w-full md:w-3/4">
                    <h3 className="text-xl font-bold mb-2">{movie.title}</h3>
                    <div className="flex gap-4 text-sm mb-4">
                      <span>{movie.genre}</span>
                      <span>{movie.duration} phút</span>
                      <span>{movie.format}</span>
                    </div>

                    {/* Standard Showtimes */}
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold mb-2">2D Phụ đề</h4>
                      <div className="flex flex-wrap gap-2">
                        {movie.showTimes.standard?.map((showtime, index) => (
                          <Link
                            key={index}
                            href={showtime.link}
                            className="px-4 py-2 bg-gray-700 rounded hover:bg-cinestar-yellow hover:text-black transition-colors"
                          >
                            {showtime.time}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Deluxe Showtimes */}
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Deluxe</h4>
                      <div className="flex flex-wrap gap-2">
                        {movie.showTimes.deluxe?.map((showtime, index) => (
                          <Link
                            key={index}
                            href={showtime.link}
                            className="px-4 py-2 bg-gray-700 rounded hover:bg-cinestar-yellow hover:text-black transition-colors"
                          >
                            {showtime.time}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Layout>
  );
}
