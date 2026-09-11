import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

const KNOWN_KEYS = [
  "kakao_channel_id",
  "business_name", "ceo_name", "business_reg_no", "mail_order_no", "address", "support_contact",
] as const;

// 공개 조회 — 카카오톡 채널 버튼, 하단 사업자 정보 등 메인 사이트가 이 값들을 가져다 씁니다.
// 민감정보가 아니라(전자상거래법상 오히려 공개해야 하는 정보) 인증 없이 열어둡니다.
export async function GET() {
  const admin = createAdminClient();
  const empty = Object.fromEntries(KNOWN_KEYS.map((k) => [k, ""]));
  if (!admin) return NextResponse.json(empty);

  const { data } = await admin.from("site_settings").select("key, value").in("key", KNOWN_KEYS);
  const result = { ...empty };
  (data || []).forEach((row) => { (result as Record<string, string>)[row.key] = row.value || ""; });
  return NextResponse.json(result);
}

// 저장 — 관리자만 가능. 보내준 항목만 부분 업데이트한다.
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const rows = KNOWN_KEYS
    .filter((k) => k in body)
    .map((k) => ({ key: k, value: String(body[k] ?? ""), updated_at: new Date().toISOString() }));

  if (rows.length === 0) return NextResponse.json({ error: "저장할 항목이 없습니다." }, { status: 400 });

  const { error } = await admin.from("site_settings").upsert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
