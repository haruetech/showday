"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SectionRow from "@/components/SectionRow";
import ShowCard from "@/components/ShowCard";
import ArtistCard from "@/components/ArtistCard";
import ArenaNowBanner from "@/components/ArenaNowBanner";
import AlertsPanel from "@/components/AlertsPanel";
import Footer from "@/components/Footer";
import ShowdayTrends from "@/components/ShowdayTrends";
import ShowdayNow from "@/components/ShowdayNow";
import ParentsFiftyPlusSection from "@/components/ParentsFiftyPlusSection";
import MyAreaSection from "@/components/MyAreaSection";
import SectionQuickNav from "@/components/SectionQuickNav";
import { getProfile } from "@/lib/profile";
import { getFollowedArtistIds, toggleArtistFollow } from "@/lib/favorites";
import { recommendShows, reasonLabel, ScoredShow } from "@/lib/recommend";
import { Artist, Show } from "@/types/show";

type ViewMode = "guest" | "member";

function cleanArtistName(v?:string){if(!v)return "";return v.split(/,|·|\/|\n/)[0]?.trim().slice(0,24)||""}
function dynamicArtists(shows:Show[]):Artist[]{
  const map=new Map<string,{genre:string;count:number;show:Show}>();
  for(const s of shows){const name=cleanArtistName(s.artist);if(!name||name.length<2)continue;const prev=map.get(name);map.set(name,{genre:s.genre,count:(prev?.count||0)+1,show:prev?.show||s})}
  return Array.from(map.entries()).sort((a,b)=>b[1].count-a[1].count).slice(0,10).map(([name,v],i)=>({id:`live-artist-${i}-${name}`,name,genre:v.genre,upcoming:v.count,posterFrom:"#b86a3f",posterTo:"#71331d"}));
}


export default function Home(){
  const [mode,setMode]=useState<ViewMode>("guest");
  const [recommended,setRecommended]=useState<ScoredShow[]>([]);
  const [liveToday,setLiveToday]=useState<Show[]>([]);
  const [liveUpcoming,setLiveUpcoming]=useState<Show[]>([]);
  const [livePopular,setLivePopular]=useState<Show[]>([]);
  const [popularSource,setPopularSource]=useState<"loading"|"kopis"|"none">("loading");
  const [followedArtistIds,setFollowedArtistIds]=useState<Set<string>>(new Set());
  const [showsLoading,setShowsLoading]=useState(true);

  const visibleShows=useMemo(()=>Array.from(new Map([...liveToday,...liveUpcoming,...livePopular].map(s=>[s.id,s])).values()),[liveToday,liveUpcoming,livePopular]);
  const artists=useMemo(()=>dynamicArtists(visibleShows),[visibleShows]);
  const popularDisplay=livePopular;

  useEffect(()=>{let cancelled=false;Promise.all([
    fetch("/api/kopis?type=today",{cache:"no-store"}).then(r=>r.json()),
    fetch("/api/kopis?type=upcoming",{cache:"no-store"}).then(r=>r.json()),
    fetch("/api/kopis?type=popular&rows=16",{cache:"no-store"}).then(r=>r.json()),
    fetch("/api/manual-shows",{cache:"no-store"}).then(r=>r.json()).catch(()=>({shows:[]})),
  ]).then(([todayData,upcomingData,popularData,manualData])=>{if(cancelled)return;const manualShows:Show[]=Array.isArray(manualData?.shows)?manualData.shows:[];if(Array.isArray(todayData?.shows))setLiveToday(todayData.shows);if(Array.isArray(upcomingData?.shows))setLiveUpcoming([...upcomingData.shows,...manualShows]);if(Array.isArray(popularData?.shows))setLivePopular(popularData.shows);setPopularSource(popularData?.source==="kopis-boxoffice"?"kopis":"none")}).catch(()=>{if(!cancelled)setPopularSource("none")}).finally(()=>{if(!cancelled)setShowsLoading(false)});return()=>{cancelled=true}},[]);

  useEffect(()=>{if(mode!=="member")return;let cancelled=false;getProfile().then(p=>{if(!cancelled&&p)setRecommended(recommendShows(visibleShows,p,6))});getFollowedArtistIds().then(ids=>{if(!cancelled)setFollowedArtistIds(ids)});return()=>{cancelled=true}},[mode,visibleShows]);
  async function handleToggleFollow(artistId:string){setFollowedArtistIds(prev=>{const next=new Set(prev);next.has(artistId)?next.delete(artistId):next.add(artistId);return next});await toggleArtistFollow(artistId)}

  return <><Header mode={mode} onModeChange={setMode}/><main id="shows" className="flex-1"><Hero/>
    {mode==="member"&&<SectionRow id="for-you" eyebrow="FOR YOU" title="회원님을 위한 추천" action={<a href="/onboarding" className="text-xs text-muted underline underline-offset-4 hover:text-paper">추천 설정 변경</a>}>{recommended.length?recommended.map(({show,matchedReasons})=><ShowCard key={show.id} show={show} reason={reasonLabel(matchedReasons)}/>):<p className="text-sm text-muted">{showsLoading?"조건에 맞는 공연을 찾는 중입니다.":"현재 추천 조건에 맞는 공연이 없습니다. 추천 설정을 넓혀보세요."}</p>}</SectionRow>}

    {popularSource==="kopis" && popularDisplay.length>0 && <SectionRow eyebrow="KOPIS BOX OFFICE" title="지금 실제로 많이 선택되는 공연" id="popular-now" action={<span className="text-[11px] text-muted">최근 KOPIS 박스오피스 기준</span>}>
      {popularDisplay.map(s=><ShowCard key={s.id} show={s}/>)}
    </SectionRow>}

    <ShowdayTrends shows={visibleShows} loading={showsLoading}/>
    <MyAreaSection/>
    <ShowdayNow/>

    <SectionRow eyebrow="TODAY" title="오늘 바로 볼 수 있는 공연" id="today-shows">{liveToday.length?liveToday.map(s=><ShowCard key={s.id} show={s}/>):<p className="text-sm text-muted">{showsLoading?"오늘 공연 정보를 불러오는 중입니다.":"오늘 등록된 공연이 없습니다."}</p>}</SectionRow>
    <SectionRow eyebrow="UPCOMING" title="다음 공연을 미리 확인하세요" id="upcoming-shows">{liveUpcoming.length?liveUpcoming.map(s=><ShowCard key={s.id} show={s}/>):<p className="text-sm text-muted">{showsLoading?"예정 공연 정보를 불러오는 중입니다.":"현재 등록된 예정 공연이 없습니다."}</p>}</SectionRow>

    {artists.length>0&&<SectionRow eyebrow="ARTISTS" title="보고 싶은 아티스트의 공연" id="artists" action={mode==="guest"?<span className="text-[11px] text-muted">로그인하면 관심 아티스트 저장</span>:undefined}>{artists.map(a=><ArtistCard key={a.id} artist={a} shows={visibleShows.filter(s=>cleanArtistName(s.artist)===a.name)} mode={mode} isFollowing={followedArtistIds.has(a.id)} onToggleFollow={handleToggleFollow}/>)}</SectionRow>}

    {mode==="member"&&<div id="alerts-nav" className="scroll-mt-24"><AlertsPanel/></div>}
    <ParentsFiftyPlusSection/>
    <ArenaNowBanner/>
  </main><SectionQuickNav/><Footer/></>
}
