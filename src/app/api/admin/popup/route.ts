import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const { id } = await request.json().catch(() => ({ id: null }));

  // id가 오면 그 공연만 켜고 나머지는 전부 끈다. id가 null이면 전체 해제(자동 노출로 전환).
  const { error: clearError } = await admin.from("manual_shows").update({ is_featured: false }).neq("id", id || "00000000-0000-0000-0000-000000000000");
  if (clearError) return NextResponse.json({ error: clearError.message }, { status: 500 });

  if (id) {
    const { error } = await admin.from("manual_shows").update({ is_featured: true }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
