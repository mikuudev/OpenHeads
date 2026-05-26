"use client";

import { useCallback, useRef, useEffect } from "react";
import { useGameStore } from "@/store";

export function useTouchZones() {
  const { markCorrect, markSkipped, nextCard, isPlaying } = useGameStore();
  const lastAction = useRef<number>(0);
  const zoneRef = useRef<"correct" | "skip" | null>(null);
  const feedbackRef = useRef<((zone: "correct" | "skip") => void) | null>(null);

  const setFeedbackCallback = useCallback(
    (cb: (zone: "correct" | "skip") => void) => {
      feedbackRef.current = cb;
    },
    []
  );

  const handleAction = useCallback(
    (zone: "correct" | "skip") => {
      const now = Date.now();
      if (now - lastAction.current < 250) return;
      lastAction.current = now;

      if (zone === "correct") {
        markCorrect();
      } else {
        markSkipped();
      }

      if (navigator.vibrate) {
        navigator.vibrate(zone === "correct" ? 15 : 5);
      }

      feedbackRef.current?.(zone);

      setTimeout(nextCard, 100);
    },
    [markCorrect, markSkipped, nextCard]
  );

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!isPlaying) return;
      const rect = (e.target as HTMLElement).closest("[data-game-container]")?.getBoundingClientRect();
      if (!rect) return;

      const x = e.touches[0].clientX - rect.left;
      const midX = rect.width / 2;

      zoneRef.current = x < midX ? "skip" : "correct";
      handleAction(zoneRef.current);
    },
    [isPlaying, handleAction]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        handleAction("skip");
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        handleAction("correct");
      }
    },
    [isPlaying, handleAction]
  );

  useEffect(() => {
    if (!isPlaying) return;

    window.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, handleTouchStart, handleKeyDown]);

  return { setFeedbackCallback };
}
