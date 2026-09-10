"use client";

import { createClient } from "@/lib/supabase/client";

export const isAuthConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function signInWithKakao() {
  const supabase = createClient();
  if (!supabase) {
    alert("현재 카카오 로그인을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.");
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
