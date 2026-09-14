import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

const INQUIRY_TYPES = ["제휴", "광고", "기타"] as const;
const clean = (value: unknown, max = 2000) => String(value ?? "").trim().slice(0, max);

// 공개 제출 — 로그인 없이 누구나 보낼 수 있다. website(허니팟) 필드가 채워져 있으면
// 봇으로 간주해 저장 없이 200을 반환한다.
export async function POST(request: NextRequest) {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "문의 접수 시스템이 아직 설정되지 않았습니다." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "입력한 내용을 확인할 수 없습니다." }, { status: 400 });

  if (clean(body.website, 200)) return NextResponse.json({ ok: true }); // 허니팟

  const inquiryType = INQUIRY_TYPES.includes(body.inquiry_type) ? body.inquiry_type : "기타";
  const companyName = clean(body.company_name, 200);
  const contactName = clean(body.contact_name, 100);
  const contactEmail = clean(body.contact_email, 200);
  const contactPhone = clean(body.contact_phone, 50);
  const message = clean(body.message, 3000);

  if (!companyName || !contactName || !contactEmail || !message) {
    return NextResponse.json({ error: "필수 항목이 비어 있습니다." }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(contactEmail)) {
    return NextResponse.json({ error: "이메일 주소를 확인해주세요." }, { status: 400 });
  }
  if (!body.privacy_consent) {
    return NextResponse.json({ error: "개인정보 수집·이용 동의가 필요합니다." }, { status: 400 });
  }

  const { error } = await admin.from("partnership_inquiries").insert({
    inquiry_type: inquiryType,
    company_name: companyName,
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: contactPhone || null,
    message,
  });

  if (error) return NextResponse.json({ error: "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// 조회 — 관리자만 가능.
export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ inquiries: [] });

  const { data, error } = await admin
    .from("partnership_inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inquiries: data || [] });
}

// 읽음 처리 — 관리자만 가능.
export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const id = clean(body.id, 100);
  if (!id) return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });

  const { error } = await admin.from("partnership_inquiries").update({ status: "read" }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
