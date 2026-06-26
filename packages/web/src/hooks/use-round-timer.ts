import { useCallback, useEffect, useRef, useState } from 'react';

interface UseRoundTimerOptions {
  durationSeconds: number;
  autoStart?: boolean;
  onExpire?: () => void;
}

export function useRoundTimer({ durationSeconds, autoStart = false, onExpire }: UseRoundTimerOptions) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isExpired, setIsExpired] = useState(false);
  const onExpireRef = useRef(onExpire);

  onExpireRef.current = onExpire;

  const reset = useCallback(
    (nextDuration = durationSeconds) => {
      setSecondsLeft(nextDuration);
      setIsExpired(false);
      setIsRunning(true);
    },
    [durationSeconds],
  );

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (!isExpired) {
      setIsRunning(true);
    }
  }, [isExpired]);

  useEffect(() => {
    setSecondsLeft(durationSeconds);
    setIsExpired(false);
  }, [durationSeconds]);

  useEffect(() => {
    if (!isRunning || isExpired || secondsLeft <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setIsRunning(false);
          setIsExpired(true);
          onExpireRef.current?.();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isRunning, isExpired, secondsLeft]);

  return {
    secondsLeft,
    isRunning,
    isExpired,
    reset,
    pause,
    resume,
  };
}

export function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}
