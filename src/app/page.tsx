"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SectionRow from "@/components/SectionRow";
import ShowCard from "@/components/ShowCard";
import VenueCard from "@/components/VenueCard";
import ArtistCard from "@/components/ArtistCard";
import ArenaNowBanner from "@/components/ArenaNowBanner";
import ParentsFiftyPlusSection from "@/components/ParentsFiftyPlusSection";
import AlertsPanel from "@/components/AlertsPanel";
import Footer from "@/components/Footer";
import ShowdayTrends from "@/components/ShowdayTrends";
import ShowdayNow from "@/components/ShowdayNow";
import { todayShows, popularShows, allShows } from "@/lib/dummy-data";
import { getProfile } from "@/lib/profile";
import { getFollowedArtistIds, toggleArtistFollow } from "@/lib/favorites";
import { recommendShows, reasonLabel, ScoredShow } from "@/lib/recommend";
import { Artist, Show, Venue } from "@/types/show";

type ViewMode = "guest" | "member";

const venueImageMap: Record<string,string> = {
  "서울아레나":"/venues/seoul-arena.svg","KSPO DOME":"/venues/kspo.svg","고척스카이돔":"/venues/고척.svg","인스파이어 아레나":"/venues/inspire.svg","세종문화회관":"/venues/세종.svg","예술의전당":"/venues/arts-center.svg",
};
function venueImage(name:string){const key=Object.keys(venueImageMap).find(k=>name.includes(k)||k.includes(name));return key?venueImageMap[key]:"/venue-default.svg"}
function cleanArtistName(v?:string){if(!v)return "";return v.split(/,|·|\/|\n/)[0]?.trim().slice(0,24)||""}
function dynamicArtists(shows:Show[]):Artist[]{
  const map=new Map<string,{genre:string;count:number;show:Show}>();
  for(const s of shows){const name=cleanArtistName(s.artist);if(!name||name.length<2)continue;const prev=map.get(name);map.set(name,{genre:s.genre,count:(prev?.count||0)+1,show:prev?.show||s})}
  return Array.from(map.entries()).sort((a,b)=>b[1].count-a[1].count).slice(0,10).map(([name,v],i)=>({id:`live-artist-${i}-${name}`,name,genre:v.genre,upcoming:v.count,posterFrom:"#b86a3f",posterTo:"#71331d"}));
}
function dynamicVenues(shows:Show[]):Venue[]{
  const map=new Map<string,Show[]>();for(const s of shows){if(!s.venue)continue;map.set(s.venue,[...(map.get(s.venue)||[]),s])}
  return Array.from(map.entries()).sort((a,b)=>b[1].length-a[1].length).slice(0,10).map(([name,list],i)=>({id:`live-venue-${i}`,name,region:list[0]?.region||"",showCount:list.length,tag:`현재·예정 ${list.length}건`,imageUrl:venueImage(name)}));
}

export default function Home(){
  const [mode,setMode]=useState<ViewMode>("guest");
  const [recommended,setRecommended]=useState<ScoredShow[]>([]);
  const [liveToday,setLiveToday]=useState<Show[]>(todayShows);
  const [liveUpcoming,setLiveUpcoming]=useState<Show[]>(popularShows);
  const [livePopular,setLivePopular]=useState<Show[]>([]);
  const [popularSource,setPopularSource]=useState<"loading"|"kopis"|"none">("loading");
  const [followedArtistIds,setFollowedArtistIds]=useState<Set<string>>(new Set());

  useEffect(()=>{let cancelled=false;Promise.all([
    fetch("/api/kopis?type=today",{cache:"no-store"}).then(r=>r.json()),
    fetch("/api/kopis?type=upcoming",{cache:"no-store"}).then(r=>r.json()),
    fetch("/api/kopis?type=popular&rows=16",{cache:"no-store"}).then(r=>r.json()),
  ]).then(([todayData,upcomingData,popularData])=>{if(cancelled)return;if(Array.isArray(todayData?.shows))setLiveToday(todayData.shows);if(Array.isArray(upcomingData?.shows))setLiveUpcoming(upcomingData.shows);if(Array.isArray(popularData?.shows))setLivePopular(popularData.shows);setPopularSource(popularData?.source==="kopis-boxoffice"?"kopis":"none")}).catch(()=>{if(!cancelled)setPopularSource("none")});return()=>{cancelled=true}},[]);

  useEffect(()=>{if(mode!=="member")return;let cancelled=false;getProfile().then(p=>{if(!cancelled&&p)setRecommended(recommendShows(allShows,p,6))});getFollowedArtistIds().then(ids=>{if(!cancelled)setFollowedArtistIds(ids)});return()=>{cancelled=true}},[mode]);
  async function handleToggleFollow(artistId:string){setFollowedArtistIds(prev=>{const next=new Set(prev);next.has(artistId)?next.delete(artistId):next.add(artistId);return next});await toggleArtistFollow(artistId)}

  const visibleShows=useMemo(()=>Array.from(new Map([...liveToday,...liveUpcoming,...livePopular].map(s=>[s.id,s])).values()),[liveToday,liveUpcoming,livePopular]);
  const artists=useMemo(()=>dynamicArtists(visibleShows),[visibleShows]);
  const venues=useMemo(()=>dynamicVenues(visibleShows),[visibleShows]);
  const popularDisplay=livePopular.length?livePopular:liveUpcoming.slice(0,10);

  return <><Header mode={mode} onModeChange={setMode}/><main id="shows" className="flex-1"><Hero/>
    {mode==="member"&&<SectionRow eyebrow="FOR YOU" title="회원님을 위한 추천" action={<a href="/onboarding" className="text-xs text-muted underline underline-offset-4 hover:text-paper">추천 설정 변경</a>}>{recommended.length?recommended.map(({show,matchedReasons})=><ShowCard key={show.id} show={show} reason={reasonLabel(matchedReasons)}/>):<p className="text-sm text-muted">조건에 맞는 공연을 찾는 중입니다.</p>}</SectionRow>}

    <SectionRow eyebrow={popularSource==="kopis"?"KOPIS BOX OFFICE":"SHOWDAY PICKS"} title={popularSource==="kopis"?"지금 실제로 많이 선택되는 공연":"지금 주목할 공연"} id="popular-now" action={popularSource==="loading"?<span className="text-[11px] text-muted">순위 확인 중</span>:popularSource==="kopis"?<span className="text-[11px] text-muted">최근 KOPIS 박스오피스 기준</span>:<span className="text-[11px] text-muted">박스오피스 연결 시 실제 순위로 전환</span>}>
      {popularDisplay.map(s=><ShowCard key={s.id} show={s}/>)}
    </SectionRow>

    <ShowdayTrends shows={visibleShows}/>
    <ShowdayNow/>

    <SectionRow eyebrow="TODAY" title="오늘 바로 볼 수 있는 공연">{liveToday.map(s=><ShowCard key={s.id} show={s}/>)}</SectionRow>
    <SectionRow eyebrow="UPCOMING" title="다음 공연을 미리 확인하세요">{liveUpcoming.map(s=><ShowCard key={s.id} show={s}/>)}</SectionRow>

    {artists.length>0&&<SectionRow eyebrow="ARTISTS" title="아티스트의 다음 공연" action={mode==="guest"?<span className="text-[11px] text-muted">로그인하면 관심 아티스트 저장</span>:undefined}>{artists.map(a=><ArtistCard key={a.id} artist={a} shows={visibleShows.filter(s=>cleanArtistName(s.artist)===a.name)} mode={mode} isFollowing={followedArtistIds.has(a.id)} onToggleFollow={handleToggleFollow}/>)}</SectionRow>}

    {venues.length>0&&<SectionRow eyebrow="VENUES" title="공연장별 현재·예정 공연" id="venues">{venues.map(v=><VenueCard key={v.id} venue={v} shows={visibleShows.filter(s=>s.venue===v.name)}/>)}</SectionRow>}

    <ParentsFiftyPlusSection/>{mode==="member"&&<AlertsPanel/>}<ArenaNowBanner/>
  </main><Footer/></>
}
