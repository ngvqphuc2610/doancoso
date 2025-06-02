'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { NavigationFilter, Select } from '@/components/ui/navigation-filter';
import { useTranslation } from 'react-i18next';

interface Cinema {
  id_cinema: number;
  cinema_name: string;
  address: string;
}

interface Movie {
  id_movie: number;
  title: string;
}

interface Showtime {
  id_showtime: number;
  id_movie: number;
  id_screen: number;
  id_cinema: number;
  show_date: string;
  show_time: string;
  end_time?: string;
  format?: string;
  language?: string;
  subtitle?: string;
  status?: string;
  price?: number;

  // Movie info
  movie_title: string;
  poster_image?: string;
  duration?: number;
  genre?: string;
  rating?: string;

  // Screen info
  screen_name?: string;
  screen_type?: string;
  capacity?: number;

  // Cinema info
  cinema_name: string;
  cinema_address?: string;
  cinema_phone?: string;
}

// Get current date and next 7 days
const getDates = () => {
  const dates = [];
  const today = new Date();
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const dayOfWeek = daysOfWeek[date.getDay()];

    let label = `${dayOfWeek}, ${day}/${month}`;
    if (i === 0) label += ' (Hôm nay)';
    if (i === 1) label += ' (Ngày mai)';

    dates.push({
      value: `${day}/${month}/${date.getFullYear()}`,
      label,
      dateObj: date
    });
  }

  return dates;
};

export default function QuickBookingForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Data states
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);

  // Filtered data states
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [filteredDates, setFilteredDates] = useState<{ value: string, label: string }[]>([]);
  const [filteredTimes, setFilteredTimes] = useState<{ time: string, format: string, id: number }[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch cinemas
        const cinemasResponse = await fetch('/api/admin/cinema');
        const cinemasData = await cinemasResponse.json();

        if (cinemasData.success) {
          setCinemas(cinemasData.data);
          console.log('🏢 Cinemas loaded:', cinemasData.data);
        }

        // Fetch movies
        const moviesResponse = await fetch('/api/movies/now-showing');
        const moviesData = await moviesResponse.json();

        if (moviesData.success) {
          const formattedMovies = moviesData.data.map((movie: any) => ({
            id_movie: movie.id_movie,
            title: movie.title
          }));
          setMovies(formattedMovies);
          console.log('🎬 Movies loaded:', formattedMovies);
        }

        // Fetch showtimes with joined data - try detailed API first, fallback to basic API
        let showtimesData;
        try {
          console.log('🔄 Fetching showtimes from /api/showtimes/all-with-details');
          const showtimesResponse = await fetch('/api/showtimes/all-with-details');
          console.log('📡 Showtimes response status:', showtimesResponse.status);

          if (showtimesResponse.ok) {
            showtimesData = await showtimesResponse.json();
            console.log('📦 Detailed showtimes response data:', showtimesData);
          } else {
            throw new Error(`Detailed API failed: ${showtimesResponse.status}`);
          }
        } catch (detailedError) {
          console.warn('⚠️ Detailed API failed, trying basic API:', detailedError);

          // Fallback to basic API
          const basicResponse = await fetch('/api/showtimes/all');
          if (!basicResponse.ok) {
            throw new Error(`Both APIs failed. Basic API: ${basicResponse.status}`);
          }

          showtimesData = await basicResponse.json();
          console.log('📦 Basic showtimes response data:', showtimesData);
        }

        if (showtimesData.success) {
          const showtimes = showtimesData.data || showtimesData.showtimes || [];
          setShowtimes(showtimes);
          console.log('📅 Showtimes loaded:', showtimes.length, 'records');
        } else {
          throw new Error(showtimesData.message || 'Failed to load showtimes');
        }

      } catch (err: any) {
        console.error("❌ Error fetching data:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter movies when cinema changes
  useEffect(() => {
    if (selectedCinema && showtimes.length > 0) {
      console.log('🔍 Filtering movies for cinema ID:', selectedCinema);

      // Get showtimes for selected cinema
      const cinemaShowtimes = showtimes.filter(st =>
        st.id_cinema.toString() === selectedCinema
      );

      console.log('🏢 Cinema showtimes:', cinemaShowtimes.length);

      // Get unique movies for this cinema
      const uniqueMovieIds = [...new Set(cinemaShowtimes.map(st => st.id_movie))];
      const moviesForCinema = movies.filter(movie =>
        uniqueMovieIds.includes(movie.id_movie)
      );

      console.log('🎭 Movies for cinema:', moviesForCinema);
      setFilteredMovies(moviesForCinema);
    } else {
      setFilteredMovies([]);
    }

    // Reset dependent selections
    setSelectedMovie('');
    setSelectedDate('');
    setSelectedTime('');
    setFilteredDates([]);
    setFilteredTimes([]);
  }, [selectedCinema, showtimes, movies]);

  // Filter dates when movie changes
  useEffect(() => {
    if (selectedCinema && selectedMovie && showtimes.length > 0) {
      console.log('📅 Filtering dates for cinema:', selectedCinema, 'movie:', selectedMovie);

      // Get showtimes for selected cinema and movie
      const movieShowtimes = showtimes.filter(st =>
        st.id_cinema.toString() === selectedCinema &&
        st.id_movie.toString() === selectedMovie
      );

      console.log('🎬 Movie showtimes found:', movieShowtimes.length);

      // Get unique dates and format them
      const uniqueDates = [...new Set(movieShowtimes.map(st => st.show_date))];
      const today = new Date();

      const datesWithLabels = uniqueDates
        .map(dateString => {
          const date = new Date(dateString);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();

          const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
          const dayOfWeek = daysOfWeek[date.getDay()];

          let label = `${dayOfWeek}, ${day}/${month}`;

          // Add special labels for today/tomorrow
          const isToday = date.toDateString() === today.toDateString();
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          const isTomorrow = date.toDateString() === tomorrow.toDateString();

          if (isToday) label += ' (Hôm nay)';
          else if (isTomorrow) label += ' (Ngày mai)';

          return {
            value: `${day}/${month}/${year}`,
            label,
            sortDate: date.getTime()
          };
        })
        // Only show dates from today onwards
        .filter(dateInfo => {
          const dateFromValue = new Date(dateInfo.sortDate);
          return dateFromValue >= today;
        })
        // Sort by date
        .sort((a, b) => a.sortDate - b.sortDate);

      console.log('📅 Available dates:', datesWithLabels);
      setFilteredDates(datesWithLabels);
    } else {
      setFilteredDates([]);
    }

    // Reset dependent selections
    setSelectedDate('');
    setSelectedTime('');
    setFilteredTimes([]);
  }, [selectedMovie, selectedCinema, showtimes]);
  // Filter times when date changes
  useEffect(() => {
    if (selectedCinema && selectedMovie && selectedDate && showtimes.length > 0) {
      console.log('⏰ Filtering times for date:', selectedDate);

      // Convert selected date to database date format using our utility
      const [day, month, year] = selectedDate.split('/');
      const dbDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      // Log for debugging
      console.log('🗓️ Selected date (UI format):', selectedDate);
      console.log('🗓️ Selected date (DB format):', dbDate);

      // Get showtimes for selected cinema, movie and date
      const dateShowtimes = showtimes.filter(st => {
        const stDate = new Date(st.show_date);
        const stDateString = stDate.getFullYear() + '-' +
          String(stDate.getMonth() + 1).padStart(2, '0') + '-' +
          String(stDate.getDate()).padStart(2, '0');

        const isMatch = st.id_cinema.toString() === selectedCinema &&
          st.id_movie.toString() === selectedMovie &&
          stDateString === dbDate;

        if (isMatch) {
          console.log('✅ Found matching showtime:', st.id_showtime, 'for date:', stDateString);
        }

        return isMatch;
      });

      console.log('🎯 Showtimes for selected criteria:', dateShowtimes);

      // Format times and remove duplicates
      const times = dateShowtimes
        .map(st => ({
          time: st.show_time.substring(0, 5), // Remove seconds from HH:MM:SS
          format: st.format || '2D',
          id: st.id_showtime
        }))
        .sort((a, b) => a.time.localeCompare(b.time))
        // Remove duplicates based on time and format
        .filter((time, index, self) =>
          index === self.findIndex(t => t.time === time.time && t.format === time.format)
        );

      console.log('⏰ Available times:', times);
      setFilteredTimes(times);
    } else {
      setFilteredTimes([]);
    }

    // Reset time selection
    setSelectedTime('');
  }, [selectedDate, selectedMovie, selectedCinema, showtimes]);
  // Handle booking
  const handleBook = () => {
    if (!selectedCinema || !selectedMovie || !selectedDate || !selectedTime) {
      alert('Vui lòng chọn đầy đủ thông tin để đặt vé');
      return;
    }

    // Find the exact showtime
    const [day, month, year] = selectedDate.split('/');
    const dbDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    console.log('🎫 Booking for date:', selectedDate, '(DB format:', dbDate, ')');

    const matchedShowtime = showtimes.find(st => {
      const stDate = new Date(st.show_date);
      const stDateString = stDate.getFullYear() + '-' +
        String(stDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(stDate.getDate()).padStart(2, '0');

      const timeMatch = st.show_time.substring(0, 5) === selectedTime;

      const isMatch = st.id_cinema.toString() === selectedCinema &&
        st.id_movie.toString() === selectedMovie &&
        stDateString === dbDate &&
        timeMatch;

      if (isMatch) {
        console.log('✅ Found showtime match:', st.id_showtime);
        console.log('🔍 DB date:', stDateString, 'Selected date (DB format):', dbDate);
      }

      return isMatch;
    });

    if (!matchedShowtime) {
      alert('Không tìm thấy suất chiếu phù hợp. Vui lòng thử lại.');
      console.error('No matching showtime found for:', {
        selectedCinema,
        selectedMovie,
        selectedDate,
        selectedTime,
        dbDate
      });
      return;
    }

    // Movie info is already in matchedShowtime

    console.log('🎫 Booking showtime:', matchedShowtime);

    // Navigate to booking page
    // Chuyển đến trang movie detail với thông tin đã chọn
    const movieUrl = `/movie/${selectedMovie}?` +
      `showtime=${matchedShowtime.id_showtime}&` +
      `screen=${matchedShowtime.id_screen}&` +
      `cinema=${matchedShowtime.id_cinema}&` +
      `date=${selectedDate}&` +
      `time=${selectedTime}`;

    router.push(movieUrl);
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
        <h2 className="text-lg sm:text-xl text-[#464545] font-bold text-center lg:text-left lg:whitespace-nowrap">
          {t('select.title')}
        </h2>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Cinema Selection */}
          <Select
            value={selectedCinema}
            onChange={(e) => setSelectedCinema(e.target.value)}
            variant={selectedCinema ? 'custom1' : 'default'}
          >
            <option value="">1.{t('select.theater')}</option>
            {cinemas.map((cinema) => (
              <option key={cinema.id_cinema} value={cinema.id_cinema.toString()}>
                {cinema.cinema_name}
              </option>
            ))}
          </Select>

          {/* Movie Selection */}
          <Select
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
            state={!selectedCinema ? 'disabled' : 'default'}
            disabled={!selectedCinema}
            variant={selectedMovie ? 'custom1' : 'default'}
          >
            <option value="">2.{t('select.movie')}</option>
            {filteredMovies.map((movie) => (
              <option key={movie.id_movie} value={movie.id_movie.toString()}>
                {movie.title}
              </option>
            ))}
          </Select>

          {/* Date Selection */}
          <Select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            state={!selectedMovie ? 'disabled' : 'default'}
            disabled={!selectedMovie}
            variant={selectedDate ? 'custom1' : 'default'}
          >
            <option value="">3.{t('select.date')}</option>
            {filteredDates.map((date) => (
              <option key={date.value} value={date.value}>
                {date.label}
              </option>
            ))}
          </Select>

          {/* Time Selection */}
          <Select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            state={!selectedDate ? 'disabled' : 'default'}
            disabled={!selectedDate}
            variant={selectedTime ? 'custom1' : 'default'}
          >
            <option value="">4.{t('select.time')}</option>
            {filteredTimes.map((timeObj, index) => (
              <option key={index} value={timeObj.time}>
                {timeObj.time} - {timeObj.format}
              </option>
            ))}
          </Select>
        </div>

        {/* Booking Button */}
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

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p className="font-medium">{error}</p>
        </div>
      )}
    </NavigationFilter>
  );
}
