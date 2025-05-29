import { useState, useEffect, useRef } from 'react';

export function useBookingTimer(initialTime: number = 300) {
    const [timeLeft, setTimeLeft] = useState<number>(initialTime);
    const [timerActive, setTimerActive] = useState<boolean>(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startTimer = () => {
        setTimerActive(true);
        setTimeLeft(initialTime);
    };

    const stopTimer = () => {
        setTimerActive(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    const resetTimer = () => {
        setTimeLeft(initialTime);
    };

    useEffect(() => {
        if (timerActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setTimerActive(false);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [timerActive, timeLeft]);

    return {
        timeLeft,
        timerActive,
        startTimer,
        stopTimer,
        resetTimer
    };
}
