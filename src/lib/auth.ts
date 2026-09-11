"use client";

import { createClient } from "@/lib/supabase/client";

export const isAuthConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function signInWithKakao(nextPath?: string) {
  const supabase = createClient();
  if (!supabase) {
    alert("현재 카카오 로그인을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  // 이전에는 로그인할 때마다 무조건 /onboarding으로 보냈는데, 그러면 이미 추천
  // 설정을 마친 회원도 로그인할 때마다 다시 온보딩 화면을 보게 되는 문제가 있었다.
  // 이제는 원래 있던 페이지로 돌아가고, 프로필이 없는 최초 가입자만 Header.tsx의
  // 로그인 후 체크 로직에서 /onboarding으로 안내한다.
  const next = nextPath ?? `${window.location.pathname}${window.location.search}`;

  await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
}

export async function signOut() {
  const supabase = createClient();
  if (!supabase) return;
  await supabase.auth.signOut();
  window.location.reload();
}
