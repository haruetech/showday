"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import SectionRow from "@/components/show/SectionRow";
import ShowCard from "@/components/show/ShowCard";
import ArenaNowBanner from "@/components/home/ArenaNowBanner";
import Footer from "@/components/layout/Footer";
import ShowdayTrends from "@/components/home/ShowdayTrends";
import ShowdayNow from "@/components/home/ShowdayNow";
import ParentsFiftyPlusSection from "@/components/home/ParentsFiftyPlusSection";
import ShowAdPopup from "@/components/promotion/ShowAdPopup";
import MyAreaSection from "@/components/home/MyAreaSection";
import SectionQuickNav from "@/components/navigation/SectionQuickNav";
import { getProfile } from "@/lib/profile";
import { recommendShows, reasonLabel, ScoredShow } from "@/lib/recommend";
import { Show } from "@/types/show";
import InterestArtistsSection from "@/components/home/InterestArtistsSection";

type ViewMode = "guest" | "member";


export default function Home(){
  const [mode,setMode]=useState<ViewMode>("guest");
  const [recommended,setRecommended]=useState<ScoredShow[]>([]);
  const [liveToday,setLiveToday]=useState<Show[]>([]);
  const [liveUpcoming,setLiveUpcoming]=useState<Show[]>([]);
  const [livePopular,setLivePopular]=useState<Show[]>([]);
  const [popularSource,setPopularSource]=useState<"loading"|"kopis"|"none">("loading");
  const [showsLoading,setShowsLoading]=useState(true);
  const [searchActive,setSearchActive]=useState(false);

  const visibleShows=useMemo(()=>Array.from(new Map([...liveToday,...liveUpcoming,...livePopular].map(s=>[s.id,s])).values()),[liveToday,liveUpcoming,livePopular]);
  const popularDisplay=livePopular;

  useEffect(()=>{let cancelled=false;Promise.all([
    fetch("/api/kopis?type=today",{cache:"no-store"}).then(r=>r.json()),
    fetch("/api/kopis?type=upcoming",{cache:"no-store"}).then(r=>r.json()),
    fetch("/api/kopis?type=popular&rows=16",{cache:"no-store"}).then(r=>r.json()),
    fetch("/api/manual-shows",{cache:"no-store"}).then(r=>r.json()).catch(()=>({shows:[]})),
  ]).then(([todayData,upcomingData,popularData,manualData])=>{if(cancelled)return;const manualShows:Show[]=Array.isArray(manualData?.shows)?manualData.shows:[];if(Array.isArray(todayData?.shows))setLiveToday(todayData.shows);if(Array.isArray(upcomingData?.shows))setLiveUpcoming([...upcomingData.shows,...manualShows]);if(Array.isArray(popularData?.shows))setLivePopular(popularData.shows);setPopularSource(popularData?.source==="kopis-boxoffice"?"kopis":"none")}).catch(()=>{if(!cancelled)setPopularSource("none")}).finally(()=>{if(!cancelled)setShowsLoading(false)});return()=>{cancelled=true}},[]);

  useEffect(()=>{if(mode!=="member")return;let cancelled=false;getProfile().then(p=>{if(!cancelled&&p)setRecommended(recommendShows(visibleShows,p,6))});return()=>{cancelled=true}},[mode,visibleShows]);

  return <><Header mode={mode} onModeChange={setMode}/><ShowAdPopup/><main id="shows" className="flex-1"><Hero onSearchStateChange={setSearchActive}/>
    <div className={searchActive?"hidden md:block":"block"}>
    {mode==="member"&&<SectionRow id="for-you" eyebrow="FOR YOU" title="회원님을 위한 추천" action={<a href="/onboarding" className="text-xs text-muted underline underline-offset-4 hover:text-paper">추천 설정 변경</a>}>{recommended.length?recommended.map(({show,matchedReasons})=><ShowCard key={show.id} show={show} reason={reasonLabel(matchedReasons)}/>):<p className="text-sm text-muted">{showsLoading?"조건에 맞는 공연을 찾는 중입니다.":"현재 추천 조건에 맞는 공연이 없습니다. 추천 설정을 넓혀보세요."}</p>}</SectionRow>}

    {popularSource==="kopis" && popularDisplay.length>0 && <SectionRow eyebrow="KOPIS BOX OFFICE" title="지금 실제로 많이 선택되는 공연" id="popular-now" action={<span className="text-[11px] text-muted">최근 KOPIS 박스오피스 기준</span>}>
      {popularDisplay.map(s=><ShowCard key={s.id} show={s}/>)}
    </SectionRow>}

    <ShowdayTrends shows={visibleShows} loading={showsLoading}/>
    <MyAreaSection/>
    <ShowdayNow/>

    <SectionRow eyebrow="TODAY" title="오늘 바로 볼 수 있는 공연" id="today-shows">{liveToday.length?liveToday.map(s=><ShowCard key={s.id} show={s}/>):<p className="text-sm text-muted">{showsLoading?"오늘 공연 정보를 불러오는 중입니다.":"오늘 등록된 공연이 없습니다."}</p>}</SectionRow>
    <SectionRow eyebrow="UPCOMING" title="다음 공연을 미리 확인하세요" id="upcoming-shows">{liveUpcoming.length?liveUpcoming.map(s=><ShowCard key={s.id} show={s}/>):<p className="text-sm text-muted">{showsLoading?"예정 공연 정보를 불러오는 중입니다.":"현재 등록된 예정 공연이 없습니다."}</p>}</SectionRow>

    <InterestArtistsSection shows={visibleShows} mode={mode}/>

    <ParentsFiftyPlusSection/>
    <ArenaNowBanner/>
    </div>
  </main><SectionQuickNav/><Footer/></>
}
