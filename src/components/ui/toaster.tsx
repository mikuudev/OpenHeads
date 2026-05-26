"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";

export function Toaster() {
  const { theme } = useTheme();
  return (
    <SonnerToaster
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-zinc-900 group-[.toaster]:text-zinc-900 dark:group-[.toaster]:text-zinc-100 group-[.toaster]:border-zinc-200 dark:group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-zinc-500 dark:group-[.toast]:text-zinc-400",
          actionButton:
            "group-[.toast]:bg-violet-600 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-zinc-100 dark:group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-600 dark:group-[.toast]:text-zinc-400",
        },
      }}
    />
  );
}
