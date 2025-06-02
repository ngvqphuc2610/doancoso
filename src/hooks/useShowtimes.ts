import { useState, useEffect } from 'react';
import { ShowtimeData, CinemaData } from '@/types/showtime';

export function useShowtimes(movieId: string | number) {
    const [showtimes, setShowtimes] = useState<ShowtimeData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchShowtimes = async () => {
            try {
                console.log(`🎬 useShowtimes: Fetching showtimes for movie ID ${movieId}`);
                const response = await fetch(`/api/showtimes?movieId=${String(movieId)}`);

                const contentType = response.headers.get("content-type");
                if (!response.ok) {
                    console.error(`❌ API returned status ${response.status}`);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                if (!contentType || !contentType.includes("application/json")) {
                    console.error(`❌ API did not return JSON: ${contentType}`);
                    throw new Error("API did not return JSON");
                }

                const data = await response.json();
                console.log(`📊 Received API response:`, {
                    success: data.success,
                    dataLength: data.data?.length || 0
                });

                if (data.success) {
                    console.log(`✅ Retrieved ${data.data.length} showtimes:`,
                        data.data.map((st: any) => ({
                            date: st.date,
                            cinemaCount: st.cinemas?.length || 0
                        }))
                    );
                    setShowtimes(data.data);
                } else {
                    console.error(`❌ API error:`, data.error);
                    setError(data.error || 'Không thể tải lịch chiếu');
                }
            } catch (err) {
                console.error("❌ Fetch error:", err);
                setError('Đã có lỗi xảy ra khi tải lịch chiếu');
            } finally {
                setIsLoading(false);
            }
        };

        if (movieId) {
            fetchShowtimes();
        }
    }, [movieId]);

    return { showtimes, isLoading, error };
}

export function useCities() {
    const [cities, setCities] = useState<string[]>([]);
    const [cinemaToCity, setCinemaToCity] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch('/api/cinemas');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    const cinemas: CinemaData[] = data.data;
                    const uniqueCities = [...new Set(cinemas.map(cinema => cinema.city))].filter(Boolean);
                    setCities(uniqueCities);

                    // Create mapping of cinema names to their cities
                    const mapping: { [key: string]: string } = {};
                    cinemas.forEach(cinema => {
                        if (cinema.cinema_name && cinema.city) {
                            mapping[cinema.cinema_name] = cinema.city;
                        }
                    });
                    setCinemaToCity(mapping);
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        };

        fetchCities();
    }, []);

    return { cities, cinemaToCity };
}
