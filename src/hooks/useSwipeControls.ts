"use client";

import { useCallback, useRef, useEffect } from "react";
import { useGameStore } from "@/store";
import { useTiltControls } from "./useTiltControls";

export function useSwipeControls() {
  const { markCorrect, markSkipped, nextCard, isPlaying } = useGameStore();
  const touchStart = useRef<{ y: number; time: number } | null>(null);
  const lastAction = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStart.current = { y: e.touches[0].clientY, time: Date.now() };
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return;

    const now = Date.now();
    if (now - lastAction.current < 300) return;

    const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
    const deltaTime = now - touchStart.current.time;

    if (Math.abs(deltaY) > 80 && deltaTime < 500) {
      lastAction.current = now;
      if (deltaY < 0) {
        markSkipped();
      } else {
        markCorrect();
      }
      setTimeout(nextCard, 150);
    }

    touchStart.current = null;
  }, [markCorrect, markSkipped, nextCard]);

  useEffect(() => {
    if (!isPlaying) return;

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isPlaying, handleTouchStart, handleTouchEnd]);

  return {};
}

export function useGameControls() {
  useTiltControls();
  useSwipeControls();
}
