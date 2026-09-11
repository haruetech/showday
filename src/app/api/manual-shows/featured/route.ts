import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// 우선순위: ① 관리자가 "광고 팝업으로 노출"로 지정한 게시중 공연 중 가장 최근 것
//          ② 없으면 게시중인 공연 중 가장 최근 것
//          ③ 게시중인 공연이 아예 없으면 팝업 자체를 띄우지 않음(show: null)
export async function GET() {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ show: null });

  const fields = "id, title, genre, venue, period, price_label, poster_url";

  const { data: featured } = await admin
    .from("manual_shows")
    .select(fields)
    .eq("status", "게시중")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (featured) return NextResponse.json({ show: toPopup(featured) });

  const { data: latest } = await admin
    .from("manual_shows")
    .select(fields)
    .eq("status", "게시중")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ show: latest ? toPopup(latest) : null });
}

function toPopup(row: { id: string; title: string; genre: string; venue: string; period: string; price_label: string; poster_url: string }) {
  return {
    id: `manual-${row.id}`,
    title: row.title,
    genre: row.genre,
    venue: row.venue,
    period: row.period,
    priceLabel: row.price_label || "",
    posterUrl: row.poster_url || "",
  };
}
