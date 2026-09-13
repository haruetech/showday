"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InterestArtistsSection from "@/components/home/InterestArtistsSection";
import ShowdayNow from "@/components/home/ShowdayNow";
import ArenaNowBanner from "@/components/home/ArenaNowBanner";
import ResponsiveDock from "@/components/navigation/ResponsiveDock";
import type { Show } from "@/types/show";

type ViewMode = "guest" | "member";

type NavTarget = {
  label: string;
  id?: string;
  href?: string;
};

const PAGE_NAV: NavTarget[] = [
  { label: "메인", href: "/" },
  { label: "관심 아티스트", id: "interest-artists" },
  { label: "공연 소식", id: "showday-now" },
  { label: "ARENA NOW", id: "arena-now" },
  { label: "MY SHOWDAY", href: "/my" },
];

export default function ArtistsPage() {
  const [mode, setMode] = useState<ViewMode>("guest");
  const [upcoming, setUpcoming] = useState<Show[]>([]);
  const [popular, setPopular] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/kopis?type=upcoming&rows=120", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ shows: [] })),
      fetch("/api/kopis?type=popular&rows=40", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ shows: [] })),
      fetch("/api/manual-shows", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ shows: [] })),
    ])
      .then(([u, p, m]) => {
        if (cancelled) return;
        const manual: Show[] = Array.isArray(m?.shows) ? m.shows : [];
        setUpcoming([...(Array.isArray(u?.shows) ? u.shows : []), ...manual]);
        setPopular(Array.isArray(p?.shows) ? p.shows : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const shows = useMemo(
    () => Array.from(new Map(upcoming.map((show) => [show.id, show])).values()),
    [upcoming],
  );

  return (
    <>
      <div id="artist-page-top" />
      <Header mode={mode} onModeChange={setMode} />

      <main className="min-h-screen bg-ink pb-20 lg:pb-0">
        <ArtistPageQuickNav />

        <InterestArtistsSection shows={shows} popularShows={popular} mode={mode} />

        {loading && (
          <p className="mx-auto max-w-[1180px] px-4 pb-10 text-xs text-muted sm:px-6">
            아티스트 공연 정보를 확인하는 중입니다.
          </p>
        )}

        <ShowdayNow />
        <ArenaNowBanner />
      </main>

      <Footer />
      <ResponsiveDock />
      <ScrollToTopButton />
    </>
  );
}

function ArtistPageQuickNav() {
  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="관심 아티스트 페이지 바로가기"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-line bg-ink/95 p-2 shadow-2xl backdrop-blur-xl xl:flex"
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="rounded-xl px-3 py-2.5 text-left text-[11px] font-black text-gold transition hover:bg-white/5"
      >
        ↑ 상단으로
      </button>

      {PAGE_NAV.map((item) =>
        item.href ? (
          <a
            key={item.label}
            href={item.href}
            className="rounded-xl px-3 py-2.5 text-[11px] font-bold text-muted transition hover:bg-white/5 hover:text-paper"
          >
            {item.label}
          </a>
        ) : (
          <button
            key={item.label}
            type="button"
            onClick={() => item.id && go(item.id)}
            className="rounded-xl px-3 py-2.5 text-left text-[11px] font-bold text-muted transition hover:bg-white/5 hover:text-paper"
          >
            {item.label}
          </button>
        ),
      )}
    </nav>
  );
}

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="페이지 상단으로 이동"
      className="fixed bottom-24 right-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-line bg-ink/95 text-sm font-black text-paper shadow-xl backdrop-blur transition hover:border-gold hover:text-gold lg:bottom-6 lg:right-6"
    >
      ↑
    </button>
  );
}
