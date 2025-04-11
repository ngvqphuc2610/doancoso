'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSwiper } from './SwiperContext';

interface SwiperNavigationProps {
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
}

const SwiperNavigation = ({ 
  showDots = true, 
  showArrows = true,
  className = ''
}: SwiperNavigationProps) => {
  const { 
    handlePrev, 
    handleNext, 
    currentSlide, 
    totalSlides,
    goToSlide
  } = useSwiper();

  // Số lượng slides trong mỗi nhóm (thường là 4 cho máy tính, 1-3 cho thiết bị di động)
  const slidesPerGroup = 4;
  const totalGroups = Math.ceil(totalSlides / slidesPerGroup);
  const currentGroup = Math.floor(currentSlide / slidesPerGroup);

  if (!showArrows && !showDots) return null;

  return (
    <div className={`swiper-navigation ${className}`}>
      {/* Navigation arrows */}
      {showArrows && totalSlides > slidesPerGroup && (
        <div className="flex justify-between mb-4">
          <Button
            variant="ghost"
            className="text-white hover:bg-black/30 hover:text-white justify-start"
            onClick={handlePrev}
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            className="text-white hover:bg-black/30 hover:text-white justify-end"
            onClick={handleNext}
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Dots navigation */}
      {showDots && totalSlides > slidesPerGroup && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalGroups }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index * slidesPerGroup)}
              className={`w-2 h-2 rounded-full ${
                currentGroup === index 
                  ? 'bg-cinestar-yellow' 
                  : 'bg-white bg-opacity-50'
              }`}
              aria-label={`Go to slide group ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SwiperNavigation;