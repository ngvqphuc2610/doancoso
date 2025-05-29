'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGlobalTimer } from '@/contexts/GlobalTimerContext';

interface SeatLockingHook {
  lockedSeats: Set<string>;
  lockSeat: (showtimeId: number, seatId: string) => Promise<boolean>;
  unlockSeat: (showtimeId: number, seatId: string) => Promise<void>;
  unlockAllSeats: () => Promise<void>;
  refreshLockedSeats: (showtimeId: number) => Promise<void>;
  startAutoRefresh: (showtimeId: number) => void;
  stopAutoRefresh: () => void;
  isLoading: boolean;
}

export function useSeatLocking(): SeatLockingHook {
  const [lockedSeats, setLockedSeats] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { sessionId } = useGlobalTimer();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate session ID if not available
  const getSessionId = useCallback(() => {
    if (sessionId) return sessionId;

    // Fallback session ID
    let fallbackSessionId = localStorage.getItem('seatLockingSessionId');
    if (!fallbackSessionId) {
      fallbackSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('seatLockingSessionId', fallbackSessionId);
    }
    return fallbackSessionId;
  }, [sessionId]);

  // Lock a seat
  const lockSeat = useCallback(async (showtimeId: number, seatId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const currentSessionId = getSessionId();

      const response = await fetch('/api/seat-locks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          showtimeId,
          seatId,
          sessionId: currentSessionId
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log(`🔒 Seat ${seatId} locked successfully`);
        return true;
      } else {
        console.warn(`❌ Failed to lock seat ${seatId}:`, result.error);

        // Show user-friendly error message
        if (result.errorCode === 'SEAT_LOCKED') {
          alert('Ghế này đang được người khác chọn. Vui lòng chọn ghế khác.');
        } else if (result.errorCode === 'SEAT_BOOKED') {
          alert('Ghế này đã được đặt. Vui lòng chọn ghế khác.');
        }

        return false;
      }
    } catch (error) {
      console.error('Error locking seat:', error);
      alert('Có lỗi xảy ra khi chọn ghế. Vui lòng thử lại.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getSessionId]);

  // Unlock a specific seat
  const unlockSeat = useCallback(async (showtimeId: number, seatId: string): Promise<void> => {
    try {
      const currentSessionId = getSessionId();

      await fetch(`/api/seat-locks?showtimeId=${showtimeId}&seatId=${seatId}&sessionId=${currentSessionId}`, {
        method: 'DELETE'
      });

      console.log(`🔓 Seat ${seatId} unlocked`);
    } catch (error) {
      console.error('Error unlocking seat:', error);
    }
  }, [getSessionId]);

  // Unlock all seats for current session
  const unlockAllSeats = useCallback(async (): Promise<void> => {
    try {
      const currentSessionId = getSessionId();

      await fetch(`/api/seat-locks?sessionId=${currentSessionId}`, {
        method: 'DELETE'
      });

      console.log('🔓 All seats unlocked');
    } catch (error) {
      console.error('Error unlocking all seats:', error);
    }
  }, [getSessionId]);

  // Refresh locked seats from server
  const refreshLockedSeats = useCallback(async (showtimeId: number): Promise<void> => {
    try {
      const response = await fetch(`/api/seat-locks/status?showtimeId=${showtimeId}`);
      const result = await response.json();

      if (result.success) {
        setLockedSeats(new Set(result.lockedSeats));
      }
    } catch (error) {
      console.error('Error refreshing locked seats:', error);
    }
  }, []);

  // Start auto-refresh for a specific showtime
  const startAutoRefresh = useCallback((showtimeId: number) => {
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Start new interval
    refreshIntervalRef.current = setInterval(() => {
      refreshLockedSeats(showtimeId);
    }, 5000);
  }, [refreshLockedSeats]);

  // Stop auto-refresh
  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Auto-refresh cleanup
  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, [stopAutoRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Unlock all seats when component unmounts
      unlockAllSeats();
    };
  }, [unlockAllSeats]);

  return {
    lockedSeats,
    lockSeat,
    unlockSeat,
    unlockAllSeats,
    refreshLockedSeats,
    startAutoRefresh,
    stopAutoRefresh,
    isLoading
  };
}
