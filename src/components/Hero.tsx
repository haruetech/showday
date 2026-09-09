"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signInWithKakao, isAuthConfigured } from "@/lib/auth";
import { allShows } from "@/lib/dummy-data";
import type { Show } from "@/types/show";

type Timing = "오늘" | "이번 주" | "이번 주말" | "30일 이내";
type Region = "전국" | "서울" | "경기" | "인천" | "부산";
const timings: Timing[] = ["오늘", "이번 주", "이번 주말", "30일 이내"];
const regions: Region[] = ["전국", "서울", "경기", "인천", "부산"];
const regionCodes: Record<Region,string> = {전국:"",서울:"11",경기:"41",인천:"28",부산:"26"};
const genres = ["전체", "대중음악", "뮤지컬", "연극", "클래식", "국악", "무용", "아동"];

function isEnded(status?: string){ return Boolean(status && (status.includes("완료") || status.includes("종료"))); }

export default function Hero() {
  const [query,setQuery]=useState("");
  const [timing,setTiming]=useState<Timing>("이번 주말");
  const [region,setRegion]=useState<Region>("전국");
  const [genre,setGenre]=useState("전체");
  const [results,setResults]=useState<Show[]>([]);
  const [loading,setLoading]=useState(false);
  const [searched,setSearched]=useState(false);
  const [artistMode,setArtistMode]=useState(false);
  const searchedOnce=useRef(false);

  const fallback=useMemo(()=>allShows
    .filter(s=>!isEnded(s.status))
    .filter(s=>genre==="전체"||s.genre.includes(genre))
    .filter(s=>region==="전국"||s.region.includes(region))
    .filter(s=>!query.trim()||`${s.title} ${s.artist??""} ${s.venue}`.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0,12),[query,genre,region]);

  async function searchShows(q=query, opts?:{timing?:Timing;region?:Region;genre?:string}){
    setArtistMode(false); setLoading(true); setSearched(true); searchedOnce.current=true;
    const activeTiming=opts?.timing??timing;
    const activeRegion=opts?.region??region;
    const activeGenre=opts?.genre??genre;
    try {
      const range=activeTiming==="오늘"?"today":activeTiming==="이번 주"?"week":activeTiming==="이번 주말"?"weekend":"30d";
      const p=new URLSearchParams({type:"search",range,rows:"40"});
      if(q.trim())p.set("q",q.trim());
      if(regionCodes[activeRegion])p.set("region",regionCodes[activeRegion]);
      const r=await fetch(`/api/kopis?${p}`,{cache:"no-store"});
      const d=await r.json();
      const list:(Show[])=(d?.shows??[])
        .filter((s:Show)=>!isEnded(s.status))
        .filter((s:Show)=>activeGenre==="전체"||s.genre?.includes(activeGenre));
      setResults(list.slice(0,12));
    } catch { setResults(fallback); } finally { setLoading(false); }
  }

  function aiSearchPrompt(prompt:string){
    let nextTiming:Timing=timing, nextRegion:Region=region, nextGenre=genre;
    const normalized=prompt.trim();
    if(/오늘|지금|오늘밤|오늘 저녁/.test(normalized)) nextTiming="오늘";
    else if(/이번\s*주말|주말|토요일|일요일/.test(normalized)) nextTiming="이번 주말";
    else if(/이번\s*주|이번주/.test(normalized)) nextTiming="이번 주";
    else if(/다음\s*공연|예정|앞으로|한달|30일/.test(normalized)) nextTiming="30일 이내";

    const foundRegion=regions.find(r=>r!=="전국"&&normalized.includes(r)); if(foundRegion) nextRegion=foundRegion;
    const genreMap:[RegExp,string][]=[[/콘서트|가요|아이돌|k-?pop/i,"대중음악"],[/뮤지컬/,"뮤지컬"],[/연극/,"연극"],[/클래식|오케스트라|피아노|성악/,"클래식"],[/국악/,"국악"],[/무용|발레/,"무용"],[/아동|어린이|키즈/,"아동"]];
    const foundGenre=genreMap.find(([rx])=>rx.test(normalized)); if(foundGenre) nextGenre=foundGenre[1];

    setTiming(nextTiming); setRegion(nextRegion); setGenre(nextGenre); setQuery(normalized);
    const cleaned=normalized
      .replace(/이번\s*주말|이번주말|이번\s*주|이번주|오늘밤|오늘\s*저녁|오늘|지금|서울|경기|인천|부산|에서|근처|가까운|볼\s*만한|볼|추천|해줘|찾아줘|공연|콘서트|뮤지컬|클래식|연극|다음|예정|50대|60대|부모님|편하게|힐링/gi," ")
      .replace(/\s+/g," ").trim();
    searchShows(cleaned,{timing:nextTiming,region:nextRegion,genre:nextGenre});
  }

  // 아티스트 검색은 과거 이력을 보여주지 않는다. 현재 공연과 향후 약 6개월만 노출한다.
  async function searchArtistShows(q:string){
    setArtistMode(true); setLoading(true); setSearched(true); searchedOnce.current=true;
    try {
      const p=new URLSearchParams({type:"artist",q,rows:"40"});
      const r=await fetch(`/api/kopis?${p}`,{cache:"no-store"});
      const d=await r.json();
      setResults(((d?.shows??[]) as Show[]).filter(s=>!isEnded(s.status)).slice(0,24));
    } catch { setResults([]); } finally { setLoading(false); }
  }

  useEffect(()=>{ const fn=(e:Event)=>{const detail=(e as CustomEvent<{query?:string;mode?:string}>).detail; const q=detail?.query?.trim(); if(!q)return; setQuery(q); if(detail?.mode==="artist") setTimeout(()=>searchArtistShows(q),0); else setTimeout(()=>searchShows(q),0);}; window.addEventListener("showday:search",fn); return()=>window.removeEventListener("showday:search",fn); },[]);

  const shown=artistMode?results:(results.length?results:fallback);
  const liveNow=artistMode?shown.filter(s=>s.status?.includes("중")):[];
  const upcoming=artistMode?shown.filter(s=>!s.status?.includes("중")&&!isEnded(s.status)):[];
  const artistGroupsEmpty=artistMode&&liveNow.length===0&&upcoming.length===0;

  function quickPick(label:string){
    if(label==="지금 인기") document.getElementById("popular-now")?.scrollIntoView({behavior:"smooth"});
    if(label==="이번 주말"){setTiming("이번 주말");searchShows("",{timing:"이번 주말"});}
    if(label==="티켓 오픈") document.getElementById("discover")?.scrollIntoView({behavior:"smooth"});
    if(label==="50+ 라이프") document.getElementById("fiftyplus")?.scrollIntoView({behavior:"smooth"});
  }

  return <section id="show-search" className="scroll-mt-24 border-b border-line">
    <div className="relative min-h-[430px] overflow-hidden border-b border-line">
      <img src="/showday-hero-audience.png" alt="공연을 즐기는 관객" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/15" />
      <div className="relative mx-auto flex min-h-[430px] max-w-[1440px] items-center px-6 py-14">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-bold tracking-[.24em] text-gold">SHOWDAY · DISCOVER YOUR SHOW</p>
          <h1 className="font-display text-4xl font-black leading-[1.12] text-white sm:text-6xl">오늘 뭐 볼까?<br/><span className="text-gold">공연 가는 날, 가장 먼저.</span></h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/80 sm:text-base">지금 볼 수 있는 공연부터 예정 공연까지, SHOWDAY AI가 취향에 맞춰 빠르게 찾아드립니다.</p>
          <div className="mt-7 flex flex-wrap gap-3"><a href="#quick-search" className="rounded-full bg-gold px-5 py-3 text-sm font-bold text-ink">내 공연 찾기 →</a>{isAuthConfigured&&<button onClick={signInWithKakao} className="rounded-full bg-[#FEE500] px-5 py-3 text-sm font-bold text-[#191600]">카카오로 관심공연 저장</button>}</div>
        </div>
      </div>
    </div>
    <div id="quick-search" className="mx-auto max-w-[1440px] px-6 py-8">
      <div className="rounded-md border border-line bg-surface p-5 sm:p-6">
        <div className="mb-4"><h2 className="text-xl font-black text-paper">어떤 공연을 찾으세요?</h2><p className="mt-1 text-sm text-muted">공연명, 아티스트, 공연장으로 검색하거나 아래 조건으로 발견해보세요.</p></div>
        <div className="grid gap-5 lg:grid-cols-[1.45fr_.75fr]">
          <div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]"><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchShows()} placeholder="공연명·아티스트·공연장 또는 ‘이번 주말 서울 뮤지컬’" className="w-full rounded-lg border border-line bg-ink/60 px-4 py-3 text-sm text-paper outline-none focus:border-gold"/><button onClick={()=>searchShows()} className="rounded-lg bg-gold px-6 py-3 text-sm font-bold text-white">공연 찾기</button></div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3"><Choice label="언제" options={timings} value={timing} setValue={setTiming}/><Choice label="어디서" options={regions} value={region} setValue={setRegion}/><Choice label="무엇을" options={genres} value={genre} setValue={setGenre}/></div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs"><Quick label="🔥 지금 인기" onClick={()=>quickPick("지금 인기")}/><Quick label="📅 이번 주말" onClick={()=>quickPick("이번 주말")}/><Quick label="🎫 티켓 오픈" onClick={()=>quickPick("티켓 오픈")}/><Quick label="📍 서울 공연" onClick={()=>{setRegion("서울");searchShows("",{region:"서울"})}}/><Quick label="✨ 50+ 라이프" onClick={()=>quickPick("50+ 라이프")}/></div>
          </div>
          <aside className="rounded-xl border border-gold/30 bg-gold/5 p-4">
            <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-sm font-black text-white">AI</span><div><p className="text-sm font-black text-paper">SHOWDAY AI 찾기</p><p className="text-[11px] text-muted">말하듯 입력해도 조건을 찾아드립니다.</p></div></div>
            <div className="mt-4 space-y-2">{["이번 주말 서울에서 볼 콘서트","50대가 편하게 볼 클래식","아이유 다음 공연","오늘 KSPO DOME 공연"].map(ex=><button key={ex} onClick={()=>aiSearchPrompt(ex)} className="block w-full rounded-lg border border-line bg-surface px-3 py-2 text-left text-xs text-paper hover:border-gold"><span className="mr-2 text-gold">↗</span>{ex}</button>)}</div>
            <p className="mt-4 border-t border-line pt-3 text-[11px] leading-5 text-muted">말하듯 입력하면 <b className="text-paper">언제 · 어디서 · 무엇을 · 누구를</b> 찾는지 정리해 현재·예정 공연부터 보여드립니다.</p>
          </aside>
        </div>
        {searched && <div className="mt-6 border-t border-line pt-5">
          <div className="mb-3 flex justify-between"><strong className="text-sm text-paper">{artistMode ? `'${query}' 현재·예정 공연` : "검색 결과"} {loading?"":`${shown.length}건`}</strong><button onClick={()=>setSearched(false)} className="text-xs text-muted">접기</button></div>
          {loading?<p className="text-sm text-muted">공연정보를 불러오는 중입니다.</p>:artistMode?(artistGroupsEmpty?<div className="rounded-sm border border-line bg-ink/25 px-4 py-6 text-center"><p className="text-sm text-paper">현재 예정된 공연을 찾지 못했어요.</p><p className="mt-2 text-xs text-muted">관심 아티스트로 저장해두면 다음 공연을 발견하기 쉬워집니다.</p></div>:<div className="flex flex-col gap-5">{liveNow.length>0&&<ResultGroup label="지금 공연 중" shows={liveNow}/>} {upcoming.length>0&&<ResultGroup label="곧 만나요 · 예정 공연" shows={upcoming}/>}</div>):shown.length?<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{shown.map(show=><ResultCard key={show.id} show={show}/>)}</div>:<p className="rounded-sm border border-line bg-ink/25 px-4 py-6 text-center text-sm text-muted">조건에 맞는 현재·예정 공연이 없습니다. 날짜나 지역을 넓혀보세요.</p>}
        </div>}
      </div>
    </div>
  </section>
}
function Choice<T extends string>({label,options,value,setValue}:{label:string;options:readonly T[];value:T;setValue:(v:T)=>void}){return <div><p className="mb-2 text-xs font-bold text-muted">{label}</p><div className="flex flex-wrap gap-2">{options.map(o=><button key={o} onClick={()=>setValue(o)} className={`rounded-full border px-3 py-1.5 text-xs ${o===value?"border-gold bg-gold text-ink":"border-line text-muted hover:text-paper"}`}>{o}</button>)}</div></div>}
function Quick({label,onClick}:{label:string;onClick:()=>void}){return <button onClick={onClick} className="rounded-full border border-line px-3 py-2 text-muted hover:border-gold hover:text-paper">{label}</button>}
function ResultCard({show}:{show:Show}){return <a href={`/show/${encodeURIComponent(show.id)}`} className="group overflow-hidden rounded-sm border border-line bg-ink/35 hover:border-gold"><div className="aspect-[4/3] bg-black/20">{show.posterUrl?<img src={show.posterUrl} alt="" className="h-full w-full object-contain"/>:<div className="h-full w-full" style={{background:`linear-gradient(135deg,${show.posterFrom},${show.posterTo})`}}/>}</div><div className="p-3"><b className="line-clamp-2 text-sm text-paper">{show.title}</b><p className="mt-1 truncate text-xs text-muted">{show.venue} · {show.dateLabel}</p><p className="mt-2 text-xs text-gold">{show.priceLabel||"가격 확인"} · 상세보기 →</p></div></a>}
function ResultGroup({label,shows}:{label:string;shows:Show[]}){return <div><p className="mb-2 text-xs font-bold text-gold">{label} · {shows.length}건</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{shows.map(show=><ResultCard key={show.id} show={show}/>)}</div></div>}
