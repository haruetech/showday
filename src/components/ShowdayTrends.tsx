"use client";
import { useEffect,useRef,useState } from "react";
import type { ComponentType } from "react";
import ShowCard from "@/components/ShowCard";
import { ArrowIcon, CalendarIcon, PinIcon } from "@/components/Icons";
import type { Show } from "@/types/show";

export default function ShowdayTrends({ shows }: { shows: Show[] }){
  const unique=(list:Show[])=>Array.from(new Map(list.map(s=>[s.id,s])).values()).slice(0,10);
  const weekend=unique(shows.filter(s=>!s.status?.includes("완료")&&!s.status?.includes("종료")&&(s.tags?.includes("주말") || ["금","토","일"].includes(s.dayOfWeek))));
  const weekendIds=new Set(weekend.map(s=>s.id));
  const genrePool=shows.filter(s=>!weekendIds.has(s.id)&&!s.status?.includes("완료")&&!s.status?.includes("종료"));
  const genrePicks=unique(Array.from(new Map(genrePool.map(s=>[s.genre,s])).values()));
  const groups=[
    {key:"WEEKEND", icon:CalendarIcon, title:"이번 주말", desc:"금·토·일에 관람할 수 있는 공연만 모았습니다.", shows:weekend},
    {key:"GENRE", icon:PinIcon, title:"장르별로 발견하기", desc:"콘서트·뮤지컬·연극·클래식 등 서로 다른 장르를 한눈에 살펴보세요.", shows:genrePicks},
  ];
  return <section id="discover" className="mx-auto max-w-[1280px] px-6 py-12">
    <div className="border-t border-line pt-8"><p className="text-[10px] font-semibold tracking-[.16em] text-gold">CURATED DISCOVERY</p><h2 className="mt-2 text-3xl font-black text-paper">전체 목록보다, 지금 필요한 기준으로</h2><p className="mt-2 text-sm text-muted">SHOWDAY는 모든 공연을 나열하기보다 선택하기 쉬운 상황별 묶음으로 보여줍니다.</p></div>
    <div className="mt-9 space-y-11">{groups.map(g=><ConceptRow key={g.key} icon={g.icon} title={g.title} desc={g.desc} shows={g.shows}/>)}</div>
  </section>
}

function ConceptRow({icon:Icon,title,desc,shows}:{icon:ComponentType<{className?:string}>;title:string;desc:string;shows:Show[]}){
  const ref=useRef<HTMLDivElement>(null);const [left,setLeft]=useState(false);const [right,setRight]=useState(false);
  const update=()=>{const el=ref.current;if(!el)return;setLeft(el.scrollLeft>4);setRight(el.scrollLeft+el.clientWidth<el.scrollWidth-4)};
  useEffect(()=>{update();const ro=new ResizeObserver(update);if(ref.current)ro.observe(ref.current);window.addEventListener("resize",update);return()=>{ro.disconnect();window.removeEventListener("resize",update)}},[shows.length]);
  const move=(d:1|-1)=>ref.current?.scrollBy({left:d*Math.max(320,(ref.current?.clientWidth||600)*.82),behavior:"smooth"});
  return <div><div className="mb-5 flex items-end justify-between gap-4"><div className="flex items-start gap-3"><div className="mt-1 grid h-8 w-8 place-items-center rounded-full border border-line text-gold"><Icon className="h-4 w-4"/></div><div><h3 className="text-xl font-black text-paper">{title}</h3><p className="mt-1 text-xs text-muted">{desc}</p></div></div></div>{shows.length?<><div ref={ref} onScroll={update} className="no-scrollbar flex gap-5 overflow-x-auto pb-2 pr-2 scroll-smooth">{shows.map(s=><ShowCard key={s.id} show={s}/>)}</div><div className="mt-5 flex justify-end gap-2">{left&&<button onClick={()=>move(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-line text-paper"><ArrowIcon className="h-4 w-4 rotate-180"/></button>}{right&&<button onClick={()=>move(1)} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-bold text-paper hover:border-gold hover:text-gold">공연 더보기 <ArrowIcon className="h-4 w-4"/></button>}</div></>:<div className="border-y border-line py-6 text-sm text-muted">현재 조건에 맞는 공연을 불러오는 중입니다.</div>}</div>
}
