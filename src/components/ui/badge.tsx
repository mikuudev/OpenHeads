"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variant === "default" && "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
        variant === "secondary" && "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
        variant === "outline" && "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400",
        variant === "success" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        variant === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        variant === "danger" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function AnimatedBadge({ children, ...props }: React.ComponentProps<typeof Badge>) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex"
    >
      <Badge {...props}>{children}</Badge>
    </motion.span>
  );
}
