'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

interface Cinema {
  id: string;
  name: string;
}

interface Movie {
  id: string;
  title: string;
}

// Mock data
const cinemas: Cinema[] = [
  { id: '1', name: 'Cinestar Quốc Thanh (TP.HCM)' },
  { id: '2', name: 'Cinestar Hai Bà Trưng (TP.HCM)' },
  { id: '3', name: 'Cinestar Sinh Viên (Bình Dương)' },
  { id: '4', name: 'Cinestar Huế (TP. Huế)' },
  { id: '5', name: 'Cinestar Đà Lạt (TP. Đà Lạt)' },
  { id: '6', name: 'Cinestar Lâm Đồng (Đức Trọng)' },
  { id: '7', name: 'Cinestar Mỹ Tho (Tiền Giang)' },
  { id: '8', name: 'Cinestar Kiên Giang (Rạch Sỏi)' },
];

const movies: Movie[] = [
  { id: '1', title: 'ÂM DƯƠNG LỘ (T16)' },
  { id: '2', title: 'QUỶ NHẬP TRÀNG (T18)' },
  { id: '3', title: 'SÁT THỦ VŨ CÔNG CỰC HÀI (T16) LT' },
  { id: '4', title: 'NGHI LỄ TRỤC QUỶ (T18)' },
  { id: '5', title: 'NHÀ GIÀ MA CHÓ (T18)' },
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

  const handleBook = () => {
    if (!selectedCinema || !selectedMovie || !selectedDate || !selectedTime) {
      alert('Vui lòng chọn đầy đủ thông tin');
      return;
    }

    router.push(`/booking?cinema=${selectedCinema}&movie=${selectedMovie}&date=${selectedDate}&time=${selectedTime}`);
  };

  return (
    <div className="bg-cinestar-darkblue py-4 px-4 rounded-md shadow-lg max-w-6xl mx-auto -mt-6 relative z-20">
      <h2 className="text-xl font-bold mb-4 text-center">ĐẶT VÉ NHANH</h2>
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
