import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 카카오 로그인 후 Supabase가 이 주소로 돌려보냅니다 (?code=...).
// Supabase 대시보드 > Authentication > URL Configuration의
// "Redirect URLs"에 {사이트주소}/auth/callback 을 등록해야 합니다.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}
