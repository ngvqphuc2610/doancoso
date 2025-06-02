'use client';
import { MovieProps } from '@/components/movies/MovieCard';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import MovieShowtimes from './MovieShowtimes';
import { FaEarthAsia } from "react-icons/fa6";
import Layout from '@/components/layout/Layout';
import '@/components/movies/MovieCard.scss';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { useState, useEffect } from 'react';

interface Credits {
    director: string | null;
    actors: string[];
}

export default function MovieDetail({
    movie,
    credits,
    queryParams
}: {
    movie: MovieProps,
    credits: Credits,
    queryParams?: { [key: string]: string | string[] | undefined }
}) {

    if (!movie) {
        return <div>Loading...</div>;
    }

    return (
        <Layout>
            <main className="min-h-screen">
                <div className="container mx-auto px-0">
                    <div className="relative z-10 flex flex-col md:flex-row gap-8">
                        {/* Movie Poster */}
                        <div className="w-full md:w-1/3 lg:w-1/4">
                            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
                                <Image
                                    src={movie.poster}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Movie Info */}
                        <div className="w-full md:w-2/3 lg:w-3/4">
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <h1 className="text-4xl font-bold text-white">{movie.title}</h1>
                                <span className="inline-block px-3 py-1 rounded text-white bg-red-600 text-sm font-bold">
                                    {movie.ageRestriction}
                                </span>
                            </div>
                            <div className="gap-6 mb-8">
                                <div className="flex items-center gap-2">
                                    <img src="/images/icon-infofilm-tag.svg" className='class-img-infofilm' alt="Genre icon" />
                                    <p className="font-semibold text-white">{movie.genre}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <img src="/images/icon-infofilm-clock.svg" className='class-img-infofilm' alt="Duration icon" />
                                    <p className="font-semibold text-white">{movie.duration} phút</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaEarthAsia className='icon-infofilm-earth' />
                                    <p className="font-semibold text-white">{movie.country}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <img src="/images/icon-infofilm-subtitle.svg" className='class-img-infofilm' alt="Language icon" />
                                    <p className="font-semibold text-white">{movie.language}</p>
                                </div>
                            </div>

                            {movie.description && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold mb-3 text-white">Nội dung phim</h2>
                                    <p className="text-gray-300 leading-relaxed">{movie.description}</p>
                                </div>
                            )}

                            {/* Cast & Crew */}
                            {credits && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold mb-3">Mô Tả </h2>

                                    {/* Director */}
                                    {credits.director && (
                                        <div className="flex items-center gap-4">
                                            <span>Đạo diễn: {credits.director}</span>
                                        </div>
                                    )}

                                    {credits.actors && credits.actors.length > 0 && (
                                        <div className="flex gap-2">
                                            <span>Diễn viên:</span>
                                            <span>
                                                {credits.actors.map((actor: string, index: number) => (
                                                    <span key={index}>
                                                        {actor}{index < credits.actors.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-white">
                                        <p>Khởi chiếu: {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}</p>
                                        {movie.endDate && (
                                            <p>Kết thúc: {new Date(movie.endDate).toLocaleDateString('vi-VN')}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Trailer */}
                            {movie.trailerUrl && (
                                <div className="mt-8">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <span className="text-2xl py-2 px-3 bg-transparent border-white text-white cursor-pointer flex items-center gap-1 underline">
                                                <div className='border rounded-3xl border-white '><img src="/images/play-circle-red.svg" className='size-9 border-white ' alt="start icon" /></div>
                                                Xem trailer
                                            </span>
                                        </DialogTrigger>

                                        <DialogContent className="sm:max-w-[800px] p-0 bg-black border-none">
                                            <DialogTitle>
                                                <VisuallyHidden>
                                                    {movie.title
                                                        ? `Xem trailer: ${movie.title}`
                                                        : 'Xem trailer'}
                                                </VisuallyHidden>
                                            </DialogTitle>

                                            <iframe
                                                width="100%"
                                                height="450"
                                                src={movie.trailerUrl.replace('watch?v=', 'embed/')}
                                                title={`${movie.title} trailer`}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="border-0"
                                            ></iframe>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Lịch chiếu phim */}
                <MovieShowtimes
                    movieId={movie.id}
                    status={movie.status}
                    releaseDate={movie.releaseDate}
                    movieTitle={movie.title}
                    queryParams={queryParams}
                />
            </main>
        </Layout>
    );
}