import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };
export async function PATCH(request: NextRequest, { params }: Ctx) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient(); if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });
  const { id } = await params; const b = await request.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  const row = { ...b, updated_at: new Date().toISOString() };
  delete row.id; delete row.created_at;
  if (row.is_featured) await admin.from("shop_products").update({ is_featured: false }).neq("id", id);
  const { data, error } = await admin.from("shop_products").update(row).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient(); if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });
  const { id } = await params; const { error } = await admin.from("shop_products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
