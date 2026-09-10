"use client";
import { useEffect,useMemo,useRef,useState } from "react";
import type { ComponentType } from "react";
import ShowCard from "@/components/ShowCard";
import { ArrowIcon, CalendarIcon, PinIcon } from "@/components/Icons";
import type { Show } from "@/types/show";

export default function ShowdayTrends({ shows, loading }: { shows: Show[]; loading?: boolean }){
  const unique=(list:Show[])=>Array.from(new Map(list.map(s=>[s.id,s])).values()).slice(0,10);
  const weekend=unique(shows.filter(s=>!s.status?.includes("완료")&&!s.status?.includes("종료")&&(s.tags?.includes("주말") || ["금","토","일"].includes(s.dayOfWeek))));
  const weekendIds=new Set(weekend.map(s=>s.id));
  const genrePool=shows.filter(s=>!weekendIds.has(s.id)&&!s.status?.includes("완료")&&!s.status?.includes("종료"));
  const [selectedGenre,setSelectedGenre]=useState("전체");
  const genreOptions=useMemo(()=>["전체",...Array.from(new Set(genrePool.map(s=>s.genre).filter(Boolean))).slice(0,8)],[genrePool]);
  const genrePicks=unique(selectedGenre==="전체"?genrePool:genrePool.filter(s=>s.genre===selectedGenre));
  const groups=[
    {key:"WEEKEND", icon:CalendarIcon, title:"이번 주말", desc:"금·토·일에 관람할 수 있는 공연만 모았습니다.", shows:weekend, emptyText:"이번 주말에 확인된 공연이 아직 없습니다."},
    {key:"GENRE", icon:PinIcon, title:"장르별 공연", desc:"원하는 장르를 선택해 현재·예정 공연을 바로 확인하세요.", shows:genrePicks, emptyText:"해당 장르의 현재·예정 공연이 없습니다."},
  ];
  return <section id="discover" className="mx-auto max-w-[1280px] px-6 py-12">
    <div className="border-t border-line pt-8"><p className="text-[10px] font-semibold tracking-[.16em] text-gold">CURATED DISCOVERY</p><h2 className="mt-2 text-3xl font-black text-paper">공연을 고르는 기준부터 간단하게</h2><p className="mt-2 text-sm text-muted">이번 주말과 장르처럼 실제 관람 결정에 필요한 기준으로 공연을 빠르게 좁혀보세요.</p></div>
    <div className="mt-9 space-y-11">{groups.map(g=><ConceptRow key={g.key} id={g.key==="WEEKEND"?"weekend-shows":"genre-discovery"} icon={g.icon} title={g.title} desc={g.desc} shows={g.shows} loading={loading} emptyText={g.emptyText} extra={g.key==="GENRE"?<div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1 no-scrollbar">{genreOptions.map(genre=><button key={genre} type="button" onClick={()=>setSelectedGenre(genre)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${selectedGenre===genre?"border-gold text-gold":"border-line text-muted hover:text-paper"}`}>{genre}</button>)}</div>:undefined}/>)}</div>
  </section>
}

function ConceptRow({id,icon:Icon,title,desc,shows,extra,loading,emptyText}:{id:string;icon:ComponentType<{className?:string}>;title:string;desc:string;shows:Show[];extra?:React.ReactNode;loading?:boolean;emptyText:string}){
  const ref=useRef<HTMLDivElement>(null);const [left,setLeft]=useState(false);const [right,setRight]=useState(false);
  const update=()=>{const el=ref.current;if(!el)return;setLeft(el.scrollLeft>4);setRight(el.scrollLeft+el.clientWidth<el.scrollWidth-4)};
  useEffect(()=>{update();const ro=new ResizeObserver(update);if(ref.current)ro.observe(ref.current);window.addEventListener("resize",update);return()=>{ro.disconnect();window.removeEventListener("resize",update)}},[shows.length]);
  const move=(d:1|-1)=>ref.current?.scrollBy({left:d*Math.max(320,(ref.current?.clientWidth||600)*.82),behavior:"smooth"});
  return <div id={id} className="scroll-mt-24"><div className="mb-5 flex items-end justify-between gap-4"><div className="flex items-start gap-3"><div className="mt-1 grid h-8 w-8 place-items-center rounded-full border border-line text-gold"><Icon className="h-4 w-4"/></div><div><h3 className="text-xl font-black text-paper">{title}</h3><p className="mt-1 text-xs text-muted">{desc}</p></div></div></div>{extra}{shows.length?<><div ref={ref} onScroll={update} className="no-scrollbar flex gap-5 overflow-x-auto pb-2 pr-2 scroll-smooth">{shows.map(s=><ShowCard key={s.id} show={s}/>)}</div><div className="mt-5 hidden justify-end gap-2 sm:flex">{left&&<button onClick={()=>move(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-line text-paper"><ArrowIcon className="h-4 w-4 rotate-180"/></button>}{right&&<button onClick={()=>move(1)} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-bold text-paper hover:border-gold hover:text-gold">공연 더보기 <ArrowIcon className="h-4 w-4"/></button>}</div></>:<div className="border-y border-line py-6 text-sm text-muted">{loading?"공연 정보를 불러오는 중입니다.":emptyText}</div>}</div>
}
