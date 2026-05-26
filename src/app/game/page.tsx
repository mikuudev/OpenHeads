"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useGameStore } from "@/store";
import { useTimer } from "@/hooks/useTimer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Card } from "@/types";

function FullscreenToggle() {
  const toggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };
  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 h-8 w-8 rounded-xl bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center text-white text-xs"
      aria-label="Toggle fullscreen"
    >
      ⛶
    </button>
  );
}

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packId = searchParams.get("pack");

  const {
    cards,
    currentCard,
    currentIndex,
    correct,
    skipped,
    timeLeft,
    duration,
    isPlaying,
    isPaused,
    isCalibrating,
    calibrationThreshold,
    setCards,
    setCurrentCard,
    markCorrect,
    markSkipped,
    nextCard,
    setPlaying,
    setTimeLeft,
    setDuration,
    setPaused,
    setCalibrating,
    setCalibrationThreshold,
    reset,
  } = useGameStore();

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  const [gammaDiff, setGammaDiff] = useState(0);
  const lastActionRef = useRef(0);
  const baseGammaRef = useRef<number | null>(null);
  const baseBetaRef = useRef<number | null>(null);

  useEffect(() => {
    if (!packId) {
      router.push("/discovery");
      return;
    }

    const fetchCards = async () => {
      const { data } = await supabase
        .from("cards")
        .select("*")
        .eq("pack_id", packId)
        .order("order", { ascending: true });

      if (data && data.length > 0) {
        setCards(data as Card[]);
        setLoading(false);
      } else {
        toast.error("No cards in this pack");
        router.push("/discovery");
      }
    };

    const dur = searchParams.get("duration");
    if (dur) setDuration(parseInt(dur));

    fetchCards();
  }, [packId]);

  const startRound = () => {
    setReady(true);
    setPlaying(true);
    setShowCalibration(true);

    setTimeout(() => {
      setShowCalibration(false);
      useGameStore.setState({ timeLeft: duration });
    }, 3000);
  };

  const endRound = useCallback(() => {
    setPlaying(false);
    setFinished(true);

    if (packId) {
      supabase.rpc("increment_pack_plays", { pack_id: packId }).then(() => {});
    }
  }, [packId, setPlaying]);

  const { timeLeft: timerTime } = useTimer(duration, endRound, isPlaying && !isPaused && !showCalibration);

  useEffect(() => {
    if (isPlaying) setTimeLeft(timerTime);
  }, [timerTime, isPlaying, setTimeLeft]);

  const totalSeen = correct.length + skipped.length;
  const isComplete = finished || totalSeen >= cards.length;

  const handleCorrect = useCallback(() => {
    const now = Date.now();
    if (now - lastActionRef.current < 250) return;
    lastActionRef.current = now;
    markCorrect();
    if (navigator.vibrate) navigator.vibrate(15);
    setTimeout(nextCard, 100);
  }, [markCorrect, nextCard]);

  const handleSkip = useCallback(() => {
    const now = Date.now();
    if (now - lastActionRef.current < 250) return;
    lastActionRef.current = now;
    markSkipped();
    if (navigator.vibrate) navigator.vibrate(5);
    setTimeout(nextCard, 100);
  }, [markSkipped, nextCard]);

  useEffect(() => {
    if (!isPlaying || showCalibration) return;

    let gammaSum = 0;
    let betaSum = 0;
    let samples = 0;
    let calibrated = false;

    const handler = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma;
      const beta = e.beta;
      if (gamma === null || beta === null) return;

      if (!calibrated) {
        gammaSum += gamma;
        betaSum += beta;
        samples++;
        if (samples >= 10) {
          baseGammaRef.current = gammaSum / samples;
          baseBetaRef.current = betaSum / samples;
          calibrated = true;
        }
        return;
      }

      const diff = gamma - (baseGammaRef.current || 0);
      setGammaDiff(diff);

      if (diff < -calibrationThreshold) {
        handleCorrect();
      } else if (diff > calibrationThreshold) {
        handleSkip();
      }
    };

    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, [isPlaying, showCalibration, calibrationThreshold, handleCorrect, handleSkip]);

  const score = correct.length;

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-zinc-950">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 animate-pulse" />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold mb-2">{score}</h1>
          <p className="text-xl text-zinc-400 mb-2">points</p>
          <div className="flex gap-4 justify-center mb-8 text-sm">
            <span className="text-emerald-400">{correct.length} correct</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">{skipped.length} skipped</span>
          </div>

          <div className="max-w-xs mx-auto mb-8 space-y-2">
            {correct.slice(0, 5).map((card) => (
              <div key={card.id} className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300">
                ✓ {card.text}
              </div>
            ))}
            {skipped.slice(0, 5).map((card) => (
              <div key={card.id} className="px-4 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-400">
                ✗ {card.text}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/packs/${packId}`)}
              className="h-12 px-6 rounded-xl bg-zinc-800 text-zinc-200 font-medium text-sm"
            >
              Back to Pack
            </button>
            <button
              onClick={() => {
                reset();
                setReady(false);
                setFinished(false);
                setLoading(false);
                if (packId) {
                  startRound();
                }
              }}
              className="h-12 px-6 rounded-xl bg-violet-600 text-white font-medium text-sm shadow-lg shadow-violet-500/25"
            >
              Play Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-500/25">
            <span className="text-3xl">🎮</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Ready?</h1>
          <p className="text-zinc-400 mb-2">
            {cards.length} cards · {duration}s rounds
          </p>
          <p className="text-sm text-zinc-500 mb-8">
            Hold the phone to your forehead.
            <br />
            Your friends will give you clues.
          </p>
          <button
            onClick={startRound}
            className="h-14 px-10 rounded-2xl bg-violet-600 text-white font-semibold text-lg shadow-2xl shadow-violet-500/25 hover:bg-violet-500 active:scale-95 transition-all"
          >
            Start Round
          </button>
          <button
            onClick={() => router.back()}
            className="block mx-auto mt-4 text-sm text-zinc-600 hover:text-zinc-400"
          >
            Go back
          </button>
        </motion.div>
      </div>
    );
  }

  if (showCalibration) {
    return (
      <div className="h-dvh flex items-center justify-center bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-8">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-violet-600 animate-pulse mx-auto mb-4" />
          <p className="text-lg font-medium">Calibrating...</p>
          <p className="text-sm text-zinc-500 mt-2">Hold the phone steady</p>
          <div className="mt-6 w-48 h-2 rounded-full bg-zinc-800 overflow-hidden mx-auto">
            <motion.div
              className="h-full bg-violet-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5 }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col overflow-hidden select-none touch-none">
      <FullscreenToggle />

      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold tabular-nums">{timeLeft}</span>
          <span className="text-sm text-zinc-500">s</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-emerald-400 font-semibold text-lg">{correct.length}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-500">{skipped.length}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-4">
        <div className="w-full max-w-sm mx-auto">
          <div className="h-2 rounded-full bg-zinc-800 mb-8 overflow-hidden">
            <motion.div
              className="h-full bg-violet-600 rounded-full"
              initial={{ width: "100%" }}
              animate={{ width: `${(timeLeft / duration) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <AnimatePresence mode="wait">
            {currentCard && (
              <motion.div
                key={currentCard.id + currentIndex}
                initial={{ opacity: 0, rotateX: -15, y: 30 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                exit={{ opacity: 0, rotateX: 15, y: -30 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="text-center"
              >
                {currentCard.image_url && (
                  <img
                    src={currentCard.image_url}
                    alt=""
                    className="w-32 h-32 object-cover rounded-2xl mx-auto mb-6"
                  />
                )}
                {currentCard.gif_url && (
                  <img
                    src={currentCard.gif_url}
                    alt=""
                    className="w-40 h-40 object-cover rounded-2xl mx-auto mb-6"
                  />
                )}
                <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
                  {currentCard.text}
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 px-6 pb-10">
        <button
          onClick={handleSkip}
          className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-red-600/20 border-2 border-red-600/40 flex items-center justify-center active:scale-90 transition-transform"
        >
          <span className="text-2xl sm:text-3xl rotate-180">⬆</span>
        </button>
        <button
          onClick={handleCorrect}
          className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-emerald-600/20 border-2 border-emerald-600/40 flex items-center justify-center active:scale-90 transition-transform"
        >
          <span className="text-2xl sm:text-3xl">⬇</span>
        </button>
      </div>

      <div className="flex items-center justify-around px-8 pb-6 text-xs text-zinc-600">
        <span>Swipe up · Tilt up</span>
        <span>Skip</span>
        <span className="text-emerald-600">Correct</span>
        <span>Swipe down · Tilt down</span>
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="h-dvh flex items-center justify-center bg-zinc-950">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 animate-pulse" />
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
