"use client";

import { useCallback, useRef, useEffect } from "react";
import { useGameStore } from "@/store";

export function useTiltControls() {
  const { markCorrect, markSkipped, nextCard, calibrationThreshold, isPlaying } = useGameStore();
  const lastAction = useRef<number>(0);
  const baseGamma = useRef<number | null>(null);
  const baseBeta = useRef<number | null>(null);
  const isCalibrated = useRef(false);

  const calibrate = useCallback(() => {
    baseGamma.current = null;
    baseBeta.current = null;
    isCalibrated.current = false;
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    let gammaSum = 0;
    let betaSum = 0;
    let samples = 0;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma;
      const beta = event.beta;

      if (gamma === null || beta === null) return;

      if (!isCalibrated.current) {
        gammaSum += gamma;
        betaSum += beta;
        samples++;

        if (samples >= 10) {
          baseGamma.current = gammaSum / samples;
          baseBeta.current = betaSum / samples;
          isCalibrated.current = true;
        }
        return;
      }

      const now = Date.now();
      if (now - lastAction.current < 300) return;

      const gammaDiff = gamma - (baseGamma.current || 0);
      const betaDiff = beta - (baseBeta.current || 0);

      if (gammaDiff < -calibrationThreshold) {
        lastAction.current = now;
        markCorrect();
        setTimeout(nextCard, 150);
      } else if (gammaDiff > calibrationThreshold) {
        lastAction.current = now;
        markSkipped();
        setTimeout(nextCard, 150);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [isPlaying, calibrationThreshold, markCorrect, markSkipped, nextCard]);

  return { calibrate };
}
