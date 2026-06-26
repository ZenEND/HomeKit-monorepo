import { useCallback, useEffect, useRef } from 'react';
import useSound from 'use-sound';

const soundBase = '/sounds/alias';

export function useAliasSounds(enabled: boolean) {
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const [playApprove] = useSound(`${soundBase}/approve.wav`, { volume: 0.45, interrupt: true });
  const [playSkip] = useSound(`${soundBase}/skip.wav`, { volume: 0.4, interrupt: true });
  const [playTick] = useSound(`${soundBase}/tick.wav`, { volume: 0.25, interrupt: true });
  const [playTimeUp] = useSound(`${soundBase}/time-up.wav`, { volume: 0.5, interrupt: true });
  const [playStart] = useSound(`${soundBase}/start.wav`, { volume: 0.35, interrupt: true });

  const playIfEnabled = useCallback((play: () => void) => {
    if (enabledRef.current) {
      play();
    }
  }, []);

  return {
    playApprove: useCallback(() => playIfEnabled(playApprove), [playApprove, playIfEnabled]),
    playSkip: useCallback(() => playIfEnabled(playSkip), [playSkip, playIfEnabled]),
    playTick: useCallback(() => playIfEnabled(playTick), [playTick, playIfEnabled]),
    playTimeUp: useCallback(() => playIfEnabled(playTimeUp), [playTimeUp, playIfEnabled]),
    playStart: useCallback(() => playIfEnabled(playStart), [playStart, playIfEnabled]),
  };
}

export function useTimerTicks(secondsLeft: number, playTick: () => void, enabled: boolean) {
  const previousSecondsRef = useRef(secondsLeft);

  useEffect(() => {
    if (!enabled) {
      previousSecondsRef.current = secondsLeft;
      return;
    }

    if (secondsLeft > 0 && secondsLeft <= 10 && secondsLeft < previousSecondsRef.current) {
      playTick();
    }

    previousSecondsRef.current = secondsLeft;
  }, [enabled, playTick, secondsLeft]);
}
