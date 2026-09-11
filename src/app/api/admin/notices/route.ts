import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const { data, error } = await admin.from("site_notices").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notices: data });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body?.title) return NextResponse.json({ error: "제목은 필수입니다." }, { status: 400 });

  // 새 공지를 켜는(is_active=true) 순간, 기존에 켜져 있던 다른 공지는 자동으로 끈다 (한 번에 하나만 노출).
  if (body.is_active) {
    await admin.from("site_notices").update({ is_active: false }).eq("is_active", true);
  }

  const { data, error } = await admin.from("site_notices").insert({
    title: body.title,
    body: body.body || "",
    image_url: body.image_url || "",
    link_url: body.link_url || "",
    link_label: body.link_label || "자세히 보기",
    is_active: Boolean(body.is_active),
    start_date: body.start_date || null,
    end_date: body.end_date || null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notice: data });
}
