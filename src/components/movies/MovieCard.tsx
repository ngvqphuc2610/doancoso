import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import './MovieCard.scss';
import { FaEarthAsia } from "react-icons/fa6";
import { useTranslation } from 'react-i18next';

export interface MovieProps {
  id: string;
  title: string;
  poster: string;
  rating: string; // 'T13', 'T16', 'T18', 'P' (for all ages)
  genre: string;
  duration: number; // in minutes
  country: string;
  language: string; // 'VN', 'Phụ đề', 'Lồng tiếng'
  format: string; // '2D', '3D', etc.
  trailerUrl?: string;
  overview?: string;
  releaseDate?: string;
  voteAverage?: number;
  backdrop?: string | null;
  isComingSoon?: boolean; //để xác định phim sắp chiếu
}

export default function MovieCard({
  id,
  title = "",
  poster = "/images/no-poster.png",
  rating = "P",
  genre = "Phim",
  duration = 120,
  country = "Khác",
  language = "Phụ đề",
  format = "2D",
  trailerUrl = "",
  isComingSoon = false,
  releaseDate = "",
}: MovieProps) {
  const { t } = useTranslation();

  // Xử lý rating an toàn
  const safeRating = rating || 'P';
  let ratingKey = safeRating;

  // Đảm bảo chỉ gọi split khi chuỗi tồn tại và chứa dấu cách
  if (safeRating && safeRating.includes(' ')) {
    ratingKey = safeRating.split(' ')[0];
  }

  // Map rating to background color
  const ratingColor = {
    'T18': 'bg-red-600',
    'T16': 'bg-orange-600',
    'T13': 'bg-orange-500',
    'P': 'bg-green-600',
    'K': 'bg-blue-600',
  }[ratingKey] || 'bg-gray-600';

  // Xử lý trailer URL
  const embedTrailerUrl = trailerUrl && trailerUrl.includes('youtube.com/watch?v=')
    ? trailerUrl.replace('youtube.com/watch?v=', 'youtube.com/embed/')
    : trailerUrl;

  return (
    <Card className="movie-card h-full border-0 overflow-hidden bg-transparent shadow-none rounded-lg">
      <div className="relative overflow-hidden rounded-lg aspect-[2/3]">
        <Link href={`/movie/${id}`}>
          <div className="relative w-full h-full">
            <Image
              src={poster}
              alt={title || "Movie poster"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform hover:scale-105"
              style={{ objectPosition: 'center' }}
            />
          </div>
        </Link>
        <div className={`absolute top-2 left-2 ${ratingColor} text-white font-bold px-2 py-1 rounded text-xs`}>
          {safeRating}
        </div>
        <div className="movie-info">
          <h3>{title}</h3>
          <p>
            <img src="/images/icon-infofilm-tag.svg" className='class-img-infofilm' alt="Genre icon" />
            {genre}
          </p>
          <p>
            <img src="/images/icon-infofilm-clock.svg" className='class-img-infofilm' alt="Duration icon" />
            {t('movie.duration', { time: duration })}
          </p>
          <p>
            <FaEarthAsia className='icon-infofilm-earth' />
            {country}
          </p>
          <p>
            <img src="/images/icon-infofilm-subtitle.svg" className='class-img-infofilm' alt="Language icon" />
            {t('movie.language')}
          </p>
        </div>
      </div>

      <CardContent className="pt-4 space-y-3 flex flex-col justify-between">
        <Link href={`/movie/${id}`} className="block">
            {releaseDate && (
              <p className=" text-gray-400 text-center pb-3">
                {isComingSoon ? t('movie.releaseDate', { date: releaseDate }) : ""}
          
              </p>
            )}
            <p className="font-semibold text-white group-hover:text-cinestar-yellow truncate  md:text-base pl-2 text-center">
              {title}
            </p>
        </Link>

        <div className="flex justify-between gap-2 pt-3">
          {trailerUrl && (
            <Dialog>
              <DialogTrigger asChild>
                <span className="text-sm py-2 px-3 bg-transparent border-white text-white cursor-pointer flex items-center gap-1 underline">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 8 0ZM6 11.5V4.5L12 8L6 11.5Z" fill="currentColor" />
                  </svg>
                  {t('movie.watchTrailer')}
                </span>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] p-0 bg-black border-none">
                <DialogTitle>
                  <VisuallyHidden>{title ? `${t('movie.watchTrailer')}: ${title}` : t('movie.watchTrailer')}</VisuallyHidden>
                </DialogTitle>
                <iframe
                  width="100%"
                  height="450"
                  src={embedTrailerUrl}
                  title={`${title || "Movie"} trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="border-0"
                ></iframe>
              </DialogContent>
            </Dialog>
          )}
          
          <Link
            href={`/movie/${id}`}
            className=" text-xs py-2 px-0 ml-auto"
          >
            <Button variant="custom3" width="custom3" size={"default"}  >
              {isComingSoon ? t('movie.learnMore') : t('movie.bookNow')}
            
            </Button>
          </Link>
            
        </div>
      </CardContent>
    </Card>
  );
}