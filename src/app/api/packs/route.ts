import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("packs")
      .select("*, author:author_id(id, username, avatar_url)")
      .eq("visibility", "public");

    if (category && category !== "all") {
      query = query.eq("category", category.toLowerCase());
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    if (sort === "popular") {
      query = query.order("plays_count", { ascending: false });
    } else if (sort === "trending") {
      query = query.order("plays_count", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ packs: data, count });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch packs" },
      { status: 500 }
    );
  }
}
