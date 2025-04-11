'use client';

import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import type { Swiper as SwiperType } from 'swiper';

interface SwiperContextType {
  swiperRef: React.MutableRefObject<SwiperType | undefined>;
  currentSlide: number;
  setCurrentSlide: (index: number) => void;
  totalSlides: number;
  setTotalSlides: (total: number) => void;
  handlePrev: () => void;
  handleNext: () => void;
  goToSlide: (index: number) => void;
}

const SwiperContext = createContext<SwiperContextType | undefined>(undefined);

export const SwiperProvider = ({ children, id = 'default' }: { children: ReactNode, id?: string }) => {
  const swiperRef = useRef<SwiperType>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);

  const handlePrev = () => {
    if (!swiperRef.current) return;
    const targetSlide = Math.max(0, currentSlide - 4);
    swiperRef.current.slideTo(targetSlide);
  };

  const handleNext = () => {
    if (!swiperRef.current) return;
    const targetSlide = Math.min(totalSlides - 1, currentSlide + 4);
    swiperRef.current.slideTo(targetSlide);
  };

  const goToSlide = (index: number) => {
    if (!swiperRef.current) return;
    swiperRef.current.slideTo(index);
  };

  return (
    <SwiperContext.Provider 
      value={{ 
        swiperRef, 
        currentSlide, 
        setCurrentSlide, 
        totalSlides, 
        setTotalSlides,
        handlePrev,
        handleNext,
        goToSlide
      }}
    >
      {children}
    </SwiperContext.Provider>
  );
};

export const useSwiper = () => {
  const context = useContext(SwiperContext);
  if (context === undefined) {
    throw new Error('useSwiper must be used within a SwiperProvider');
  }
  return context;
};