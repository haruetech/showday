"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isAuthConfigured, signInWithKakao, signOut } from "@/lib/auth";
import { getProfile } from "@/lib/profile";

type ViewMode = "guest" | "member";

export default function Header({
  mode = "guest",
  onModeChange = () => {},
}: {
  mode?: ViewMode;
  onModeChange?: (m: ViewMode) => void;
} = {}) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthConfigured) return;
    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user ?? null);
      if (data.user) {
        onModeChange("member");
        const profile = await getProfile();
        if (!profile) router.push("/onboarding");
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      onModeChange(session?.user ? "member" : "guest");
      if (session?.user) {
        getProfile().then((profile) => {
          if (!profile) router.push("/onboarding");
        });
      }
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nickname =
    (user?.user_metadata?.name as string | undefined) ??
    (user?.user_metadata?.full_name as string | undefined) ??
    "회원님";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4">
        <a href="/" className="flex items-baseline gap-1" aria-label="SHOWDAY 홈">
          <span className="font-display font-bold text-[21px] tracking-tight text-paper sm:text-2xl">SHOWDAY</span>
          <span className="hidden text-xs text-muted sm:inline">공연비서</span>
        </a>

        <nav className="hidden items-center gap-4 text-sm text-muted lg:flex xl:gap-6">
          <a href="/#show-search" className="hover:text-paper">공연 찾기</a>
          <a href="/#my-area" className="hover:text-paper">내 주변</a>
          <a href="/#popular-now" className="hover:text-paper">인기 공연</a>
          <a href="/#artists" className="hover:text-paper">아티스트</a>
          <a href="/#genre-discovery" className="hover:text-paper">장르별 공연</a>
        </nav>

        {user ? (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted">{nickname}님</span>
            <button
              onClick={signOut}
              className="rounded-full border border-line px-3 py-1.5 text-muted transition-colors hover:border-gold hover:text-paper"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            onClick={() => signInWithKakao()}
            aria-label="카카오로 로그인"
            className="flex min-h-10 items-center gap-2 rounded-full bg-[#FEE500] px-3.5 py-2 text-[11px] font-black text-[#191600] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:px-4 sm:text-xs"
          >
            <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full bg-[#191600] text-[10px] font-black text-[#FEE500]">K</span>
            <span className="sm:hidden">카카오 로그인</span>
            <span className="hidden sm:inline">카카오로 로그인</span>
          </button>
        )}
      </div>
    </header>
  );
}
