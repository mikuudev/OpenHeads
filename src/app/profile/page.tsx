"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition, FadeIn } from "@/components/ui/animations";
import {
  User,
  Settings,
  LogOut,
  Gamepad2,
  Award,
  TrendingUp,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6">
        <Skeleton className="h-20 w-20 rounded-2xl mb-4" />
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32 mb-8" />
        <Skeleton className="h-24 rounded-2xl mb-4" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-dvh flex items-center justify-center flex-col gap-4 p-8">
        <User className="h-16 w-16 text-zinc-300 dark:text-zinc-700" />
        <h2 className="text-xl font-bold">Not signed in</h2>
        <p className="text-zinc-500 text-center">
          Sign in to view your profile and stats
        </p>
        <Link href="/auth/login">
          <Button variant="primary" size="xl">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
            {user.username?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user.username || "Player"}</h1>
            <p className="text-sm text-zinc-500">
              {user.is_guest ? "Guest" : user.email || ""}
            </p>
          </div>
        </div>

        {user.stats && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 text-center">
              <Gamepad2 className="h-5 w-5 mx-auto mb-1 text-violet-500" />
              <div className="text-xl font-bold">{user.stats.total_games || 0}</div>
              <div className="text-xs text-zinc-500">Games</div>
            </div>
            <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 text-center">
              <Award className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
              <div className="text-xl font-bold">{user.stats.best_score || 0}</div>
              <div className="text-xs text-zinc-500">Best</div>
            </div>
            <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <div className="text-xl font-bold">{user.stats.total_correct || 0}</div>
              <div className="text-xs text-zinc-500">Correct</div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Link href="/settings">
            <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
              <Settings className="h-5 w-5 text-zinc-400" />
              <span className="font-medium">Settings</span>
            </div>
          </Link>
          <Link href="/favorites">
            <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
              <Star className="h-5 w-5 text-zinc-400" />
              <span className="font-medium">Favorites</span>
            </div>
          </Link>
          {!user.is_guest && (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-red-500"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
