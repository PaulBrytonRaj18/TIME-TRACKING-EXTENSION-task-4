"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (initialTime = 0) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const start = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now() - time;
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 1000);
    }
  }, [isRunning, time]);

  const stop = useCallback(() => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    }
  }, [isRunning]);

  const reset = useCallback((newInitialTime = 0) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRunning(false);
    setTime(newInitialTime);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // formattedTime is removed from here and moved to the Timer component
  // to ensure it re-renders on every tick.

  return { time, isRunning, start, stop, reset };
};
