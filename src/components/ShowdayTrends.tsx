"use client";
import { useEffect,useRef,useState } from "react";
import ShowCard from "@/components/ShowCard";
import type { Show } from "@/types/show";

export default function ShowdayTrends({ shows }: { shows: Show[] }){
  const unique=(list:Show[])=>Array.from(new Map(list.map(s=>[s.id,s])).values()).slice(0,10);
  const groups=[
    {key:"TREND", title:"지금 관심이 가는 공연", desc:"현재·예정 공연 가운데 먼저 살펴볼 만한 공연", shows:unique(shows)},
    {key:"WEEKEND", title:"이번 주말 뭐 볼까?", desc:"주말에 바로 선택하기 좋은 공연", shows:unique(shows.filter(s=>s.tags?.includes("주말") || ["금","토","일"].includes(s.dayOfWeek)))},
    {key:"OPEN", title:"티켓 오픈 · 곧 시작", desc:"예매 시기를 놓치기 쉬운 공연", shows:unique(shows.filter(s=>s.tags?.includes("티켓오픈임박") || s.status?.includes("예정")))},
    {key:"REGION", title:"지역으로 발견하기", desc:"서울·경기·인천 등 가까운 공연부터", shows:unique(shows.filter(s=>!s.status?.includes("완료")&&!s.status?.includes("종료")))},
  ];
  return <section id="discover" className="mx-auto max-w-6xl px-6 py-12">
    <div className="mb-7"><p className="text-xs font-bold tracking-[.18em] text-gold">DISCOVER BY CONCEPT</p><h2 className="mt-2 text-3xl font-black text-paper">취향대로 공연 발견하기</h2><p className="mt-2 text-sm text-muted">전체 공연을 나열하지 않고, 지금 선택하기 쉬운 기준으로 나눠 보여드립니다.</p></div>
    <div className="space-y-10">{groups.map(g=><ConceptRow key={g.key} title={g.title} desc={g.desc} shows={g.shows}/>)}</div>
  </section>
}

function ConceptRow({title,desc,shows}:{title:string;desc:string;shows:Show[]}){
  const ref=useRef<HTMLDivElement>(null); const [left,setLeft]=useState(false); const [right,setRight]=useState(false);
  const update=()=>{const el=ref.current;if(!el)return;setLeft(el.scrollLeft>4);setRight(el.scrollLeft+el.clientWidth<el.scrollWidth-4)};
  useEffect(()=>{update();const on=()=>update();window.addEventListener('resize',on);const ro=new ResizeObserver(update);if(ref.current)ro.observe(ref.current);return()=>{window.removeEventListener('resize',on);ro.disconnect()}},[shows.length]);
  const move=(dir:1|-1)=>ref.current?.scrollBy({left:dir*Math.max(320,(ref.current?.clientWidth||600)*.82),behavior:'smooth'});
  return <div><div className="mb-4 flex items-end justify-between gap-4"><div><h3 className="mt-1 text-xl font-black text-paper">{title}</h3><p className="mt-1 text-xs text-muted">{desc}</p></div></div>{shows.length?<div className="relative">{left&&<button onClick={()=>move(-1)} aria-label="이전 공연" className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-line bg-ink/95 px-3 py-2 font-black text-paper shadow-xl lg:block">‹</button>}<div ref={ref} onScroll={update} className="no-scrollbar flex gap-4 overflow-x-auto pb-2 pr-2 scroll-smooth">{shows.map(s=><ShowCard key={s.id} show={s}/>)}</div>{right&&<button onClick={()=>move(1)} aria-label="공연 더보기" className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 items-center gap-1 rounded-full border border-gold/60 bg-ink/95 px-4 py-2.5 text-xs font-black text-paper shadow-xl hover:bg-gold hover:text-ink lg:flex">공연 더보기 <span className="text-base">›</span></button>}{right&&<button onClick={()=>move(1)} className="mt-4 w-full rounded-lg border border-line py-3 text-xs font-bold text-paper lg:hidden">공연 더보기 ›</button>}</div>:<div className="rounded-xl border border-line bg-surface p-5 text-sm text-muted">현재 조건에 맞는 공연을 불러오는 중입니다.</div>}</div>
}
