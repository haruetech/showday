"use client";

import { useEffect, useMemo, useState } from "react";

type NavItem = { id: string; label: string; short?: string };

const ITEMS: NavItem[] = [
  { id: "show-search", label: "상단으로 · AI 공연찾기", short: "상단" },
  { id: "for-you", label: "나를 위한 추천", short: "추천" },
  { id: "popular-now", label: "실제로 많이 선택되는 공연", short: "실제 인기" },
  { id: "discover", label: "전체 목록보다 · 공연 발견", short: "공연 발견" },
  { id: "weekend-shows", label: "이번 주말", short: "주말" },
  { id: "genre-discovery", label: "장르별로 발견하기", short: "장르" },
  { id: "my-area", label: "MY AREA · 내 주변 공연", short: "내 주변" },
  { id: "showday-now", label: "SHOWDAY NOW · 공연 소식", short: "NOW" },
  { id: "ticket-open-news", label: "티켓 오픈 · 예매 소식", short: "티켓" },
  { id: "today-shows", label: "오늘 바로 볼 수 있는 공연", short: "오늘" },
  { id: "upcoming-shows", label: "전체 예정 공연", short: "예정" },
  { id: "artists", label: "아티스트의 다음 공연", short: "아티스트" },
  { id: "venues", label: "공연장별 현재·예정 공연", short: "공연장" },
  { id: "fiftyplus", label: "50+ LIFE", short: "50+" },
  { id: "alerts-nav", label: "내 공연 알림", short: "알림" },
  { id: "arena-now", label: "ARENA NOW", short: "ARENA" },
];

export default function SectionQuickNav(){
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState("show-search");
  const [available,setAvailable]=useState<Set<string>>(new Set());

  useEffect(()=>{
    const refresh=()=>setAvailable(new Set(ITEMS.filter(item=>document.getElementById(item.id)).map(item=>item.id)));
    refresh();
    const timer=window.setTimeout(refresh,900);
    return()=>window.clearTimeout(timer);
  },[]);

  const visible=useMemo(()=>ITEMS.filter(item=>available.has(item.id)),[available]);

  useEffect(()=>{
    if(!visible.length)return;
    const sections=visible.map(item=>document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
    if(!sections.length)return;
    const observer=new IntersectionObserver(entries=>{
      const candidates=entries.filter(e=>e.isIntersecting).sort((a,b)=>Math.abs(a.boundingClientRect.top)-Math.abs(b.boundingClientRect.top));
      if(candidates[0]?.target?.id)setActive(candidates[0].target.id);
    },{rootMargin:"-18% 0px -66% 0px",threshold:[0,.1,.35]});
    sections.forEach(section=>observer.observe(section));
    return()=>observer.disconnect();
  },[visible]);

  function go(id:string){
    const el=document.getElementById(id);
    if(!el)return;
    el.scrollIntoView({behavior:"smooth",block:"start"});
    setOpen(false);
  }

  if(!visible.length)return null;

  return <>
    <nav className="section-quick-nav" aria-label="SHOWDAY 섹션 바로가기">
      <div className="section-quick-nav__rail">
        {visible.map(item=><button key={item.id} type="button" onClick={()=>go(item.id)} className={active===item.id?"is-active":""} aria-current={active===item.id?"location":undefined}>
          <span className="section-quick-nav__dot" aria-hidden="true"/><span>{item.label}</span>
        </button>)}
      </div>
    </nav>

    <div className="section-quick-nav-mobile">
      <button type="button" className="section-quick-nav-mobile__toggle" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-label="페이지 바로가기 메뉴">
        <span className="section-quick-nav-mobile__lines" aria-hidden="true"><i/><i/><i/></span><span>바로가기</span>
      </button>
      {open&&<div className="section-quick-nav-mobile__sheet" role="dialog" aria-label="페이지 바로가기">
        <div className="section-quick-nav-mobile__head"><strong>SHOWDAY 바로가기</strong><button type="button" onClick={()=>setOpen(false)} aria-label="닫기">×</button></div>
        <div className="section-quick-nav-mobile__grid">{visible.map(item=><button key={item.id} type="button" onClick={()=>go(item.id)} className={active===item.id?"is-active":""}>{item.short||item.label}</button>)}</div>
      </div>}
    </div>
  </>;
}
