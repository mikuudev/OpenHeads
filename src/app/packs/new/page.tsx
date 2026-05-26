"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Reorder } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageTransition, FadeIn } from "@/components/ui/animations";
import {
  ChevronLeft,
  Plus,
  Trash2,
  GripVertical,
  Image,
  Film,
  Upload,
  Save,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface CardInput {
  id: string;
  text: string;
  image_url: string;
  gif_url: string;
  aliases: string;
}

export default function CreatePackPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [visibility, setVisibility] = useState<"public" | "private" | "unlisted">("public");
  const [coverUrl, setCoverUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [cards, setCards] = useState<CardInput[]>([
    { id: "1", text: "", image_url: "", gif_url: "", aliases: "" },
    { id: "2", text: "", image_url: "", gif_url: "", aliases: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [showCsvImport, setShowCsvImport] = useState(false);

  const addCard = () => {
    const id = String(Date.now());
    setCards([...cards, { id, text: "", image_url: "", gif_url: "", aliases: "" }]);
  };

  const removeCard = (id: string) => {
    if (cards.length <= 1) return;
    setCards(cards.filter((c) => c.id !== id));
  };

  const updateCard = (id: string, field: keyof CardInput, value: string) => {
    setCards(cards.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleCsvImport = () => {
    const lines = csvText.split("\n").filter((l) => l.trim());
    const imported = lines.map((line, i) => {
      const parts = line.split(",");
      return {
        id: String(Date.now() + i),
        text: parts[0]?.trim() || "",
        image_url: parts[1]?.trim() || "",
        gif_url: parts[2]?.trim() || "",
        aliases: parts[3]?.trim() || "",
      };
    });
    setCards([...cards, ...imported]);
    setCsvText("");
    setShowCsvImport(false);
    toast.success(`Imported ${imported.length} cards`);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Pack needs a title");
      return;
    }
    const validCards = cards.filter((c) => c.text.trim());
    if (validCards.length === 0) {
      toast.error("Add at least one card");
      return;
    }

    setSaving(true);

    try {
      const id = typeof crypto?.randomUUID === "function"
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
          });

      const packData = {
        id,
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        difficulty,
        cover_url: coverUrl.trim() || null,
        tags,
        visibility,
        author_id: user?.id || id,
        language: "en",
        cards_count: validCards.length,
      };

      const { error: packError } = await supabase.from("packs").insert(packData);

      if (packError) {
        console.error("Pack insert error:", packError);
        toast.error(packError.message || "Failed to create pack");
        setSaving(false);
        return;
      }

      const cardInserts = validCards.map((card, i) => ({
        pack_id: id,
        text: card.text.trim(),
        image_url: card.image_url.trim() || null,
        gif_url: card.gif_url.trim() || null,
        aliases: card.aliases
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        order: i,
      }));

      const { error: cardsError } = await supabase.from("cards").insert(cardInserts);

      if (cardsError) {
        console.error("Cards insert error:", cardsError);
        toast.error(cardsError.message || "Failed to save cards");
        setSaving(false);
        return;
      }

      toast.success("Pack created!");
      router.push(`/packs/${id}`);
    } catch (e: any) {
      console.error("Save error:", e);
      toast.error(e?.message || "Something went wrong");
      setSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 pt-6 pb-32">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1 mb-4">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </Link>

        <h1 className="text-2xl font-bold mb-6">Create Pack</h1>

        <FadeIn>
          <div className="space-y-4 mb-8">
            <Input
              label="Title"
              placeholder="My Awesome Pack"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              label="Description"
              placeholder="What's this pack about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Input
              label="Category"
              placeholder="Funny, Movies, Animals..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <Input
              label="Cover Image URL"
              placeholder="https://example.com/image.jpg"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Difficulty</label>
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 h-10 rounded-xl text-sm font-medium transition-all ${
                      difficulty === d
                        ? "bg-violet-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Visibility</label>
              <div className="flex gap-2">
                {(["public", "unlisted", "private"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVisibility(v)}
                    className={`flex-1 h-10 rounded-xl text-sm font-medium transition-all ${
                      visibility === v
                        ? "bg-violet-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button variant="secondary" size="icon" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Cards ({cards.filter(c => c.text.trim()).length})</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowCsvImport(!showCsvImport)}>
              <Upload className="h-4 w-4 mr-1" /> CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={addCard}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>

        {showCsvImport && (
          <FadeIn>
            <div className="mb-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <Textarea
                label="Paste CSV (text,image_url,gif_url,aliases)"
                placeholder={`word1,https://...,https://...,alias1 alias2\nword2,,,`}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
              />
              <Button variant="primary" size="sm" className="mt-2" onClick={handleCsvImport}>
                Import
              </Button>
            </div>
          </FadeIn>
        )}

        <div className="space-y-3">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <GripVertical className="h-4 w-4 text-zinc-400 shrink-0 cursor-grab" />
                <span className="text-xs font-mono text-zinc-400">#{i + 1}</span>
                <div className="flex-1" />
                <button
                  onClick={() => removeCard(card.id)}
                  className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Card text"
                  value={card.text}
                  onChange={(e) => updateCard(card.id, "text", e.target.value)}
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Image URL (optional)"
                      value={card.image_url}
                      onChange={(e) => updateCard(card.id, "image_url", e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="GIF URL (optional)"
                      value={card.gif_url}
                      onChange={(e) => updateCard(card.id, "gif_url", e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
                <Input
                  placeholder="Aliases (comma separated)"
                  value={card.aliases}
                  onChange={(e) => updateCard(card.id, "aliases", e.target.value)}
                  className="text-xs"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <Button
          variant="primary"
          size="xl"
          className="w-full text-base mt-6 gap-2"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-5 w-5" /> {saving ? "Saving..." : "Save Pack"}
        </Button>
      </div>
    </PageTransition>
  );
}
