"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Detail = {
  id:string; title:string; genre:string; venue:string; period:string; timeGuide:string;
  cast:string; crew:string; producer:string; synopsis:string; posterUrl?:string;
  priceLabel:string; priceGuide:string; ageLabel:string; runningTime:string; status:string; bookingUrl?:string;
};

export default function ShowDetail(){
  const {id}=useParams<{id:string}>();
  const [d,setD]=useState<Detail|null|undefined>(undefined);
  useEffect(()=>{
    fetch(`/api/kopis?type=detail&id=${encodeURIComponent(id)}`,{cache:"no-store"})
      .then(r=>r.json()).then(x=>setD(x.detail || null)).catch(()=>setD(null));
  },[id]);

  return <main className="min-h-screen bg-ink text-paper">
    <div className="mx-auto max-w-6xl px-6 py-8">
      <a href="/" className="text-sm font-bold text-gold">← SHOWDAY</a>
      {d===undefined ? <div className="mt-10 rounded-xl border border-line bg-surface p-8 text-muted">공연 상세정보를 불러오는 중입니다.</div> : !d ? <div className="mt-10 rounded-xl border border-line bg-surface p-8"><h1 className="text-2xl font-black">공연 상세정보를 찾지 못했습니다.</h1><p className="mt-3 text-sm text-muted">공연정보가 갱신 중이거나 KOPIS 상세정보가 아직 등록되지 않았을 수 있습니다.</p></div> : <>
        <section className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="aspect-[3/4] bg-black/20">{d.posterUrl ? <img src={d.posterUrl} alt={`${d.title} 포스터`} className="h-full w-full object-contain"/> : <div className="flex h-full items-center justify-center text-sm text-muted">포스터 준비중</div>}</div>
          </div>
          <div className="py-2">
            <div className="flex flex-wrap gap-2"><span className="rounded-full bg-gold px-3 py-1 text-[11px] font-black text-ink">{d.status || "공연"}</span><span className="rounded-full border border-line px-3 py-1 text-[11px] text-muted">{d.genre}</span></div>
            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">{d.title}</h1>
            <p className="mt-5 text-base text-muted">{d.venue}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Info label="공연기간" value={d.period}/><Info label="공연시간" value={d.timeGuide || d.runningTime}/><Info label="관람연령" value={d.ageLabel}/><Info label="티켓" value={d.priceGuide || d.priceLabel}/>
            </div>
            {d.bookingUrl && <a href={d.bookingUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-black text-ink">정보 확인 후 예매처로 이동 ↗</a>}
          </div>
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border border-line bg-surface p-6 sm:p-8">
            <p className="text-xs font-bold tracking-[.18em] text-gold">ABOUT THIS SHOW</p><h2 className="mt-2 text-2xl font-black">공연 소개</h2>
            <p className="mt-5 whitespace-pre-line text-sm leading-7 text-muted">{d.synopsis || "공연 소개 정보가 등록되면 SHOWDAY에서 바로 확인할 수 있습니다."}</p>
          </div>
          <aside className="rounded-xl border border-line bg-surface p-6">
            <p className="text-xs font-bold tracking-[.18em] text-gold">DETAIL</p>
            <DetailLine label="출연" value={d.cast}/><DetailLine label="제작진" value={d.crew}/><DetailLine label="기획·제작" value={d.producer}/><DetailLine label="러닝타임" value={d.runningTime}/>
          </aside>
        </section>
      </>}
    </div>
  </main>
}

function Info({label,value}:{label:string;value?:string}){return <div className="rounded-lg border border-line bg-ink/30 p-4"><p className="text-[11px] font-bold text-muted">{label}</p><p className="mt-2 text-sm font-bold text-paper">{value||"정보 없음"}</p></div>}
function DetailLine({label,value}:{label:string;value?:string}){if(!value)return null; return <div className="border-b border-line py-4 last:border-0"><p className="text-[11px] text-muted">{label}</p><p className="mt-1 text-sm leading-6 text-paper">{value}</p></div>}
