import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { pack_id, score, total_cards, duration, rounds } = body;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: session, error } = await supabase
      .from("game_sessions")
      .insert({
        pack_id,
        user_id: user.id,
        score,
        total_cards,
        duration,
        is_completed: true,
      })
      .select()
      .single();

    if (error) throw error;

    if (rounds) {
      await supabase.from("rounds").insert(
        rounds.map((r: any) => ({
          session_id: session.id,
          card_id: r.card_id,
          result: r.result,
          duration_ms: r.duration_ms,
        }))
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 }
    );
  }
}
