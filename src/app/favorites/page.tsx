"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/animations";
import { Heart, ArrowLeft } from "lucide-react";
import type { Pack } from "@/types";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || user.is_guest) {
        setLoading(false);
        return;
      }

      const { data: favs } = await supabase
        .from("favorites")
        .select("pack:packs(*, author:author_id(id, username, avatar_url))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (favs) {
        setPacks(favs.map((f: any) => ({ ...f.pack, is_favorited: true })) as Pack[]);
      }
      setLoading(false);
    };

    fetchFavorites();
  }, [user]);

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Favorites</h1>
          <p className="text-sm text-zinc-500 mt-1">Your saved packs</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : packs.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-2">
              {!user || user.is_guest
                ? "Sign in to favorite packs"
                : "No favorites yet"}
            </p>
            <Link href="/discovery">
              <Button variant="primary">Discover packs</Button>
            </Link>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-2 gap-4">
            {packs.map((pack) => (
              <StaggerItem key={pack.id}>
                <Link href={`/packs/${pack.id}`}>
                  <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div className="aspect-[3/4] bg-gradient-to-br from-violet-600/20 to-purple-600/20 flex items-center justify-center">
                      {pack.cover_url ? (
                        <img src={pack.cover_url} alt={pack.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <Heart className="h-10 w-10 text-red-400/50" />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm truncate">{pack.title}</h3>
                      <p className="text-xs text-zinc-500">{pack.author?.username || "Anonymous"}</p>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </PageTransition>
  );
}
