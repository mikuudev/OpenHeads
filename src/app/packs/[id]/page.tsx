"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/ui/animations";
import {
  Play,
  Heart,
  Share2,
  ChevronLeft,
  Clock,
  Users,
  FileText,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { Pack, Card } from "@/types";

export default function PackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [pack, setPack] = useState<Pack | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [duration, setDuration] = useState(60);

  const packId = params.id as string;

  useEffect(() => {
    const fetchPack = async () => {
      const { data: packData } = await supabase
        .from("packs")
        .select("*, author:author_id(id, username, avatar_url)")
        .eq("id", packId)
        .single();

      if (packData) {
        setPack(packData as Pack);

        const { data: cardsData } = await supabase
          .from("cards")
          .select("*")
          .eq("pack_id", packId)
          .order("order", { ascending: true });

        setCards((cardsData || []) as Card[]);

        if (user && !user.is_guest) {
          const { data: fav } = await supabase
            .from("favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("pack_id", packId)
            .single();

          setIsFavorited(!!fav);
        }
      }
      setLoading(false);
    };

    fetchPack();
  }, [packId, user]);

  const toggleFavorite = async () => {
    if (!user || user.is_guest) {
      toast.error("Sign in to favorite packs");
      return;
    }

    if (isFavorited) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("pack_id", packId);
      setIsFavorited(false);
      toast.success("Removed from favorites");
    } else {
      await supabase.from("favorites").insert({
        user_id: user.id,
        pack_id: packId,
      });
      setIsFavorited(true);
      toast.success("Added to favorites");
    }
  };

  const handlePlay = () => {
    router.push(`/game?pack=${packId}&duration=${duration}`);
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6">
        <Skeleton className="h-8 w-24 mb-4" />
        <Skeleton className="aspect-[3/4] rounded-2xl mb-4" />
        <Skeleton className="h-8 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="min-h-dvh flex items-center justify-center flex-col gap-4">
        <p className="text-zinc-500 text-lg">Pack not found</p>
        <Link href="/discovery">
          <Button variant="primary">Browse packs</Button>
        </Link>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 pt-6 pb-32">
        <Link href="/discovery">
          <Button variant="ghost" size="sm" className="gap-1 mb-4">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 mb-6"
        >
          <div className="aspect-[3/4] bg-gradient-to-br from-violet-600/20 to-purple-600/20 flex items-center justify-center">
            {pack.cover_url ? (
              <img
                src={pack.cover_url}
                alt={pack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Sparkles className="h-20 w-20 text-violet-400/30" />
            )}
          </div>
          <div className="p-6">
            <Badge variant={pack.difficulty === "easy" ? "success" : pack.difficulty === "medium" ? "warning" : "danger"}>
              {pack.difficulty || "mixed"}
            </Badge>
            <h1 className="text-2xl font-bold mt-3 mb-1">{pack.title}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              by {pack.author?.username || "Anonymous"}
            </p>
            {pack.description && (
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4 leading-relaxed">
                {pack.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-zinc-400 mb-6">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" /> {cards.length} cards
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> {pack.plays_count || 0} plays
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" /> {pack.favorites_count || 0}
              </span>
            </div>

            <div className="flex gap-2 mb-4">
              <Button variant="ghost" size="icon" onClick={toggleFavorite}>
                <Heart
                  className={`h-5 w-5 ${
                    isFavorited ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                toast.success("Link copied!");
              }}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="mb-6">
          <label className="text-sm font-medium text-zinc-400 mb-2 block">
            Round Duration
          </label>
          <div className="flex gap-2">
            {[30, 60, 90, 120].map((sec) => (
              <button
                key={sec}
                onClick={() => setDuration(sec)}
                className={`flex-1 h-12 rounded-xl text-sm font-medium transition-all ${
                  duration === sec
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {sec < 60 ? `${sec}s` : `${sec / 60}m`}
              </button>
            ))}
          </div>
        </div>

        {cards.length > 0 && (
          <>
            <h3 className="font-semibold mb-3">Cards ({cards.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cards.slice(0, 20).map((card, i) => (
                <div
                  key={card.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <span className="text-xs font-mono text-zinc-400 w-6">
                    {i + 1}
                  </span>
                  <span className="text-sm truncate flex-1">{card.text}</span>
                  {card.image_url && <span className="text-xs text-zinc-400">📷</span>}
                  {card.gif_url && <span className="text-xs text-zinc-400">🎬</span>}
                </div>
              ))}
              {cards.length > 20 && (
                <p className="text-center text-sm text-zinc-400 pt-2">
                  +{cards.length - 20} more
                </p>
              )}
            </div>
          </>
        )}

        <Button
          variant="primary"
          size="xl"
          className="w-full text-base mt-6 gap-2"
          onClick={handlePlay}
        >
          <Play className="h-5 w-5 fill-current" /> Start Game
        </Button>
      </div>
    </PageTransition>
  );
}
