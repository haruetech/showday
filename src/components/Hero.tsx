"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { signInWithKakao, isAuthConfigured } from "@/lib/auth";
import { allShows } from "@/lib/dummy-data";
import { ArrowIcon, CalendarIcon, PinIcon, SearchIcon, SparkIcon, TrendIcon, WellnessIcon } from "@/components/Icons";
import type { Show } from "@/types/show";

type Timing = "오늘" | "이번 주" | "이번 주말" | "30일 이내";
type Region = "전국" | "서울" | "경기" | "인천" | "부산";
const timings: Timing[] = ["오늘", "이번 주", "이번 주말", "30일 이내"];
const regions: Region[] = ["전국", "서울", "경기", "인천", "부산"];
const regionCodes: Record<Region,string> = {전국:"",서울:"11",경기:"41",인천:"28",부산:"26"};
const genres = ["전체", "대중음악", "뮤지컬", "연극", "클래식", "국악", "무용", "아동"];

function isEnded(status?: string){ return Boolean(status && (status.includes("완료") || status.includes("종료"))); }

function interpretPrompt(prompt:string, current:{timing:Timing;region:Region;genre:string}){
  let nextTiming=current.timing, nextRegion=current.region, nextGenre=current.genre;
  const normalized=prompt.trim();
  if(/오늘|지금|오늘밤|오늘 저녁/.test(normalized)) nextTiming="오늘";
  else if(/이번\s*주말|주말|토요일|일요일/.test(normalized)) nextTiming="이번 주말";
  else if(/이번\s*주|이번주/.test(normalized)) nextTiming="이번 주";
  else if(/다음\s*공연|예정|앞으로|한달|30일/.test(normalized)) nextTiming="30일 이내";
  const foundRegion=regions.find(r=>r!=="전국"&&normalized.includes(r)); if(foundRegion) nextRegion=foundRegion;
  const genreMap:[RegExp,string][]=[[/콘서트|가요|아이돌|k-?pop/i,"대중음악"],[/뮤지컬/,"뮤지컬"],[/연극/,"연극"],[/클래식|오케스트라|피아노|성악/,"클래식"],[/국악/,"국악"],[/무용|발레/,"무용"],[/아동|어린이|키즈/,"아동"]];
  const foundGenre=genreMap.find(([rx])=>rx.test(normalized)); if(foundGenre) nextGenre=foundGenre[1];
  const cleaned=normalized
    .replace(/이번\s*주말|이번주말|이번\s*주|이번주|오늘밤|오늘\s*저녁|오늘|지금|서울|경기|인천|부산|에서|근처|가까운|볼\s*만한|볼|추천|해줘|찾아줘|공연|콘서트|뮤지컬|클래식|연극|다음|예정|50대|60대|부모님|편하게|힐링/gi," ")
    .replace(/\s+/g," ").trim();
  return {timing:nextTiming,region:nextRegion,genre:nextGenre,query:cleaned};
}

export default function Hero() {
  const [query,setQuery]=useState("");
  const [timing,setTiming]=useState<Timing>("이번 주말");
  const [region,setRegion]=useState<Region>("전국");
  const [genre,setGenre]=useState("전체");
  const [results,setResults]=useState<Show[]>([]);
  const [loading,setLoading]=useState(false);
  const [searched,setSearched]=useState(false);
  const [artistMode,setArtistMode]=useState(false);

  const fallback=useMemo(()=>allShows.filter(s=>!isEnded(s.status)).filter(s=>genre==="전체"||s.genre.includes(genre)).filter(s=>region==="전국"||s.region.includes(region)).filter(s=>!query.trim()||`${s.title} ${s.artist??""} ${s.venue}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0,12),[query,genre,region]);
  const parsed=useMemo(()=>interpretPrompt(query,{timing,region,genre}),[query,timing,region,genre]);

  async function searchShows(q=query, opts?:{timing?:Timing;region?:Region;genre?:string}){
    setArtistMode(false); setLoading(true); setSearched(true);
    const activeTiming=opts?.timing??timing, activeRegion=opts?.region??region, activeGenre=opts?.genre??genre;
    try{
      const range=activeTiming==="오늘"?"today":activeTiming==="이번 주"?"week":activeTiming==="이번 주말"?"weekend":"30d";
      const p=new URLSearchParams({type:"search",range,rows:"40"});
      if(q.trim())p.set("q",q.trim()); if(regionCodes[activeRegion])p.set("region",regionCodes[activeRegion]);
      const d=await fetch(`/api/kopis?${p}`,{cache:"no-store"}).then(r=>r.json());
      const list:(Show[])=(d?.shows??[]).filter((s:Show)=>!isEnded(s.status)).filter((s:Show)=>activeGenre==="전체"||s.genre?.includes(activeGenre));
      setResults(list.slice(0,12));
    }catch{setResults(fallback)}finally{setLoading(false)}
  }

  function smartSearch(prompt:string){
    const next=interpretPrompt(prompt,{timing,region,genre});
    setTiming(next.timing);setRegion(next.region);setGenre(next.genre);setQuery(prompt);
    searchShows(next.query,{timing:next.timing,region:next.region,genre:next.genre});
  }

  async function searchArtistShows(q:string){
    setArtistMode(true);setLoading(true);setSearched(true);
    try{const d=await fetch(`/api/kopis?${new URLSearchParams({type:"artist",q,rows:"40"})}`,{cache:"no-store"}).then(r=>r.json());setResults(((d?.shows??[]) as Show[]).filter(s=>!isEnded(s.status)).slice(0,24));}
    catch{setResults([])}finally{setLoading(false)}
  }

  useEffect(()=>{const fn=(e:Event)=>{const detail=(e as CustomEvent<{query?:string;mode?:string}>).detail;const q=detail?.query?.trim();if(!q)return;setQuery(q);if(detail?.mode==="artist")setTimeout(()=>searchArtistShows(q),0);else setTimeout(()=>searchShows(q),0)};window.addEventListener("showday:search",fn);return()=>window.removeEventListener("showday:search",fn)},[]);

  const shown=artistMode?results:(results.length?results:fallback);
  const liveNow=artistMode?shown.filter(s=>s.status?.includes("중")):[];
  const upcoming=artistMode?shown.filter(s=>!s.status?.includes("중")&&!isEnded(s.status)):[];
  const artistGroupsEmpty=artistMode&&liveNow.length===0&&upcoming.length===0;

  return <section id="show-search" className="scroll-mt-24 border-b border-line/80">
    <div className="relative min-h-[410px] overflow-hidden border-b border-line/70">
      <img src="/showday-hero-audience.png" alt="공연을 즐기는 관객" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(37,16,8,.88)_0%,rgba(37,16,8,.58)_48%,rgba(37,16,8,.18)_100%)]" />
      <div className="relative mx-auto flex min-h-[410px] max-w-[1280px] items-center px-6 py-14">
        <div className="max-w-2xl">
          <p className="mb-4 text-[11px] font-semibold tracking-[.24em] text-[#f3b37f]">SHOWDAY · PERFORMANCE DISCOVERY</p>
          <h1 className="font-display text-4xl font-black leading-[1.08] text-white sm:text-6xl">오늘 뭐 볼까?<br/><span className="text-[#f3b37f]">공연 가는 날, 가장 먼저.</span></h1>
          <p className="mt-5 whitespace-nowrap text-sm text-white/78 sm:text-base">지금 볼 수 있는 공연부터 다음 공연까지, SHOWDAY가 한 번에 정리합니다.</p>
          <a href="#quick-search" className="mt-7 inline-flex items-center gap-2 border-b border-[#f3b37f] pb-1 text-sm font-bold text-white">내 공연 찾기 <ArrowIcon className="h-4 w-4"/></a>
        </div>
      </div>
    </div>

    <div id="quick-search" className="mx-auto max-w-[1280px] px-6 py-9">
      <div className="border-y border-line bg-surface/65 py-7">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div><p className="text-[11px] font-semibold tracking-[.18em] text-gold">SMART SEARCH</p><h2 className="mt-2 text-2xl font-black text-paper">말하듯 찾고, 조건은 쉽게 조정하세요.</h2></div>
          <p className="max-w-md text-xs leading-5 text-muted">공연명·아티스트·공연장뿐 아니라 날짜, 지역, 장르를 함께 이해해 현재·예정 공연만 보여드립니다.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.55fr_.85fr]">
          <div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]"><label className="relative"><SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&smartSearch(query)} placeholder="예: 이번 주말 서울에서 볼 뮤지컬" className="w-full rounded-md border border-line bg-white/55 py-3.5 pl-12 pr-4 text-sm text-paper outline-none transition focus:border-gold focus:bg-white"/></label><button onClick={()=>smartSearch(query)} className="inline-flex items-center justify-center gap-2 rounded-md bg-paper px-6 py-3.5 text-sm font-bold text-white transition hover:bg-gold"><SearchIcon className="h-4 w-4"/>공연 찾기</button></div>
            {query.trim() && <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]"><span className="text-muted">SHOWDAY 해석</span><Chip icon={<CalendarIcon className="h-3.5 w-3.5"/>}>{parsed.timing}</Chip><Chip icon={<PinIcon className="h-3.5 w-3.5"/>}>{parsed.region}</Chip><Chip icon={<SparkIcon className="h-3.5 w-3.5"/>}>{parsed.genre}</Chip>{parsed.query&&<Chip>{parsed.query}</Chip>}</div>}
            <div className="mt-5 grid gap-5 lg:grid-cols-3"><Choice label="언제" options={timings} value={timing} setValue={setTiming}/><Choice label="어디서" options={regions} value={region} setValue={setRegion}/><Choice label="무엇을" options={genres} value={genre} setValue={setGenre}/></div>
            <div className="mt-6 flex flex-wrap gap-2"><Quick icon={<TrendIcon className="h-4 w-4"/>} label="지금 인기" onClick={()=>document.getElementById("popular-now")?.scrollIntoView({behavior:"smooth"})}/><Quick icon={<CalendarIcon className="h-4 w-4"/>} label="이번 주말" onClick={()=>{setTiming("이번 주말");searchShows("",{timing:"이번 주말"})}}/><Quick icon={<PinIcon className="h-4 w-4"/>} label="서울 공연" onClick={()=>{setRegion("서울");searchShows("",{region:"서울"})}}/><Quick icon={<WellnessIcon className="h-4 w-4"/>} label="50+ 라이프" onClick={()=>document.getElementById("fiftyplus")?.scrollIntoView({behavior:"smooth"})}/></div>
          </div>
          <aside className="border-l-0 border-line pl-0 lg:border-l lg:pl-6">
            <div className="flex items-start gap-3"><span className="mt-0.5 grid h-9 w-9 place-items-center rounded-full border border-gold/40 text-gold"><SparkIcon className="h-4 w-4"/></span><div><p className="text-sm font-black text-paper">SHOWDAY Guide</p><p className="mt-1 text-xs leading-5 text-muted">정확한 검색어를 몰라도 괜찮습니다. 상황을 그대로 입력해보세요.</p></div></div>
            <div className="mt-4 divide-y divide-line border-y border-line">{["이번 주말 서울에서 볼 콘서트","50대가 편하게 볼 클래식","아이유 다음 공연","오늘 KSPO DOME 공연"].map(ex=><button key={ex} onClick={()=>smartSearch(ex)} className="flex w-full items-center justify-between gap-3 py-3 text-left text-xs font-medium text-paper hover:text-gold"><span>{ex}</span><ArrowIcon className="h-4 w-4 shrink-0"/></button>)}</div>
            {isAuthConfigured&&<button onClick={signInWithKakao} className="mt-4 text-xs font-semibold text-muted underline underline-offset-4 hover:text-paper">로그인하고 관심 공연 저장하기</button>}
          </aside>
        </div>

        {searched && <div className="mt-7 border-t border-line pt-6"><div className="mb-4 flex justify-between"><strong className="text-sm text-paper">{artistMode?`'${query}' 현재·예정 공연`:"검색 결과"} {loading?"":`${shown.length}건`}</strong><button onClick={()=>setSearched(false)} className="text-xs text-muted hover:text-paper">접기</button></div>{loading?<p className="text-sm text-muted">공연정보를 불러오는 중입니다.</p>:artistMode?(artistGroupsEmpty?<Empty/>:<div className="flex flex-col gap-6">{liveNow.length>0&&<ResultGroup label="지금 공연 중" shows={liveNow}/>} {upcoming.length>0&&<ResultGroup label="예정 공연" shows={upcoming}/>}</div>):shown.length?<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{shown.map(show=><ResultCard key={show.id} show={show}/>)}</div>:<Empty/>}</div>}
      </div>
    </div>
  </section>
}
function Choice<T extends string>({label,options,value,setValue}:{label:string;options:readonly T[];value:T;setValue:(v:T)=>void}){return <div><p className="mb-2 text-[11px] font-semibold text-muted">{label}</p><div className="flex flex-wrap gap-x-3 gap-y-2">{options.map(o=><button key={o} onClick={()=>setValue(o)} className={`border-b pb-1 text-xs transition ${o===value?"border-gold font-bold text-paper":"border-transparent text-muted hover:text-paper"}`}>{o}</button>)}</div></div>}
function Quick({icon,label,onClick}:{icon:ReactNode;label:string;onClick:()=>void}){return <button onClick={onClick} className="inline-flex items-center gap-2 rounded-full border border-line bg-white/35 px-3.5 py-2 text-xs font-semibold text-muted transition hover:border-gold/60 hover:text-paper">{icon}{label}</button>}
function Chip({icon,children}:{icon?:ReactNode;children:ReactNode}){return <span className="inline-flex items-center gap-1 rounded-full bg-surface-raised/70 px-2.5 py-1 font-semibold text-paper">{icon}{children}</span>}
function Empty(){return <div className="border-y border-line py-7 text-center"><p className="text-sm font-semibold text-paper">현재·예정 공연을 찾지 못했습니다.</p><p className="mt-2 text-xs text-muted">날짜나 지역을 넓혀 다시 찾아보세요.</p></div>}
function ResultCard({show}:{show:Show}){return <a href={`/show/${encodeURIComponent(show.id)}`} className="group grid grid-cols-[88px_1fr] gap-3 border-b border-line pb-4 sm:block"><div className="aspect-[3/4] overflow-hidden bg-surface-raised">{show.posterUrl?<img src={show.posterUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"/>:<div className="h-full w-full" style={{background:`linear-gradient(135deg,${show.posterFrom},${show.posterTo})`}}/>}</div><div className="sm:pt-3"><p className="text-[10px] font-semibold tracking-[.08em] text-gold">{show.genre}</p><b className="mt-1 line-clamp-2 block text-sm text-paper group-hover:text-gold">{show.title}</b><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{show.venue}<br/>{show.dateLabel}</p><span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-paper">상세보기 <ArrowIcon className="h-3.5 w-3.5"/></span></div></a>}
function ResultGroup({label,shows}:{label:string;shows:Show[]}){return <div><p className="mb-3 text-xs font-bold text-gold">{label} · {shows.length}건</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{shows.map(show=><ResultCard key={show.id} show={show}/>)}</div></div>}
