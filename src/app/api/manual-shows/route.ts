import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Show } from "@/types/show";

// 관리자 화면에서 '게시중'으로 승인한 공연만 공개 노출한다.
// service_role 키로 조회하지만(관리자 전용 테이블이라 RLS에 공개 정책이 없음),
// 여기서는 노출에 필요한 필드만 선택해서 내려주고 기획사 연락처(agency_contact)는 절대 포함하지 않는다.
export async function GET(request: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ shows: [] });

  const id = request.nextUrl.searchParams.get("id");

  // 상세페이지에서 단일 공연 조회 (id는 manual_shows.id 원본 uuid, "manual-" 접두사는 호출부에서 이미 제거됨)
  if (id) {
    const { data, error } = await admin
      .from("manual_shows")
      .select("id, title, genre, venue, region, period, price_label, booking_url, poster_url")
      .eq("id", id)
      .eq("status", "게시중")
      .maybeSingle();
    if (error || !data) return NextResponse.json({ detail: null, ended: true });
    return NextResponse.json({
      ended: false,
      detail: {
        id: `manual-${data.id}`,
        title: data.title,
        genre: data.genre || "기타",
        venue: data.venue,
        period: data.period,
        timeGuide: "정확한 회차·시간은 예매처에서 확인해주세요.",
        cast: "",
        crew: "",
        producer: "",
        synopsis: "공연 소개 정보가 등록되면 SHOWDAY에서 바로 확인할 수 있습니다.",
        posterUrl: data.poster_url || undefined,
        priceLabel: data.price_label || "가격 확인 필요",
        priceGuide: data.price_label || "",
        ageLabel: "전체관람가",
        runningTime: "상세페이지 확인",
        status: "공연예정",
        bookingUrl: data.booking_url || undefined,
      },
    });
  }

  const { data, error } = await admin
    .from("manual_shows")
    .select("id, title, genre, venue, region, period, price_label, booking_url, poster_url, agency_name")
    .eq("status", "게시중")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ shows: [] });

  const shows: Show[] = (data || []).map((row) => {
    const districtMatch = row.region?.match(/([가-힣]+구)/);
    const priceNum = Number((row.price_label || "").replace(/[^0-9]/g, ""));
    return {
      id: `manual-${row.id}`,
      title: row.title,
      genre: row.genre || "기타",
      venue: row.venue,
      region: row.region || "",
      district: districtMatch?.[1] || "",
      dayOfWeek: "토",
      distanceFromDobongKm: 0,
      dateLabel: row.period,
      priceLabel: row.price_label || "가격 확인 필요",
      priceValue: Number.isFinite(priceNum) ? priceNum : 0,
      ageLabel: "전체관람가",
      runningTime: "상세페이지 확인",
      tags: [],
      posterFrom: "#b86a3f",
      posterTo: "#71331d",
      posterUrl: row.poster_url || undefined,
      bookingUrl: row.booking_url || undefined,
      status: "공연예정",
    };
  });

  return NextResponse.json({ shows });
}
