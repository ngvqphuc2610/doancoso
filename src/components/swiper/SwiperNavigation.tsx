'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSwiper } from './SwiperContext';
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
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
             variant="nav"
             size={"swiper"}
             width={"swiper"}
            className="text-white hover:bg-[#13172C] hover:text-[#EBDB40] justify-start text-2xl p-5"
            onClick={handlePrev}
            aria-label="Previous"
          >
            <FaAngleLeft  />
          </Button>

          <Button
            variant="nav"
            size={"swiper"}
            width={"swiper"}
            className="text-white hover:bg-[#13172C] hover:text-[#EBDB40] justify-end text-2xl p-5"
            onClick={handleNext}
            aria-label="Next"
          >
            <FaAngleRight  />
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