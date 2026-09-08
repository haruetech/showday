"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signInWithKakao, isAuthConfigured } from "@/lib/auth";
import { allShows } from "@/lib/dummy-data";
import type { Show } from "@/types/show";

type Timing = "오늘" | "이번 주" | "이번 주말" | "날짜 상관없음";
type Budget = "1만원 이하" | "3만원 이하" | "5만원 이하" | "10만원 이하" | "가격 상관없음";
const timings: Timing[] = ["오늘", "이번 주", "이번 주말", "날짜 상관없음"];
const budgets: Budget[] = ["1만원 이하", "3만원 이하", "5만원 이하", "10만원 이하", "가격 상관없음"];
const genres = ["전체", "대중음악", "뮤지컬", "연극", "클래식", "국악", "무용", "아동"];
const budgetMax: Record<Budget, number> = {"1만원 이하":10000,"3만원 이하":30000,"5만원 이하":50000,"10만원 이하":100000,"가격 상관없음":Infinity};

export default function Hero() {
  const [query,setQuery]=useState(""); const [timing,setTiming]=useState<Timing>("이번 주");
  const [budget,setBudget]=useState<Budget>("가격 상관없음"); const [genre,setGenre]=useState("전체");
  const [results,setResults]=useState<Show[]>([]); const [loading,setLoading]=useState(false); const [searched,setSearched]=useState(false);
  const searchedOnce=useRef(false);
  const fallback=useMemo(()=>allShows.filter(s=>(budgetMax[budget]===Infinity||(s.priceValue>0&&s.priceValue<=budgetMax[budget]))).filter(s=>genre==="전체"||s.genre.includes(genre)).filter(s=>!query.trim()||`${s.title} ${s.artist??""} ${s.venue}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0,12),[query,budget,genre]);
  async function searchShows(q=query){ setLoading(true); setSearched(true); searchedOnce.current=true; try { const range=timing==="오늘"?"today":timing==="이번 주"?"week":timing==="이번 주말"?"weekend":"30d"; const p=new URLSearchParams({type:"search",range,rows:"40"}); if(q.trim())p.set("q",q.trim()); const r=await fetch(`/api/kopis?${p}`,{cache:"no-store"}); const d=await r.json(); const max=budgetMax[budget]; const list:(Show[])=(d?.shows??[]).filter((s:Show)=>max===Infinity||s.priceValue===0||s.priceValue<=max).filter((s:Show)=>genre==="전체"||s.genre?.includes(genre)); setResults(list.slice(0,12)); } catch { setResults(fallback); } finally { setLoading(false); }}
  useEffect(()=>{ const fn=(e:Event)=>{const q=(e as CustomEvent<{query?:string}>).detail?.query?.trim(); if(!q)return; setQuery(q); setTimeout(()=>searchShows(q),0);}; window.addEventListener("showday:search",fn); return()=>window.removeEventListener("showday:search",fn); },[]);
  const shown=results.length?results:fallback;
  return <section id="show-search" className="scroll-mt-24 border-b border-line">
    <div className="relative min-h-[430px] overflow-hidden border-b border-line">
      <img src="/showday-hero-audience.png" alt="공연을 즐기는 관객" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/15" />
      <div className="relative mx-auto flex min-h-[430px] max-w-[1440px] items-center px-6 py-14">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-bold tracking-[.24em] text-gold">YOUR SHOW · YOUR DAY</p>
          <h1 className="font-display text-4xl font-black leading-[1.12] text-white sm:text-6xl">오늘은 관객이지만,<br/><span className="text-gold">당신의 하루가 주인공입니다.</span></h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/80 sm:text-base">보고 싶은 공연을 찾고, 누구와 갈지 정하고, 공연 전후의 하루까지 SHOWDAY가 이어드립니다.</p>
          <div className="mt-7 flex flex-wrap gap-3"><a href="#quick-search" className="rounded-full bg-gold px-5 py-3 text-sm font-bold text-ink">내 공연 찾기 →</a>{isAuthConfigured&&<button onClick={signInWithKakao} className="rounded-full bg-[#FEE500] px-5 py-3 text-sm font-bold text-[#191600]">카카오로 취향 저장</button>}</div>
        </div>
      </div>
    </div>
    <div id="quick-search" className="mx-auto max-w-[1440px] px-6 py-8">
      <div className="rounded-md border border-line bg-surface p-5 sm:p-6">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]"><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchShows()} placeholder="공연명 · 아티스트 · 공연장 검색" className="w-full rounded-sm border border-line bg-ink/60 px-4 py-3 text-sm text-paper outline-none focus:border-gold"/><button onClick={()=>searchShows()} className="rounded-sm bg-gold px-6 py-3 text-sm font-bold text-ink">공연 검색</button></div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3"><Choice label="언제" options={timings} value={timing} setValue={setTiming}/><Choice label="장르" options={genres} value={genre} setValue={setGenre}/><Choice label="예산" options={budgets} value={budget} setValue={setBudget}/></div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs"><button onClick={()=>{setQuery("부모님");setGenre("전체");}} className="rounded-full border border-line px-3 py-2 text-muted hover:border-gold hover:text-paper">부모님과 함께</button><a href="#fiftyplus" className="rounded-full border border-line px-3 py-2 text-muted hover:border-gold hover:text-paper">나를 위한 50+ 공연</a><span className="rounded-full border border-line px-3 py-2 text-muted">가까운 공연 · 위치 허용 시 제공 예정</span></div>
        {searched&&<div className="mt-6 border-t border-line pt-5"><div className="mb-3 flex justify-between"><strong className="text-sm text-paper">검색 결과 {loading?"":shown.length+"건"}</strong><button onClick={()=>setSearched(false)} className="text-xs text-muted">접기</button></div>{loading?<p className="text-sm text-muted">공연정보를 불러오는 중입니다.</p>:<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{shown.map(show=><a key={show.id} href={`/show/${encodeURIComponent(show.id)}`} className="group overflow-hidden rounded-sm border border-line bg-ink/35 hover:border-gold"><div className="aspect-[4/3] bg-black/20">{show.posterUrl?<img src={show.posterUrl} alt="" className="h-full w-full object-contain"/>:<div className="h-full w-full" style={{background:`linear-gradient(135deg,${show.posterFrom},${show.posterTo})`}}/>}</div><div className="p-3"><b className="line-clamp-2 text-sm text-paper">{show.title}</b><p className="mt-1 truncate text-xs text-muted">{show.venue}</p><p className="mt-2 text-xs text-gold">{show.priceLabel||"가격 확인"} · 상세보기 →</p></div></a>)}</div>}</div>}
      </div>
    </div>
  </section>
}
function Choice<T extends string>({label,options,value,setValue}:{label:string;options:readonly T[];value:T;setValue:(v:T)=>void}){return <div><p className="mb-2 text-xs text-muted">{label}</p><div className="flex flex-wrap gap-2">{options.map(o=><button key={o} onClick={()=>setValue(o)} className={`rounded-full border px-3 py-1.5 text-xs ${o===value?"border-gold bg-gold text-ink":"border-line text-muted hover:text-paper"}`}>{o}</button>)}</div></div>}
