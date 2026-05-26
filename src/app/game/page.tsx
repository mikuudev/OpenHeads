"use client";

import { Suspense, useState, useEffect, useCallback, useRef, memo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useGameStore } from "@/store";
import { useTouchZones } from "@/hooks/useSwipeControls";
import { useTimer } from "@/hooks/useTimer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Card } from "@/types";

function useFullscreen() {
  const enter = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
    }
  }, []);

  const exit = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
    }
  }, []);

  return { enter, exit };
}

function useOrientation() {
  const [isLandscape, setIsLandscape] = useState(true);

  useEffect(() => {
    const check = () => {
      setIsLandscape(window.innerWidth >= window.innerHeight);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const lock = useCallback(async () => {
    try {
      const screen = window.screen as any;
      if (screen?.orientation?.lock) {
        await screen.orientation.lock("landscape");
      }
    } catch {
    }
  }, []);

  const unlock = useCallback(async () => {
    try {
      const screen = window.screen as any;
      if (screen?.orientation?.unlock) {
        screen.orientation.unlock();
      }
    } catch {
    }
  }, []);

  return { isLandscape, lock, unlock };
}

function CardDisplay({ card }: { card: Card }) {
  return (
    <motion.div
      key={card.id}
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="text-center w-full"
    >
      {card.image_url && (
        <img
          src={card.image_url}
          alt=""
          className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-2xl mx-auto mb-6 shadow-lg"
          loading="lazy"
        />
      )}
      {card.gif_url && (
        <img
          src={card.gif_url}
          alt=""
          className="w-36 h-36 sm:w-44 sm:h-44 object-cover rounded-2xl mx-auto mb-6 shadow-lg"
          loading="lazy"
        />
      )}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight px-4">
        {card.text}
      </h2>
    </motion.div>
  );
}

const MemoizedCardDisplay = memo(CardDisplay);

function RotateOverlay() {
  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center gap-6">
      <motion.div
        animate={{ rotate: [0, -90, 0, -90, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-violet-400"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          <path d="M21 3v5h-5" />
        </svg>
      </motion.div>
      <p className="text-xl font-semibold text-white">Rotate your device</p>
      <p className="text-sm text-zinc-400">Landscape mode for the best experience</p>
    </div>
  );
}

function ActionFeedback({ zone }: { zone: "correct" | "skip" | null }) {
  if (!zone) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "absolute inset-y-0 w-1/2 pointer-events-none z-10",
        zone === "correct"
          ? "right-0 bg-gradient-to-l from-emerald-500/20 to-transparent"
          : "left-0 bg-gradient-to-r from-red-500/20 to-transparent"
      )}
    />
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
    setCards,
    setPlaying,
    setTimeLeft,
    setDuration,
    setPaused,
    reset,
  } = useGameStore();

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const [flashZone, setFlashZone] = useState<"correct" | "skip" | null>(null);
  const flashTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { isLandscape, lock, unlock } = useOrientation();
  const { enter: enterFullscreen, exit: exitFullscreen } = useFullscreen();
  const { setFeedbackCallback } = useTouchZones();
  const initialized = useRef(false);

  useEffect(() => {
    setFeedbackCallback((zone) => {
      if (flashTimeout.current) clearTimeout(flashTimeout.current);
      setFlashZone(zone);
      flashTimeout.current = setTimeout(() => setFlashZone(null), 200);
    });
  }, [setFeedbackCallback]);

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

  const startRound = useCallback(async () => {
    setReady(true);
    setPlaying(true);

    await enterFullscreen();
    await lock();

    useGameStore.setState({ timeLeft: duration });
    initialized.current = true;
  }, [duration, enterFullscreen, lock, setPlaying]);

  const endRound = useCallback(async () => {
    setPlaying(false);
    setFinished(true);
    await exitFullscreen();
    await unlock();

    if (packId) {
      supabase.rpc("increment_pack_plays", { pack_id: packId }).then(() => {});
    }
  }, [packId, setPlaying, exitFullscreen, unlock]);

  const { timeLeft: timerTime } = useTimer(
    duration,
    endRound,
    isPlaying && !isPaused
  );

  useEffect(() => {
    if (isPlaying) setTimeLeft(timerTime);
  }, [timerTime, isPlaying, setTimeLeft]);

  const totalSeen = correct.length + skipped.length;
  const isComplete = finished || totalSeen >= cards.length;
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
            <span className="text-emerald-400">
              {correct.length} correct
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">{skipped.length} skipped</span>
          </div>

          <div className="max-w-xs mx-auto mb-8 space-y-2 max-h-40 overflow-y-auto">
            {correct.slice(0, 5).map((card) => (
              <div
                key={card.id}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300"
              >
                ✓ {card.text}
              </div>
            ))}
            {skipped.slice(0, 5).map((card) => (
              <div
                key={card.id}
                className="px-4 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-400"
              >
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
            <br />
            Tap right for correct, left to skip.
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

  return (
    <div
      data-game-container
      className="h-dvh bg-zinc-950 flex flex-col overflow-hidden select-none touch-none"
    >
      {!isLandscape && <RotateOverlay />}

      <AnimatePresence>
        {flashZone && <ActionFeedback zone={flashZone} />}
      </AnimatePresence>

      <div className="flex items-center justify-between px-6 pt-5 pb-3 z-20 relative">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-4xl font-bold tabular-nums text-white">
            {timeLeft}
          </span>
          <span className="text-sm text-zinc-500">s</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold text-xl">
            {correct.length}
          </span>
          <span className="text-zinc-600 text-lg">/</span>
          <span className="text-zinc-500 text-lg">{skipped.length}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 z-20 relative">
        <div className="w-full max-w-lg mx-auto">
          <div className="h-1.5 rounded-full bg-zinc-800 mb-6 overflow-hidden">
            <motion.div
              className="h-full bg-violet-600 rounded-full"
              initial={{ width: "100%" }}
              animate={{ width: `${(timeLeft / duration) * 100}%` }}
              transition={{ duration: 0.3, ease: "linear" }}
            />
          </div>

          <div className="relative flex items-center justify-center min-h-[240px] sm:min-h-[300px]">
            <AnimatePresence mode="wait">
              {currentCard && (
                <MemoizedCardDisplay card={currentCard} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 sm:px-10 pb-6 sm:pb-8 z-20 relative">
        <div className="flex flex-col items-center gap-1">
          <div className="h-10 w-20 sm:h-12 sm:w-24 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <span className="text-xs sm:text-sm font-semibold text-red-400">
              SKIP
            </span>
          </div>
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
            Left side
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="h-10 w-20 sm:h-12 sm:w-24 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <span className="text-xs sm:text-sm font-semibold text-emerald-400">
              CORRECT
            </span>
          </div>
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
            Right side
          </span>
        </div>
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="h-dvh flex items-center justify-center bg-zinc-950">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 animate-pulse" />
        </div>
      }
    >
      <GameContent />
    </Suspense>
  );
}
