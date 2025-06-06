"use client";

import React, { useState, useEffect } from 'react';
import Layout2 from '@/components/layout/Layout2';
import MovieGrid from '@/components/movies/MovieGrid';
import { MovieProps } from '@/components/movies/MovieCard';
import { getNowShowingMovies } from '@/lib/film';

import { useTranslation } from 'react-i18next';
export default function ShowingPage() {
    const { t } = useTranslation();
    const [movies, setMovies] = useState<MovieProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                const nowPlayingMovies = await getNowShowingMovies();
                setMovies(nowPlayingMovies.map(movie => ({ ...movie, isComingSoon: false })));
                setLoading(false);
            } catch (err) {
                
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    return (
        <Layout2>
            <div className="container mx-auto px-4 py-8">
                {error && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                        <p>{error}</p>
                    </div>
                )}

                <div className='mb-32'>
                    <MovieGrid movies={movies} title={t('movie.nowShowing')} />
                </div>
            </div>
        </Layout2>
    );
}