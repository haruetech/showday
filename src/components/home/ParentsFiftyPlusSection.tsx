"use client";
import { useEffect, useState } from "react";
import { ArrowIcon, BrainIcon, PlayIcon, WalkIcon, WellnessIcon } from "@/components/common/Icons";

export type FiftyPlusCard = {
  title: string;
  desc: string;
  status: string;
  visible: boolean;
};

// 아이콘·배지는 슬롯(카드 위치)마다 고정. 제목/설명/상태문구/노출여부만 admin(/admin/business)에서 편집 가능.
const SLOTS = [
  { icon: WellnessIcon, badge: "WELLNESS" },
  { icon: BrainIcon, badge: "BRAIN REST" },
  { icon: WalkIcon, badge: "FOOT & WALK" },
  { icon: PlayIcon, badge: "AI LIFE" },
] as const;

export const DEFAULT_FIFTYPLUS_CARDS: FiftyPlusCard[] = [
  { title: "힐링 · 마음 휴식", desc: "5~15분 음악·호흡·명상처럼 바로 이용할 수 있는 짧은 휴식 콘텐츠", status: "콘텐츠 제작 중", visible: true },
  { title: "뇌 휴식 · 인지 콘텐츠", desc: "집중과 이완을 돕는 음악·영상·가벼운 두뇌활동 콘텐츠", status: "콘텐츠 제작 중", visible: true },
  { title: "발 건강 · 걷기", desc: "공연·외출 전후에 활용하는 보행, 발 관리 정보", status: "콘텐츠 제작 중", visible: true },
  { title: "50+ AI 생활", desc: "AI 배우기, 취미, 문화생활을 짧고 쉽게 시작하는 생활 콘텐츠", status: "콘텐츠 제작 중", visible: true },
];

function parseCards(raw: string | undefined): FiftyPlusCard[] {
  if (!raw) return DEFAULT_FIFTYPLUS_CARDS;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_FIFTYPLUS_CARDS;
    return SLOTS.map((_, i) => ({ ...DEFAULT_FIFTYPLUS_CARDS[i], ...(parsed[i] || {}) }));
  } catch {
    return DEFAULT_FIFTYPLUS_CARDS;
  }
}

export default function ParentsFiftyPlusSection(){
  // 관리자 화면(/admin/business > 홈 화면 노출 설정)에서 섹션 전체 및 카드별로 끄고 켤 수 있음.
  const [sectionVisible,setSectionVisible]=useState(true);
  const [cards,setCards]=useState<FiftyPlusCard[]>(DEFAULT_FIFTYPLUS_CARDS);

  useEffect(()=>{
    fetch("/api/settings",{cache:"no-store"}).then(r=>r.json()).then(d=>{
      if(d.fiftyplus_visible==="false")setSectionVisible(false);
      setCards(parseCards(d.fiftyplus_cards));
    }).catch(()=>{});
  },[]);

  const visibleCards = cards.filter(c=>c.visible!==false);
  if(!sectionVisible || visibleCards.length===0) return null;

  return <section id="fiftyplus" className="mx-auto w-full max-w-[1280px] px-6 py-14">
  <div className="border-t border-line pt-9">
    <div className="grid gap-7 lg:grid-cols-[.75fr_1.25fr]">
      <div
        className="relative max-w-md overflow-hidden rounded-2xl px-6 py-8"
        style={{backgroundImage:"url(/healing-bg.svg)",backgroundSize:"cover",backgroundPosition:"center"}}
      >
        <p className="text-[11px] font-semibold tracking-[.18em] text-gold">SHOWDAY 50+ LIFE</p>
        <h2 className="mt-3 text-[clamp(1.3rem,2.6vw,1.875rem)] font-black leading-tight text-paper">공연을 넘어,<br/>좋은 하루를 위한 콘텐츠</h2>
        <p className="mt-4 text-sm leading-7 text-muted">하나씩 차근차근 준비하고 있어요.</p>
      </div>
      <div className="grid border-t border-line sm:grid-cols-2 lg:border-t-0 lg:grid-cols-2">{cards.map((c,i)=>{
        if(c.visible===false) return null;
        const Icon=SLOTS[i].icon;
        return <article key={i} className={`group border-b border-line py-5 sm:px-5 ${i%2===0?"sm:border-r":""} lg:py-6`}><div className="flex items-start gap-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-gold"><Icon className="h-5 w-5"/></div><div><span className="text-[10px] font-semibold tracking-[.12em] text-muted">{SLOTS[i].badge}</span><h3 className="mt-1.5 text-lg font-black text-paper">{c.title}</h3><p className="mt-2 text-xs leading-6 text-muted">{c.desc}</p>{c.status&&<span className="mt-3 inline-flex items-center rounded-full border border-line px-3 py-1.5 text-[11px] font-semibold text-muted">{c.status}</span>}</div></div></article>
      })}</div>
    </div>
  </div>
</section>}
