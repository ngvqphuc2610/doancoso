'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { NavigationFilter, Select } from '@/components/ui/navigation-filter';
import { useTranslation } from 'react-i18next';
import { Cinema, getAllCinemas } from '@/lib/cinema';
import { getNowShowingMovies } from '@/lib/film';

interface Movie {
  id: string;
  title: string;
}

// Get current date and next 5 days
const getDates = () => {
  const dates = [];
  const today = new Date();
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Format as "DD/MM"
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const dayOfWeek = daysOfWeek[date.getDay()];

    // Add a label for today and tomorrow
    let label = `${dayOfWeek}, ${day}/${month}`;


    dates.push({ value: `${day}/${month}/${date.getFullYear()}`, label });
  }

  return dates;
};

// Mock showtimes
const showtimes = [
  '10:30', '12:45', '15:00', '17:15', '19:30', '21:45', '23:59'
];

export default function QuickBookingForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedDate, setSelectedDate] = useState(getDates()[0].value);
  const [selectedTime, setSelectedTime] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemaList, setCinemaList] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Fetch movies and cinemas from the database directly
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch movies directly from our film.tsx functions
        const moviesData = await getNowShowingMovies();

        // Convert to the format needed by the component
        const formattedMovies = moviesData.map(movie => ({
          id: movie.id,
          title: movie.title
        }));
        setMovies(formattedMovies);
        // Fetch cinemas directly using our cinema.tsx function
        const cinemas = await getAllCinemas();
        setCinemaList(cinemas);

        setLoading(false);
      } catch (err: any) {
        console.error("Không thể lấy dữ liệu:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);  // Set cinema list from data already fetched in main useEffect


  // Reset dependent values when parent value changes
  useEffect(() => {
    setSelectedMovie('');
    setSelectedDate('');
    setSelectedTime('');
  }, [selectedCinema]);

  useEffect(() => {
    setSelectedDate('');
    setSelectedTime('');
  }, [selectedMovie]);

  useEffect(() => {
    setSelectedTime('');
  }, [selectedDate]);

  const handleBook = () => {
    if (!selectedCinema || !selectedMovie || !selectedDate || !selectedTime) {
      alert('Vui lòng chọn đầy đủ thông tin');
      return;
    }

    // Lấy thông tin phim được chọn
    const movie = movies.find(m => m.id === selectedMovie);

    router.push(`/movie=${selectedMovie}&movieTitle=${encodeURIComponent(movie?.title || '')}&date=${selectedDate}&time=${selectedTime}`);
  };

  if (loading) {
    return (
      <NavigationFilter variant="dark" className="flex items-center justify-center py-4">
        <LoadingSpinner />
      </NavigationFilter>
    );
  }

  return (
    <NavigationFilter className="mt-6 z-20 mx-auto max-w-full">
      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
        <h2 className="text-lg sm:text-xl text-[#464545] font-bold text-center lg:text-left lg:whitespace-nowrap">{t('select.title')}</h2>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Select
            value={selectedCinema}
            onChange={(e) => setSelectedCinema(e.target.value)}
            variant={selectedCinema ? 'custom1' : 'default'}
          >            <option value="">1.{t('select.theater')}</option>
            {cinemaList.map((cinema) => (
              <option key={cinema.id} value={cinema.id}>{cinema.name}</option>
            ))}
          </Select>

          <Select
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
            state={!selectedCinema ? 'disabled' : 'default'}
            disabled={!selectedCinema}
            variant={selectedMovie ? 'custom1' : 'default'}
          >
            <option value="">2.{t('select.movie')}</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>{movie.title}</option>
            ))}
          </Select>

          <Select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            state={!selectedMovie ? 'disabled' : 'default'}
            disabled={!selectedMovie}
            variant={selectedDate ? 'custom1' : 'default'}
          >
            <option value="">3.{t('select.date')}</option>
            {selectedMovie && getDates().map((date) => (
              <option key={date.value} value={date.value}>{date.label}</option>
            ))}
          </Select>

          <Select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            state={!selectedDate ? 'disabled' : 'default'}
            disabled={!selectedDate}
            variant={selectedTime ? 'custom1' : 'default'}
          >
            <option value="">4.{t('select.time')} </option>
            {showtimes.map((time, index) => (
              <option key={index} value={time}>{time}</option>
            ))}
          </Select>
        </div>

        <div className="flex justify-center lg:justify-start">
          <Button
            variant={selectedCinema && selectedMovie && selectedDate && selectedTime ? 'custom6' : 'custom5'}
            size="custom5"
            width="custom5"
            onClick={handleBook}
            disabled={!selectedCinema || !selectedMovie || !selectedDate || !selectedTime}
            className="w-full sm:w-auto whitespace-nowrap transform transition duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {t('select.button')}
          </Button>
        </div>
      </div>

      {
        error && (
          <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p className="font-medium">{error}</p>
          </div>
        )
      }
    </NavigationFilter >
  );
}
