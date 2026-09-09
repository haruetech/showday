"use client";
import { useEffect,useState } from "react";

type News={id:string;title:string;link:string;publishedAt:string;source:string};
export default function ShowdayNow(){
  const [items,setItems]=useState<News[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{fetch('/api/news',{cache:'no-store'}).then(r=>r.json()).then(d=>setItems(d.items||[])).catch(()=>setItems([])).finally(()=>setLoading(false));},[]);
  return <section className="mx-auto max-w-6xl px-6 py-12">
    <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[.18em] text-gold">SHOWDAY NOW</p><h2 className="mt-2 text-3xl font-black text-paper">공연을 고르는 데 필요한 최신 소식</h2><p className="mt-2 text-sm text-muted">공연 발표·투어·티켓 오픈 등 관람 결정에 직접 연결되는 소식만 모읍니다.</p></div><span className="hidden text-[11px] text-muted sm:block">15분 단위 갱신</span></div>
    {loading?<div className="rounded-xl border border-line bg-surface p-6 text-sm text-muted">최신 공연 소식을 불러오는 중입니다.</div>:items.length?<div className="grid gap-3 md:grid-cols-3">{items.slice(0,6).map((i,idx)=><a key={i.id} href={i.link} target="_blank" rel="noopener noreferrer" className="group rounded-xl border border-line bg-surface p-5 hover:border-gold"><div className="flex items-center justify-between gap-3"><span className="text-[10px] font-bold text-gold">{idx<2?'TICKET / HOT':'SHOWDAY NOW'}</span><span className="truncate text-[10px] text-muted">{i.source}</span></div><h3 className="mt-3 line-clamp-3 text-base font-black leading-6 text-paper group-hover:text-gold">{i.title}</h3><p className="mt-4 text-[11px] text-muted">{formatDate(i.publishedAt)} · 원문 보기 ↗</p></a>)}</div>:<div className="grid gap-3 md:grid-cols-3">{['공연 발표','티켓 오픈','아티스트 투어'].map(t=><div key={t} className="rounded-xl border border-line bg-surface p-5"><span className="text-[10px] font-bold text-gold">SHOWDAY NOW</span><h3 className="mt-3 text-lg font-black text-paper">{t}</h3><p className="mt-2 text-sm leading-6 text-muted">최신 소스 연결 시 이 영역에 자동으로 업데이트됩니다.</p></div>)}</div>}
  </section>
}
function formatDate(v:string){try{return new Intl.DateTimeFormat('ko-KR',{month:'numeric',day:'numeric'}).format(new Date(v));}catch{return ''}}
