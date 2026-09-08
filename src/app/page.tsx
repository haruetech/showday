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
import {
  todayShows,
  popularShows,
  allShows,
  venues,
  artists,
} from "@/lib/dummy-data";
import { getProfile } from "@/lib/profile";
import { recommendShows, reasonLabel, ScoredShow } from "@/lib/recommend";

type ViewMode = "guest" | "member";

// 섹션 순서: HERO(AI QUICK PICK) → FOR YOU(로그인시) → TODAY/UPCOMING →
// MY ARTISTS → VENUES → 50+(전문 카테고리) → AROUND → ARENA NOW(준비중)
export default function Home() {
  const [mode, setMode] = useState<ViewMode>("guest");
  const [recommended, setRecommended] = useState<ScoredShow[]>([]);

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

        <SectionRow eyebrow="TODAY" title="오늘의 공연" id="today-shows">
          {todayShows.map((s) => (
            <ShowCard key={s.id} show={s} />
          ))}
        </SectionRow>

        <SectionRow eyebrow="UPCOMING" title="다가오는 공연">
          {popularShows.map((s) => (
            <ShowCard key={s.id} show={s} />
          ))}
        </SectionRow>

        <SectionRow
          eyebrow="MY ARTISTS"
          title={mode === "member" ? "데모 관심 아티스트" : "인기 아티스트"}
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
