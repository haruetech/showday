"use client";

import { createClient } from "@/lib/supabase/client";

export const isAuthConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function signInWithKakao() {
  const supabase = createClient();
  if (!supabase) {
    alert(
      "Supabase 연동이 아직 설정되지 않았습니다. .env.local에 Supabase URL/키를 입력하고, Supabase 대시보드에서 Kakao 로그인을 활성화해주세요."
    );
    return;
  }

  await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
    },
  });
}

export async function signOut() {
  const supabase = createClient();
  if (!supabase) return;
  await supabase.auth.signOut();
  window.location.reload();
}
