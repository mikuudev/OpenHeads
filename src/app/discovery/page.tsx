"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/animations";
import { Search, TrendingUp, Clock, Flame, Sparkles, Grid3X3 } from "lucide-react";
import type { Pack } from "@/types";
import { cn } from "@/lib/utils";

const categories = [
  "All", "Funny", "Movies", "Animals", "Food", "Music", "Sports", "Celebrities", "Custom"
];

export default function DiscoveryPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"trending" | "newest" | "popular">("trending");

  useEffect(() => {
    const fetchPacks = async () => {
      setLoading(true);
      let query = supabase
        .from("packs")
        .select("*, author:author_id(id, username, avatar_url)")
        .eq("visibility", "public");

      if (category !== "All") {
        query = query.eq("category", category.toLowerCase());
      }

      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      if (sort === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (sort === "popular") {
        query = query.order("plays_count", { ascending: false });
      } else {
        query = query.order("plays_count", { ascending: false });
      }

      const { data } = await query.limit(50);
      setPacks((data || []) as Pack[]);
      setLoading(false);
    };

    fetchPacks();
  }, [category, sort, search]);

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Discover</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Find your next game
          </p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search packs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
                category === cat
                  ? "bg-violet-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-6">
          {(["trending", "newest", "popular"] as const).map((s) => (
            <Button
              key={s}
              variant={sort === s ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSort(s)}
              className="gap-1.5"
            >
              {s === "trending" && <Flame className="h-3.5 w-3.5" />}
              {s === "newest" && <Clock className="h-3.5 w-3.5" />}
              {s === "popular" && <TrendingUp className="h-3.5 w-3.5" />}
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] rounded-2xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : packs.length === 0 ? (
          <div className="text-center py-20">
            <Grid3X3 className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
              {search ? "No packs found" : "No packs yet"}
            </p>
            <Link href="/packs/new">
              <Button variant="primary" className="mt-4">
                Create the first pack
              </Button>
            </Link>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {packs.map((pack) => (
              <StaggerItem key={pack.id}>
                <Link href={`/packs/${pack.id}`}>
                  <div className="group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 hover:shadow-lg hover:border-violet-500/50 hover:-translate-y-0.5">
                    <div className="aspect-[3/4] bg-gradient-to-br from-violet-600/20 to-purple-600/20 relative overflow-hidden">
                      {pack.cover_url ? (
                        <img
                          src={pack.cover_url}
                          alt={pack.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="h-10 w-10 text-violet-400/50" />
                        </div>
                      )}
                      {pack.difficulty && (
                        <Badge
                          variant={
                            pack.difficulty === "easy"
                              ? "success"
                              : pack.difficulty === "medium"
                              ? "warning"
                              : "danger"
                          }
                          className="absolute top-2 right-2"
                        >
                          {pack.difficulty}
                        </Badge>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm truncate">{pack.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {pack.author?.username || "Anonymous"}
                        </span>
                        {pack.cards_count > 0 && (
                          <span className="text-xs text-zinc-400">
                            {pack.cards_count} cards
                          </span>
                        )}
                      </div>
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
