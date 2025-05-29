'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface GlobalTimerContextType {
    timeLeft: number;
    isActive: boolean;
    startTimer: (duration?: number) => void;
    stopTimer: () => void;
    resetTimer: () => void;
    formatTime: () => string;
    sessionId: string | null;
}

const GlobalTimerContext = createContext<GlobalTimerContextType | undefined>(undefined);

interface GlobalTimerProviderProps {
    children: React.ReactNode;
}

export function GlobalTimerProvider({ children }: GlobalTimerProviderProps) {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const durationRef = useRef<number>(300); // Default 5 minutes

    // Load timer state from localStorage on mount
    useEffect(() => {
        const savedTimer = localStorage.getItem('globalTimer');
        if (savedTimer) {
            try {
                const { startTime, duration, sessionId: savedSessionId, isActive: savedIsActive } = JSON.parse(savedTimer);
                
                if (savedIsActive && startTime) {
                    const elapsed = Math.floor((Date.now() - startTime) / 1000);
                    const remaining = Math.max(duration - elapsed, 0);
                    
                    if (remaining > 0) {
                        setTimeLeft(remaining);
                        setIsActive(true);
                        setSessionId(savedSessionId);
                        startTimeRef.current = startTime;
                        durationRef.current = duration;
                    } else {
                        // Timer expired, clear it
                        localStorage.removeItem('globalTimer');
                        setTimeLeft(0);
                        setIsActive(false);
                        setSessionId(null);
                    }
                }
            } catch (error) {
                console.error('Error loading timer state:', error);
                localStorage.removeItem('globalTimer');
            }
        }
    }, []);

    // Save timer state to localStorage whenever it changes
    useEffect(() => {
        if (isActive && startTimeRef.current) {
            const timerState = {
                startTime: startTimeRef.current,
                duration: durationRef.current,
                sessionId,
                isActive
            };
            localStorage.setItem('globalTimer', JSON.stringify(timerState));
        } else {
            localStorage.removeItem('globalTimer');
        }
    }, [isActive, sessionId, timeLeft]);

    // Timer countdown effect
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsActive(false);
                        setSessionId(null);
                        startTimeRef.current = null;
                        localStorage.removeItem('globalTimer');
                        
                        // Notify user that time is up
                        if (typeof window !== 'undefined') {
                            alert('Thời gian giữ ghế đã hết! Vui lòng chọn lại.');
                        }
                        
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isActive, timeLeft]);

    const startTimer = useCallback((duration: number = 300) => {
        const newSessionId = `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = Date.now();
        
        setTimeLeft(duration);
        setIsActive(true);
        setSessionId(newSessionId);
        startTimeRef.current = startTime;
        durationRef.current = duration;
        
        console.log(`Global timer started: ${duration}s, Session: ${newSessionId}`);
    }, []);

    const stopTimer = useCallback(() => {
        setIsActive(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        localStorage.removeItem('globalTimer');
        console.log('Global timer stopped');
    }, []);

    const resetTimer = useCallback(() => {
        setTimeLeft(0);
        setIsActive(false);
        setSessionId(null);
        startTimeRef.current = null;
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        localStorage.removeItem('globalTimer');
        console.log('Global timer reset');
    }, []);

    const formatTime = useCallback(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, [timeLeft]);

    const value: GlobalTimerContextType = {
        timeLeft,
        isActive,
        startTimer,
        stopTimer,
        resetTimer,
        formatTime,
        sessionId
    };

    return (
        <GlobalTimerContext.Provider value={value}>
            {children}
        </GlobalTimerContext.Provider>
    );
}

export function useGlobalTimer() {
    const context = useContext(GlobalTimerContext);
    if (context === undefined) {
        throw new Error('useGlobalTimer must be used within a GlobalTimerProvider');
    }
    return context;
}
