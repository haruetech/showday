import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const { data, error } = await admin
    .from("booking_clicks")
    .select("platform, show_id, target_url, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data || [];
  const byPlatform: Record<string, number> = {};
  const byShow: Record<string, number> = {};
  rows.forEach((r) => {
    byPlatform[r.platform] = (byPlatform[r.platform] || 0) + 1;
    byShow[r.show_id] = (byShow[r.show_id] || 0) + 1;
  });

  return NextResponse.json({
    total: rows.length,
    byPlatform,
    topShows: Object.entries(byShow).sort((a, b) => b[1] - a[1]).slice(0, 10),
    recent: rows.slice(0, 30),
  });
}
