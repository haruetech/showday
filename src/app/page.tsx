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
import DiscoverSection from "@/components/DiscoverSection";
import {
  todayShows,
  popularShows,
  allShows,
  venues,
  artists,
} from "@/lib/dummy-data";
import { getProfile } from "@/lib/profile";
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

    return () => {
      cancelled = true;
    };
  }, [mode]);

  return (
    <>
      <Header mode={mode} onModeChange={setMode} />
      <main id="shows" className="flex-1">
        <Hero />

        <DiscoverSection />

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
          title="오늘의 공연"
          id="today-shows"
          action={kopisSource === "loading" ? <span className="text-[11px] text-muted">공연정보 불러오는 중</span> : undefined}
        >
          {liveToday.map((s) => (
            <ShowCard key={s.id} show={s} />
          ))}
        </SectionRow>

        <SectionRow
          eyebrow="UPCOMING"
          title="다가오는 공연"
          id="upcoming-shows"
        >
          {liveUpcoming.map((s) => (
            <ShowCard key={s.id} show={s} />
          ))}
        </SectionRow>

        <SectionRow
          eyebrow="WANTED ARTISTS"
          title="공연으로 만나고 싶은 아티스트"
          id="wanted-artists"
          action={<span className="text-[11px] text-muted">SHOWDAY 관심·보고싶어요 데이터로 발전 예정</span>}
        >
          {artists.map((a) => (
            <ArtistCard key={a.id} artist={a} />
          ))}
        </SectionRow>

        <SectionRow eyebrow="VENUE" title="공연장" id="venues">
          {venues.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </SectionRow>

        <ParentsFiftyPlusSection />

        {mode === "member" && <AlertsPanel />}

        <AroundSection />
        <ArenaNowBanner />
      </main>
      <Footer />
    </>
  );
}
