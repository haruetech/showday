import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const clean = (value: unknown, max = 5000) => String(value ?? "").trim().slice(0, max);

export async function POST(request: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "공연 등록 시스템이 아직 설정되지 않았습니다." }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "등록 정보를 확인할 수 없습니다." }, { status: 400 });

  // hidden honeypot: normal users never fill this field
  if (clean(body.website, 200)) return NextResponse.json({ ok: true });

  const title = clean(body.title, 200);
  const venue = clean(body.venue, 200);
  const period = clean(body.period, 100);
  const agencyName = clean(body.agency_name, 200);
  const agencyContact = clean(body.agency_contact, 100);
  const agencyEmail = clean(body.agency_email, 200);

  if (!title || !venue || !period || !agencyName || !agencyContact || !agencyEmail) {
    return NextResponse.json({ error: "필수 항목이 비어 있습니다." }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(agencyEmail)) return NextResponse.json({ error: "이메일 주소를 확인해주세요." }, { status: 400 });
  if (!body.poster_rights_confirmed) return NextResponse.json({ error: "포스터 사용 권한 확인이 필요합니다." }, { status: 400 });
  if (!body.privacy_consent) return NextResponse.json({ error: "개인정보 수집·이용 동의가 필요합니다." }, { status: 400 });

  const { data, error } = await admin.from("manual_shows").insert({
    title,
    genre: clean(body.genre, 50) || "기타",
    venue,
    region: clean(body.region, 100),
    period,
    price_label: clean(body.price_label, 500),
    booking_url: clean(body.booking_url, 1000),
    poster_url: clean(body.poster_url, 1500),
    agency_name: agencyName,
    agency_contact: agencyContact,
    agency_email: agencyEmail,
    status: "검토중",
    show_time: clean(body.show_time, 500),
    age_label: clean(body.age_label, 100),
    synopsis: clean(body.synopsis, 10000),
    cast_info: clean(body.cast_info, 3000),
    producer: clean(body.producer, 1000),
    running_time: clean(body.running_time, 200),
    is_featured: false,
    poster_rights_confirmed: true,
    submission_source: "public-register",
    privacy_consent_at: new Date().toISOString(),
  }).select("id,status").single();

  if (error) return NextResponse.json({ error: "등록 저장에 실패했습니다. 관리자에게 문의해주세요." }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id, status: data.status });
}
