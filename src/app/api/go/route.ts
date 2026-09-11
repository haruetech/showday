import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// 예매처로 나가는 클릭을 한 번 거쳐가게 하는 중계 엔드포인트.
// - 지금 당장은 제휴 계약이 없어 원본 URL로 그대로 302 리다이렉트만 한다.
// - 다만 여기를 한 번 거치도록 해두면, 나중에 실제 제휴가 성사됐을 때
//   (1) affiliateLinks.ts의 wrap 함수만 채워 넣으면 URL이 자동으로 추적 링크로 바뀌고
//   (2) 지금부터 쌓이는 클릭 로그(booking_clicks 테이블 → /admin/clicks에서 확인 가능)가
//       "SHOWDAY에서 실제로 예매처로 몇 번 연결됐는지" 협상 근거 자료가 된다.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const to = searchParams.get("to");
  const platform = searchParams.get("platform") || "unknown";
  const showId = searchParams.get("show") || "";

  if (!to) return NextResponse.redirect(origin);

  let target: string;
  try {
    target = decodeURIComponent(to);
    new URL(target); // 유효한 URL인지만 확인 (실패하면 catch로 감)
  } catch {
    return NextResponse.redirect(origin);
  }

  // DB 기록은 리다이렉트를 늦추지 않도록 실패해도 무시한다.
  try {
    const admin = createAdminClient();
    if (admin) {
      await admin.from("booking_clicks").insert({ platform, show_id: showId, target_url: target });
    }
  } catch {
    // 기록 실패는 사용자 경험에 영향 주지 않도록 조용히 무시
  }

  return NextResponse.redirect(target, { status: 302 });
}
