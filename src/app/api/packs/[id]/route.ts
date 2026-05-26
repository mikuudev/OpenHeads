import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: pack, error } = await supabase
      .from("packs")
      .select("*, author:author_id(id, username, avatar_url)")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    const { data: cards } = await supabase
      .from("cards")
      .select("*")
      .eq("pack_id", id)
      .order("order", { ascending: true });

    return NextResponse.json({ ...pack, cards });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch pack" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase.from("packs").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete pack" },
      { status: 500 }
    );
  }
}
