import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  // 이 공지를 켜면, 다른 공지는 전부 끈다 (한 번에 하나만 노출).
  if (body.is_active) {
    await admin.from("site_notices").update({ is_active: false }).neq("id", id);
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of ["title", "body", "image_url", "link_url", "link_label", "is_active", "start_date", "end_date"]) {
    if (key in body) patch[key] = body[key];
  }

  const { data, error } = await admin.from("site_notices").update(patch).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notice: data });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const { id } = await params;
  const { error } = await admin.from("site_notices").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
