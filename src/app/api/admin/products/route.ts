import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });
  const { data, error } = await admin.from("shop_products").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data || [] });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });
  const b = await request.json().catch(() => null);
  if (!b?.title?.trim() || !b?.product_url?.trim()) return NextResponse.json({ error: "상품명과 상품 링크는 필수입니다." }, { status: 400 });
  const row = {
    title: b.title.trim(), description: (b.description || "").trim(), image_url: (b.image_url || "").trim(),
    product_url: b.product_url.trim(), price_label: (b.price_label || "").trim(), sale_label: (b.sale_label || "").trim(),
    category: (b.category || "추천상품").trim(), cta_label: (b.cta_label || "상품 보기").trim(),
    is_active: Boolean(b.is_active), is_featured: Boolean(b.is_featured), sort_order: Number(b.sort_order) || 0,
  };
  if (row.is_featured) await admin.from("shop_products").update({ is_featured: false }).eq("is_featured", true);
  const { data, error } = await admin.from("shop_products").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}
