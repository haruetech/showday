"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SectionRow from "@/components/SectionRow";
import ShowCard from "@/components/ShowCard";
import VenueCard from "@/components/VenueCard";
import ArtistCard from "@/components/ArtistCard";
import ArenaNowBanner from "@/components/ArenaNowBanner";
import ParentsFiftyPlusSection from "@/components/ParentsFiftyPlusSection";
import AroundSection from "@/components/AroundSection";
import AlertsPanel from "@/components/AlertsPanel";
import Footer from "@/components/Footer";
import ShowdayTrends from "@/components/ShowdayTrends";
import {
  todayShows,
  popularShows,
  allShows,
  venues,
  artists,
} from "@/lib/dummy-data";
import { getProfile } from "@/lib/profile";
import { getFollowedArtistIds, toggleArtistFollow } from "@/lib/favorites";
import { sortArtistsByAgeBand } from "@/lib/artistAffinity";
import { recommendShows, reasonLabel, ScoredShow } from "@/lib/recommend";
import { Show } from "@/types/show";

type ViewMode = "guest" | "member";

// 섹션 순서: HERO(AI QUICK PICK) → FOR YOU(로그인시) → TODAY/UPCOMING →
// MY ARTISTS → VENUES → 50+(전문 카테고리) → AROUND → ARENA NOW(준비중)
export default function Home() {
  const [mode, setMode] = useState<ViewMode>("guest");
  const [recommended, setRecommended] = useState<ScoredShow[]>([]);
  const [liveToday, setLiveToday] = useState<Show[]>(todayShows);
  const [liveUpcoming, setLiveUpcoming] = useState<Show[]>(popularShows);
  const [kopisSource, setKopisSource] = useState<"loading" | "kopis" | "dummy">("loading");
  const [followedArtistIds, setFollowedArtistIds] = useState<Set<string>>(new Set());
  const [orderedArtists, setOrderedArtists] = useState(artists);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/kopis?type=today", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/kopis?type=upcoming", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([todayData, upcomingData]) => {
        if (cancelled) return;
        if (Array.isArray(todayData?.shows)) setLiveToday(todayData.shows);
        if (Array.isArray(upcomingData?.shows)) setLiveUpcoming(upcomingData.shows);
        setKopisSource(todayData?.source === "kopis" || upcomingData?.source === "kopis" ? "kopis" : "dummy");
      })
      .catch(() => {
        if (!cancelled) setKopisSource("dummy");
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (mode !== "member") return;
    let cancelled = false;

    getProfile().then((p) => {
      if (cancelled) return;
      if (p) setRecommended(recommendShows(allShows, p, 6));
    });

    getFollowedArtistIds().then((ids) => {
      if (!cancelled) setFollowedArtistIds(ids);
    });

    return () => {
      cancelled = true;
    };
  }, [mode]);

  useEffect(() => {
    // 연령대는 첫 화면 아티스트 "순서"만 바꾸는 초기값으로 쓴다 — 목록을 걸러내지 않는다.
    let cancelled = false;
    getProfile().then((p) => {
      if (cancelled) return;
      setOrderedArtists(p ? sortArtistsByAgeBand(artists, p.ageBand) : artists);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggleFollow(artistId: string) {
    // 낙관적 업데이트 — 실패해도 눈에 띄는 지연 없이 바로 반응
    setFollowedArtistIds((prev) => {
      const next = new Set(prev);
      if (next.has(artistId)) next.delete(artistId);
      else next.add(artistId);
      return next;
    });
    await toggleArtistFollow(artistId);
  }

  return (
    <>
      <Header mode={mode} onModeChange={setMode} />
      <main id="shows" className="flex-1">
        <Hero />

        {mode === "member" && (
          <SectionRow
            eyebrow="FOR YOU"
            title="회원님을 위한 추천"
            action={
              <a
                href="/onboarding"
                className="text-xs text-muted underline underline-offset-4 hover:text-paper"
              >
                추천 설정 변경
              </a>
            }
          >
            {recommended.length > 0 ? (
              recommended.map(({ show, matchedReasons }) => (
                <ShowCard key={show.id} show={show} reason={reasonLabel(matchedReasons)} />
              ))
            ) : (
              <p className="text-sm text-muted">
                조건에 맞는 공연을 찾는 중입니다. 추천 설정을 확인해보세요.
              </p>
            )}
          </SectionRow>
        )}

        <SectionRow
          eyebrow="TODAY"
          title="오늘 바로 볼 수 있는 공연"
          id="popular-now"
          action={kopisSource === "loading" ? <span className="text-[11px] text-muted">공연정보 불러오는 중</span> : undefined}
        >
          {liveToday.map((s) => (
            <ShowCard key={s.id} show={s} />
          ))}
        </SectionRow>

        <SectionRow
          eyebrow="UPCOMING"
          title="곧 만나요 · 예정 공연"
          
        >
          {liveUpcoming.map((s) => (
            <ShowCard key={s.id} show={s} />
          ))}
        </SectionRow>

        <SectionRow
          eyebrow="MY ARTISTS"
          title="좋아하는 아티스트의 다음 공연"
          action={
            mode === "guest" ? (
              <span className="text-[11px] text-muted">로그인하면 ♡ 저장돼요</span>
            ) : undefined
          }
        >
          {orderedArtists.map((a) => (
            <ArtistCard
              key={a.id}
              artist={a}
              mode={mode}
              isFollowing={followedArtistIds.has(a.id)}
              onToggleFollow={handleToggleFollow}
            />
          ))}
        </SectionRow>

        <SectionRow eyebrow="VENUE" title="어디에서 볼까? · 주요 공연장" id="venues">
          {venues.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </SectionRow>

        <ShowdayTrends />

        <ParentsFiftyPlusSection />

        {mode === "member" && <AlertsPanel />}

        <AroundSection />
        <ArenaNowBanner />
      </main>
      <Footer />
    </>
  );
}
