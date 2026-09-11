import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({
      error: "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. Vercel 환경변수에 추가해주세요.",
    }, { status: 500 });
  }

  const [{ count: memberCount }, { count: showCount }, { count: clickCount }, { data: recentClicks }] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("manual_shows").select("id", { count: "exact", head: true }),
    admin.from("booking_clicks").select("id", { count: "exact", head: true }),
    admin.from("booking_clicks").select("platform, show_id, created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  // 최근 7일간 일자별 클릭 수 (간단 집계)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: weekClicks } = await admin
    .from("booking_clicks")
    .select("created_at")
    .gte("created_at", sevenDaysAgo.toISOString());

  const byDay: Record<string, number> = {};
  (weekClicks || []).forEach((row) => {
    const day = new Date(row.created_at).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  });

  return NextResponse.json({
    memberCount: memberCount ?? 0,
    showCount: showCount ?? 0,
    clickCount: clickCount ?? 0,
    recentClicks: recentClicks ?? [],
    clicksByDay: byDay,
  });
}
