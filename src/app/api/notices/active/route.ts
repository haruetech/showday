import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ notice: null });

  const { data } = await admin
    .from("site_notices")
    .select("id, title, body, image_url, link_url, link_label, start_date, end_date")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return NextResponse.json({ notice: null });

  const todayStr = new Date().toISOString().slice(0, 10);
  if (data.start_date && todayStr < data.start_date) return NextResponse.json({ notice: null });
  if (data.end_date && todayStr > data.end_date) return NextResponse.json({ notice: null });

  return NextResponse.json({ notice: data });
}
