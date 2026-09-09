"use client";

import { useEffect,useMemo,useState } from "react";
import { useParams } from "next/navigation";
import { ArrowIcon, BellIcon, HeartIcon, TicketIcon } from "@/components/Icons";
import ShowCard from "@/components/ShowCard";
import type { Show } from "@/types/show";

type Detail={id:string;title:string;genre:string;venue:string;period:string;timeGuide:string;cast:string;crew:string;producer:string;synopsis:string;posterUrl?:string;priceLabel:string;priceGuide:string;ageLabel:string;runningTime:string;status:string;bookingUrl?:string};
const favKey="showday:favourite-shows";const alertKey="showday:show-alerts";
function loadSet(key:string){try{return new Set<string>(JSON.parse(localStorage.getItem(key)||"[]"))}catch{return new Set<string>()}}
function saveSet(key:string,v:Set<string>){localStorage.setItem(key,JSON.stringify([...v]))}

export default function ShowDetail(){
  const {id}=useParams<{id:string}>();const [d,setD]=useState<Detail|null|undefined>(undefined);const [ended,setEnded]=useState(false);const [similar,setSimilar]=useState<Show[]>([]);const [saved,setSaved]=useState(false);const [alerted,setAlerted]=useState(false);
  useEffect(()=>{setSaved(loadSet(favKey).has(id));setAlerted(loadSet(alertKey).has(id));fetch(`/api/kopis?type=detail&id=${encodeURIComponent(id)}`,{cache:"no-store"}).then(r=>r.json()).then(x=>{setEnded(Boolean(x.ended));setD(x.detail||null)}).catch(()=>setD(null))},[id]);
  useEffect(()=>{if(!d)return;fetch('/api/kopis?type=upcoming&rows=40',{cache:'no-store'}).then(r=>r.json()).then(x=>{const list=(x.shows||[]) as Show[];setSimilar(list.filter(s=>s.id!==id&&(s.genre===d.genre||s.venue===d.venue)).slice(0,8))}).catch(()=>setSimilar([]))},[d,id]);
  const toggle=(key:string,current:boolean,setter:(v:boolean)=>void)=>{const set=loadSet(key);current?set.delete(id):set.add(id);saveSet(key,set);setter(!current)};

  return <main className="min-h-screen bg-ink text-paper"><div className="mx-auto max-w-[1180px] px-6 py-8"><a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-paper hover:text-gold"><ArrowIcon className="h-4 w-4 rotate-180"/>SHOWDAY</a>
    {d===undefined?<div className="mt-10 border-y border-line py-10 text-sm text-muted">공연 상세정보를 불러오는 중입니다.</div>:!d?<div className="mt-10 border-y border-line py-10"><h1 className="text-2xl font-black">{ended?"종료된 공연입니다.":"공연 상세정보를 찾지 못했습니다."}</h1><p className="mt-3 text-sm text-muted">{ended?"SHOWDAY는 현재 진행 중이거나 앞으로 예정된 공연만 소개합니다.":"공연정보가 갱신 중이거나 상세정보가 아직 등록되지 않았을 수 있습니다."}</p><a href="/" className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-xs font-bold text-paper">현재·예정 공연 보기 <ArrowIcon className="h-3.5 w-3.5"/></a></div>:<>
      <section className="mt-9 grid gap-10 border-t border-line pt-9 lg:grid-cols-[330px_1fr]">
        <div className="aspect-[3/4] overflow-hidden bg-surface-raised">{d.posterUrl?<img src={d.posterUrl} alt={`${d.title} 포스터`} className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-sm text-muted">포스터 준비중</div>}</div>
        <div className="py-1"><div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold tracking-[.08em]"><span className="text-gold">{d.genre}</span><span className="h-3 w-px bg-line"/><span className="text-muted">{d.status||"공연"}</span></div><h1 className="mt-5 text-3xl font-black leading-[1.2] sm:text-5xl">{d.title}</h1><p className="mt-5 text-base font-semibold text-paper">{d.venue}</p>
          <div className="mt-8 grid border-y border-line sm:grid-cols-2"><Info label="공연기간" value={d.period}/><Info label="공연시간" value={d.timeGuide||d.runningTime}/><Info label="관람연령" value={d.ageLabel}/><Info label="티켓" value={d.priceGuide||d.priceLabel}/></div>
          <div className="mt-7 flex flex-wrap gap-2"><button onClick={()=>toggle(favKey,saved,setSaved)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold ${saved?"border-gold bg-gold/8 text-gold":"border-line text-paper"}`}><HeartIcon filled={saved} className="h-4 w-4"/>{saved?"관심 공연 저장됨":"관심 공연 저장"}</button><button onClick={()=>toggle(alertKey,alerted,setAlerted)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold ${alerted?"border-gold bg-gold/8 text-gold":"border-line text-paper"}`}><BellIcon className="h-4 w-4"/>{alerted?"일정 알림 설정됨":"일정 알림 받기"}</button></div>
          {d.bookingUrl&&<a href={d.bookingUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-paper px-5 py-3 text-sm font-black text-white transition hover:bg-gold"><TicketIcon className="h-4 w-4"/>예매처에서 좌석·가격 확인 <ArrowIcon className="h-4 w-4"/></a>}
        </div>
      </section>
      <section className="mt-14 grid gap-10 border-t border-line pt-9 lg:grid-cols-[1fr_300px]"><div><p className="text-[10px] font-semibold tracking-[.16em] text-gold">ABOUT THE SHOW</p><h2 className="mt-2 text-2xl font-black">공연 소개</h2><p className="mt-5 whitespace-pre-line text-sm leading-8 text-muted">{d.synopsis||"공연 소개 정보가 등록되면 SHOWDAY에서 바로 확인할 수 있습니다."}</p></div><aside className="border-t border-line lg:border-l lg:border-t-0 lg:pl-7"><DetailLine label="출연" value={d.cast}/><DetailLine label="제작진" value={d.crew}/><DetailLine label="기획·제작" value={d.producer}/><DetailLine label="러닝타임" value={d.runningTime}/></aside></section>
      {similar.length>0&&<section className="mt-16 border-t border-line pt-9"><p className="text-[10px] font-semibold tracking-[.16em] text-gold">YOU MAY ALSO LIKE</p><h2 className="mt-2 text-2xl font-black">비슷한 공연도 확인해보세요</h2><div className="no-scrollbar mt-6 flex gap-5 overflow-x-auto pb-3">{similar.map(s=><ShowCard key={s.id} show={s}/>)}</div></section>}
    </>}
  </div></main>
}
function Info({label,value}:{label:string;value?:string}){return <div className="border-b border-line py-4 sm:px-4"><p className="text-[10px] font-semibold tracking-[.08em] text-muted">{label}</p><p className="mt-2 text-sm font-bold leading-6 text-paper">{value||"정보 없음"}</p></div>}
function DetailLine({label,value}:{label:string;value?:string}){if(!value)return null;return <div className="border-b border-line py-4 first:pt-0"><p className="text-[10px] font-semibold tracking-[.08em] text-muted">{label}</p><p className="mt-2 text-sm leading-6 text-paper">{value}</p></div>}
