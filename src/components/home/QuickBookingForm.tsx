'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { MovieDbAPI } from '@/services/MovieDbAPI';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Cinema {
  id: string;
  name: string;
}

interface Movie {
  id: string;
  title: string;
}

// Lấy danh sách rạp từ page.tsx
const cinemas: Cinema[] = [
  { id: 'dl', name: 'Cinestar Đà Lạt (TP. Đà Lạt)' },
  { id: 'qt', name: 'Cinestar Quốc Thanh (TP.HCM)' },
  { id: 'hbt', name: 'Cinestar Hai Bà Trưng (TP.HCM)' },
  { id: 'bd', name: 'CINESTAR SINH VIÊN(Bình Dương)' },
  { id: 'mt', name: 'Mỹ Tho (Tiền Giang)' },
  { id: 'kd', name: 'Kiên Giang (TP. Kiên Giang)' },
  { id: 'ld', name: 'Lâm Đồng (TP. Lâm Đồng)' },
  { id: 'hue', name: 'Cinestar Huế(TP. Huế)' },

];

// Get current date and next 5 days
const getDates = () => {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Format as "DD/MM"
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    // Add a label for today and tomorrow
    let label = `${day}/${month}`;
    if (i === 0) label = `Hôm nay ${label}`;
    if (i === 1) label = `Ngày mai ${label}`;

    dates.push({ value: `${day}/${month}/${date.getFullYear()}`, label });
  }

  return dates;
};

// Mock showtimes
const showtimes = [
  '10:30', '12:45', '15:00', '17:15', '19:30', '21:45', '23:59'
];

export default function QuickBookingForm() {
  const router = useRouter();
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedDate, setSelectedDate] = useState(getDates()[0].value);
  const [selectedTime, setSelectedTime] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        // Lấy dữ liệu phim đang chiếu từ API
        const nowPlayingMovies = await MovieDbAPI.getNowPlayingMovies();
        setMovies(nowPlayingMovies);
        setLoading(false);
      } catch (err) {
        console.error("Không thể lấy dữ liệu phim:", err);
        setError("Đã xảy ra lỗi khi tải dữ liệu phim.");
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleBook = () => {
    if (!selectedCinema || !selectedMovie || !selectedDate || !selectedTime) {
      alert('Vui lòng chọn đầy đủ thông tin');
      return;
    }

    // Lấy thông tin phim được chọn
    const movie = movies.find(m => m.id === selectedMovie);

    router.push(`/booking?cinema=${selectedCinema}&movie=${selectedMovie}&movieTitle=${encodeURIComponent(movie?.title || '')}&date=${selectedDate}&time=${selectedTime}`);
  };

  if (loading) {
    return (
      <div className="bg-cinestar-darkblue py-4 px-4 rounded-md shadow-lg max-w-6xl mx-auto -mt-6 relative z-20">
        <h2 className="text-xl font-bold mb-4 text-center">ĐẶT VÉ NHANH</h2>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cinestar-darkblue py-4 px-4 rounded-md shadow-lg max-w-6xl mx-auto -mt-6 relative z-20">
      <h2 className="text-xl font-bold mb-4 text-center">ĐẶT VÉ NHANH</h2>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-cinestar-yellow text-cinestar-darkblue font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
            <span>Chọn rạp</span>
          </div>
          <select
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            value={selectedCinema}
            onChange={(e) => setSelectedCinema(e.target.value)}
          >
            <option value="">Chọn rạp</option>
            {cinemas.map((cinema) => (
              <option key={cinema.id} value={cinema.id}>
                {cinema.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-cinestar-yellow text-cinestar-darkblue font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
            <span>Chọn phim</span>
          </div>
          <select
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
            disabled={!selectedCinema}
          >
            <option value="">Chọn phim</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-cinestar-yellow text-cinestar-darkblue font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
            <span>Chọn ngày</span>
          </div>
          <select
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={!selectedMovie}
          >
            {getDates().map((date, index) => (
              <option key={index} value={date.value}>
                {date.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-cinestar-yellow text-cinestar-darkblue font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
            <span>Chọn suất</span>
          </div>
          <select
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            disabled={!selectedDate}
          >
            <option value="">Chọn suất</option>
            {showtimes.map((time, index) => (
              <option key={index} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          onClick={handleBook}
          className="cinestar-button font-bold px-8 py-2"
          disabled={!selectedCinema || !selectedMovie || !selectedDate || !selectedTime}
        >
          ĐẶT NGAY
        </Button>
      </div>
    </div>
  );
}
