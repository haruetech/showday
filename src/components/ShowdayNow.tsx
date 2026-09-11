"use client";
import { useEffect,useMemo,useState } from "react";
import { ArrowIcon, TicketIcon } from "@/components/Icons";

type News={id:string;title:string;link:string;publishedAt:string;source:string};
export default function ShowdayNow(){
  const [items,setItems]=useState<News[]>([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{fetch('/api/news',{cache:'no-store'}).then(r=>r.json()).then(d=>setItems(d.items||[])).catch(()=>setItems([])).finally(()=>setLoading(false))},[]);
  const ticketItems=useMemo(()=>items.filter(i=>/티켓|예매|오픈|추가\s*회차|선예매/.test(i.title)).slice(0,4),[items]);
  const rest=useMemo(()=>items.filter(i=>!ticketItems.some(t=>t.id===i.id)).slice(0,6),[items,ticketItems]);
  return <section id="showday-now" className="mx-auto max-w-[1280px] px-6 py-12">
    <div className="border-t border-line pt-8">
      <div className="flex items-end justify-between gap-5"><div><p className="text-[10px] font-semibold tracking-[.16em] text-gold">SHOWDAY NOW</p><h2 className="mt-2 text-3xl font-black text-paper">이번 주 공연가 헤드라인</h2></div><span className="hidden text-[11px] text-muted sm:block">공연 발표 · 투어 · 예매 소식 중심</span></div>
      {loading?<div className="mt-7 border-y border-line py-7 text-sm text-muted">최신 공연 소식을 불러오는 중입니다.</div>:<>
        {ticketItems.length>0&&<div id="ticket-open-news" className="mt-8 scroll-mt-24"><div className="mb-4 flex items-center gap-2"><TicketIcon className="h-4 w-4 text-gold"/><h3 className="text-sm font-black text-paper">티켓 오픈 · 예매 소식</h3><span className="text-[10px] text-muted">실제 기사 기준</span></div><div className="grid border-y border-line md:grid-cols-2">{ticketItems.map((i,idx)=><a key={i.id} href={i.link} target="_blank" rel="noopener noreferrer" className={`group flex items-center justify-between gap-4 py-4 md:px-5 ${idx%2===0?"md:border-r md:border-line":""}`}><div className="min-w-0"><p className="text-[10px] font-semibold text-gold">{i.source}</p><h4 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-paper group-hover:text-gold">{i.title}</h4><p className="mt-1 text-[10px] text-muted">{formatDate(i.publishedAt)}</p></div><ArrowIcon className="h-4 w-4 shrink-0 text-muted group-hover:text-gold"/></a>)}</div></div>}
        <div className="mt-9 grid gap-x-8 gap-y-0 md:grid-cols-3">{rest.map((i,idx)=><a key={i.id} href={i.link} target="_blank" rel="noopener noreferrer" className={`group border-t border-line py-5 ${idx>=3?"md:border-t":""}`}><div className="flex items-center justify-between gap-3"><span className="text-[10px] font-semibold tracking-[.08em] text-muted">{i.source}</span><span className="text-[10px] text-muted">{formatDate(i.publishedAt)}</span></div><h3 className="mt-2 line-clamp-3 text-base font-black leading-6 text-paper group-hover:text-gold">{i.title}</h3><span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-paper">원문 보기 <ArrowIcon className="h-3.5 w-3.5"/></span></a>)}</div>
      </>}
    </div>
  </section>
}
function formatDate(v:string){try{return new Intl.DateTimeFormat('ko-KR',{month:'numeric',day:'numeric'}).format(new Date(v))}catch{return ''}}
