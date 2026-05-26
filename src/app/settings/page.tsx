"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageTransition } from "@/components/ui/animations";
import { useUIStore } from "@/store";
import { Sun, Moon, Monitor, Volume2, Vibrate, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { soundEnabled, vibrationEnabled, setSoundEnabled, setVibrationEnabled } = useUIStore();

  const themes = [
    { key: "dark", label: "Dark", icon: Moon },
    { key: "light", label: "Light", icon: Sun },
    { key: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
        <Link href="/profile">
          <Button variant="ghost" size="sm" className="gap-1 mb-4">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </Link>

        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="space-y-8">
          <div>
            <label className="text-sm font-medium text-zinc-400 mb-3 block">Appearance</label>
            <div className="flex gap-2">
              {themes.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTheme(t.key)}
                    className={`flex-1 h-20 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-sm font-medium transition-all ${
                      theme === t.key
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-400 mb-3 block">Gameplay</label>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-5 w-5 text-zinc-400" />
                  <div>
                    <p className="font-medium text-sm">Sound Effects</p>
                    <p className="text-xs text-zinc-500">Play sounds during game</p>
                  </div>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <Vibrate className="h-5 w-5 text-zinc-400" />
                  <div>
                    <p className="font-medium text-sm">Vibration</p>
                    <p className="text-xs text-zinc-500">Haptic feedback</p>
                  </div>
                </div>
                <Switch
                  checked={vibrationEnabled}
                  onCheckedChange={setVibrationEnabled}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
