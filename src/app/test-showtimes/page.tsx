'use client';

import { useEffect, useState } from 'react';

interface Showtime {
  id_showtime: number;
  id_movie: number;
  id_screen: number;
  id_cinema: number;
  show_date: string;
  show_time: string;
  format?: string;
  movie_title: string;
  screen_name: string;
  cinema_name: string;
}

export default function TestShowtimes() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const response = await fetch('/api/showtimes/all');
        const data = await response.json();
        console.log('API Response:', data);
        setShowtimes(data.showtimes || []);
      } catch (error) {
        console.error('Error fetching showtimes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Showtimes Data</h1>
      
      <div className="mb-4">
        <p><strong>Total showtimes:</strong> {showtimes.length}</p>
      </div>

      <div className="grid gap-4">
        {showtimes.map((st) => {
          const showDate = new Date(st.show_date);
          const formattedDate = showDate.toISOString().split('T')[0];
          
          return (
            <div key={st.id_showtime} className="border p-4 rounded">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>ID:</strong> {st.id_showtime}</div>
                <div><strong>Movie ID:</strong> {st.id_movie}</div>
                <div><strong>Cinema ID:</strong> {st.id_cinema}</div>
                <div><strong>Screen ID:</strong> {st.id_screen}</div>
                <div><strong>Movie:</strong> {st.movie_title}</div>
                <div><strong>Cinema:</strong> {st.cinema_name}</div>
                <div><strong>Screen:</strong> {st.screen_name}</div>
                <div><strong>Date:</strong> {formattedDate}</div>
                <div><strong>Time:</strong> {st.show_time}</div>
                <div><strong>Format:</strong> {st.format || 'N/A'}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Filter Test</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Cinema ID = 1 (Cinestar Đà Lạt):</h3>
            <div className="ml-4">
              {showtimes
                .filter(st => st.id_cinema === 1)
                .map(st => (
                  <div key={st.id_showtime} className="text-sm">
                    Movie {st.id_movie}: {st.movie_title} - {new Date(st.show_date).toISOString().split('T')[0]} {st.show_time}
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Movie ID = 1 (Biệt Đội Sấm Sét*):</h3>
            <div className="ml-4">
              {showtimes
                .filter(st => st.id_movie === 1)
                .map(st => (
                  <div key={st.id_showtime} className="text-sm">
                    Cinema {st.id_cinema}: {st.cinema_name} - {new Date(st.show_date).toISOString().split('T')[0]} {st.show_time}
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Cinema 1 + Movie 1:</h3>
            <div className="ml-4">
              {showtimes
                .filter(st => st.id_cinema === 1 && st.id_movie === 1)
                .map(st => (
                  <div key={st.id_showtime} className="text-sm">
                    {new Date(st.show_date).toISOString().split('T')[0]} - {st.show_time} ({st.format})
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
