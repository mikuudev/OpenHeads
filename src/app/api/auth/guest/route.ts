import { NextResponse } from "next/server";

export async function POST() {
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const guestUser = {
    id: guestId,
    username: `Player${Math.floor(Math.random() * 9000 + 1000)}`,
    email: null,
    avatar_url: null,
    is_guest: true,
    created_at: new Date().toISOString(),
    stats: {
      total_games: 0,
      total_correct: 0,
      total_skipped: 0,
      best_score: 0,
      total_played_cards: 0,
    },
  };

  const response = NextResponse.json(guestUser);
  response.cookies.set("openheads-guest", guestId, {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
