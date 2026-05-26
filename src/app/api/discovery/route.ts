import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");

    let dbQuery = supabase
      .from("packs")
      .select("id, title, description, category, cards_count, plays_count, author:author_id(id, username)")
      .eq("visibility", "public");

    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (category) {
      dbQuery = dbQuery.eq("category", category);
    }

    const { data, error } = await dbQuery
      .order("plays_count", { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json({ packs: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
