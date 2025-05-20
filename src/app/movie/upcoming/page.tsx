"use client";

import React, { useState, useEffect } from 'react';
import Layout2 from '@/components/layout/Layout2';
import MovieGrid from '@/components/movies/MovieGrid';
import { MovieProps } from '@/components/movies/MovieCard';
import { getComingSoonMovies } from '@/lib/film';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTranslation } from 'react-i18next';
export default function UpcomingPage() {
    const { t } = useTranslation();
    const [movies, setMovies] = useState<MovieProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                const upcomingMovies = await getComingSoonMovies();
                setMovies(upcomingMovies.map(movie => ({ ...movie, isComingSoon: true })));
                setLoading(false);
            } catch (err) {
                
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    if (loading) {
        return (
            <Layout2>
                <div className="container mx-auto px-4 py-16 flex justify-center items-center">
                    <LoadingSpinner />
                </div>
            </Layout2>
        );
    }

    return (
        <Layout2>
            <div className="container mx-auto px-0 py-8">
                {error && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                        <p>{error}</p>
                    </div>
                )}

                <div className='mt-8 pb-[100px]'>
                    <MovieGrid movies={movies} title={t('movie.comingSoon')} />
                </div>
            </div>
        </Layout2>
    );
}