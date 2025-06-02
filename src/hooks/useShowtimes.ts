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
                // Sử dụng cùng API với QuickBookingForm để tránh timezone issues
                const response = await fetch('/api/showtimes/all-with-details');

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
                    // Filter showtimes theo movieId và group theo date
                    const filteredShowtimes = data.data.filter((st: any) =>
                        st.id_movie.toString() === movieId.toString()
                    );

                    console.log(`🎯 Filtered ${filteredShowtimes.length} showtimes for movie ${movieId}`);

                    // Group theo date như API cũ
                    const groupedByDate = filteredShowtimes.reduce((acc: any, st: any) => {
                        // Convert timezone đúng cách cho Vietnam (GMT+7)
                        let date;
                        if (st.show_date.includes('T')) {
                            // Convert UTC to Vietnam timezone
                            const utcDate = new Date(st.show_date);
                            const vietnamDate = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000)); // +7 hours
                            date = vietnamDate.toISOString().split('T')[0];
                        } else {
                            date = st.show_date;
                        }

                        if (!acc[date]) {
                            acc[date] = {
                                date: date,
                                cinemas: {}
                            };
                        }

                        if (!acc[date].cinemas[st.id_cinema]) {
                            acc[date].cinemas[st.id_cinema] = {
                                id: st.id_cinema,
                                name: st.cinema_name,
                                address: st.cinema_address,
                                showTimes: []
                            };
                        }

                        acc[date].cinemas[st.id_cinema].showTimes.push({
                            id: st.id_showtime,
                            time: st.show_time ? st.show_time.slice(0, 5) : '',
                            endTime: st.end_time ? st.end_time.slice(0, 5) : '',
                            date: date,
                            room: st.screen_name,
                            roomType: st.screen_type || 'Standard',
                            format: st.format,
                            price: st.price,
                            available_seats: st.capacity || 0,
                            total_seats: st.capacity || 0
                        });

                        return acc;
                    }, {});

                    // Convert to array format
                    const showtimesArray = Object.values(groupedByDate).map((dateData: any) => ({
                        ...dateData,
                        cinemas: Object.values(dateData.cinemas).map((cinema: any) => ({
                            ...cinema,
                            showTimes: cinema.showTimes.sort((a: any, b: any) =>
                                a.time.localeCompare(b.time)
                            )
                        }))
                    }));

                    console.log(`✅ Retrieved ${showtimesArray.length} date groups:`,
                        showtimesArray.map((st: any) => ({
                            date: st.date,
                            cinemaCount: st.cinemas?.length || 0
                        }))
                    );
                    setShowtimes(showtimesArray);
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
