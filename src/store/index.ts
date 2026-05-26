import { create } from "zustand";
import type { User, Pack, Card, GameSession, Round } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));

interface GameState {
  isPlaying: boolean;
  session: GameSession | null;
  currentCard: Card | null;
  cards: Card[];
  currentIndex: number;
  correct: Card[];
  skipped: Card[];
  timeLeft: number;
  duration: number;
  round: Round | null;
  isPaused: boolean;
  isCalibrating: boolean;
  calibrationThreshold: number;
  setPlaying: (playing: boolean) => void;
  setSession: (session: GameSession | null) => void;
  setCurrentCard: (card: Card | null) => void;
  setCards: (cards: Card[]) => void;
  markCorrect: () => void;
  markSkipped: () => void;
  nextCard: () => void;
  setTimeLeft: (time: number) => void;
  setDuration: (duration: number) => void;
  setPaused: (paused: boolean) => void;
  setCalibrating: (calibrating: boolean) => void;
  setCalibrationThreshold: (threshold: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  isPlaying: false,
  session: null,
  currentCard: null,
  cards: [],
  currentIndex: 0,
  correct: [],
  skipped: [],
  timeLeft: 0,
  duration: 60,
  round: null,
  isPaused: false,
  isCalibrating: false,
  calibrationThreshold: 30,
  setPlaying: (isPlaying) => set({ isPlaying }),
  setSession: (session) => set({ session }),
  setCurrentCard: (currentCard) => set({ currentCard }),
  setCards: (cards) =>
    set({
      cards,
      currentIndex: 0,
      currentCard: cards[0] || null,
      correct: [],
      skipped: [],
    }),
  markCorrect: () => {
    const { currentCard, correct } = get();
    if (currentCard) set({ correct: [...correct, currentCard] });
  },
  markSkipped: () => {
    const { currentCard, skipped } = get();
    if (currentCard) set({ skipped: [...skipped, currentCard] });
  },
  nextCard: () => {
    const { currentIndex, cards } = get();
    const nextIndex = currentIndex + 1;
    if (nextIndex < cards.length) {
      set({
        currentIndex: nextIndex,
        currentCard: cards[nextIndex],
      });
    } else {
      set({ currentCard: null });
    }
  },
  setTimeLeft: (timeLeft) => set({ timeLeft }),
  setDuration: (duration) => set({ duration }),
  setPaused: (isPaused) => set({ isPaused }),
  setCalibrating: (isCalibrating) => set({ isCalibrating }),
  setCalibrationThreshold: (calibrationThreshold) =>
    set({ calibrationThreshold }),
  reset: () =>
    set({
      isPlaying: false,
      session: null,
      currentCard: null,
      cards: [],
      currentIndex: 0,
      correct: [],
      skipped: [],
      timeLeft: 0,
      duration: 60,
      round: null,
      isPaused: false,
    }),
}));

interface UIState {
  theme: "dark" | "light" | "system";
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  setTheme: (theme: "dark" | "light" | "system") => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: "dark",
  soundEnabled: true,
  vibrationEnabled: true,
  setTheme: (theme) => set({ theme }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setVibrationEnabled: (vibrationEnabled) => set({ vibrationEnabled }),
}));

interface PacksState {
  packs: Pack[];
  currentPack: Pack | null;
  isLoading: boolean;
  setPacks: (packs: Pack[]) => void;
  setCurrentPack: (pack: Pack | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const usePacksStore = create<PacksState>((set) => ({
  packs: [],
  currentPack: null,
  isLoading: false,
  setPacks: (packs) => set({ packs }),
  setCurrentPack: (currentPack) => set({ currentPack }),
  setLoading: (isLoading) => set({ isLoading }),
}));
