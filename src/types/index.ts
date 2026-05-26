export interface User {
  id: string;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  is_guest: boolean;
  stats: UserStats;
}

export interface UserStats {
  total_games: number;
  total_correct: number;
  total_skipped: number;
  best_score: number;
  total_played_cards: number;
}

export interface Pack {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  category: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  language: string;
  tags: string[];
  visibility: "public" | "private" | "unlisted";
  author_id: string;
  author: Pick<User, "id" | "username" | "avatar_url">;
  favorites_count: number;
  plays_count: number;
  cards_count: number;
  created_at: string;
  updated_at: string;
  is_favorited?: boolean;
}

export interface Card {
  id: string;
  pack_id: string;
  text: string;
  image_url: string | null;
  gif_url: string | null;
  aliases: string[];
  order: number;
  created_at: string;
}

export interface GameSession {
  id: string;
  pack_id: string;
  user_id: string | null;
  score: number;
  total_cards: number;
  duration: number;
  is_completed: boolean;
  created_at: string;
}

export interface Round {
  id: string;
  session_id: string;
  card_id: string;
  card: Card;
  result: "correct" | "skipped" | "timeout";
  duration_ms: number;
  created_at: string;
}

export interface Room {
  id: string;
  code: string;
  host_id: string;
  pack_id: string;
  status: "waiting" | "playing" | "ended";
  players: RoomPlayer[];
  created_at: string;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  user_id: string | null;
  username: string;
  score: number;
  is_host: boolean;
  joined_at: string;
}

export interface Report {
  id: string;
  pack_id: string;
  reporter_id: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
}
