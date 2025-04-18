'use client';
import { MovieProps } from '@/components/movies/MovieCard';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FaEarthAsia } from "react-icons/fa6";
import { FiUserCheck } from "react-icons/fi";
import Layout from '@/components/layout/Layout';
import '@/components/movies/MovieCard.scss';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

interface Actor {
    id: number;
    name: string;
}

interface Credits {
    director?: { name: string };
    cast: Actor[];
}

export default function MovieDetail({ movie, credits }: { movie: any, credits: Credits }) {
    if (!movie) {
        return <div>Loading...</div>;
    }

    return (
        <Layout>
                    <main className="min-h-screen">
        
                        <div className="container mx-auto px-0 ">
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
                                        <h1 className="text-4xl font-bold">{movie.title}</h1>
                                        <span className="inline-block px-3 py-1 rounded text-white bg-red-600 text-sm font-bold">
                                            {movie.rating}
                                        </span>
                                    </div>
                                    <div className=" gap-6 mb-8">
                                        <div className="flex items-center gap-2">
                                            <img src="/images/icon-infofilm-tag.svg" className='class-img-infofilm' alt="Genre icon" />
                                            <p className="font-semibold">{movie.genre}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <img src="/images/icon-infofilm-clock.svg" className='class-img-infofilm' alt="Duration icon" />
                                            <p className="font-semibold">{movie.duration} phút</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaEarthAsia className='icon-infofilm-earth' />
                                            <p className="font-semibold">{movie.country}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <img src="/images/icon-infofilm-subtitle.svg" className='class-img-infofilm' alt="Language icon" />
                                            <p className="font-semibold">{movie.language}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FiUserCheck className='icon-infofilm-user' />
                                            <p className="font-medium icon-infofilm-user-title">Mày bắt buộc phải đủ 18t nghe chưa</p>
        
                                        </div>
        
                                    </div>
        
                                    {movie.overview && (
                                        <div className="mb-8">
                                            <h2 className="text-xl font-semibold mb-3">Nội dung phim</h2>
                                            <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
                                        </div>
                                    )}
        
                                    {/* Cast & Crew */}
                                    {credits && (
                                        <div className="space-y-6">
                                            <h2 className="text-xl font-semibold mb-3">Mô Tả</h2>
        
                                            {/* Director */}
                                            {credits.director && (
                                                <div className="flex items-center gap-4">
                                                    <span>Đạo diễn: {credits.director.name}</span>
                                                </div>
                                            )}
        
                                            {credits.cast && credits.cast.length > 0 && (
                                                <div className="flex gap-2">
                                                    <span>Diễn viên:</span>
                                                    <span>
                                                        {credits.cast.map((actor: Actor, index: number) => (
                                                            <span key={actor.id}>
                                                                {actor.name}{index < credits.cast.length - 1 ? ', ' : ''}
                                                            </span>
                                                        ))}
                                                    </span>
                                                </div>
                                            )}
                                            {movie.releaseDate && (
                                                <div>
                                                    <p className="text-gray-400 text-sm">Khởi chiếu</p>
                                                    <p className="font-semibold">{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</p>
                                                </div>
                                            )}
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
        
                                    {/* Booking Button */}
        
                                </div>
                            </div>
                        </div>
                    </main>
                </Layout>
    );
}