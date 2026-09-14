import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ products: [] });
  const { data, error } = await admin
    .from("shop_products")
    .select("id,title,description,image_url,product_url,price_label,sale_label,category,cta_label,is_featured,sort_order")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) return NextResponse.json({ products: [] });
  return NextResponse.json({ products: data || [] }, { headers: { "Cache-Control": "no-store" } });
}
