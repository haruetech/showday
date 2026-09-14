"use client";

import { useEffect, useState } from "react";

type SortKind="recommend"|"distance"|"date";
type QuickAction="child_weekend"|"parent_weekend"|"free_start"|"free_near";

export default function SectionQuickNav(){
  const [hasResults,setHasResults]=useState(false);
  const [hasArena,setHasArena]=useState(false);
  const [mobileOpen,setMobileOpen]=useState(false);

  useEffect(()=>{
    const refresh=()=>{
      setHasResults(Boolean(document.getElementById("search-results")));
      setHasArena(Boolean(document.getElementById("arena-now")));
    };
    refresh();
    const observer=new MutationObserver(refresh);
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[]);

  function go(id:string){
    document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});
    setMobileOpen(false);
  }
  function sort(kind:SortKind){
    if(!hasResults){go("show-search");return}
    window.dispatchEvent(new CustomEvent("showday:result-sort",{detail:kind}));
    window.setTimeout(()=>go("search-results"),30);
  }
  function quick(action:QuickAction){
    window.dispatchEvent(new CustomEvent("showday:quick-search",{detail:action}));
    setMobileOpen(false);
  }

  const MoveButton=({id,label}:{id:string;label:string})=><button type="button" onClick={()=>go(id)}><span className="section-quick-nav__dot" aria-hidden="true"/><span>{label}</span></button>;

  return <>
    <nav className="section-quick-nav" aria-label="SHOWDAY 빠른 이동">
      <div className="section-quick-nav__rail">
        <div className="section-quick-nav__label">QUICK · 빠른 이동</div>
        <button type="button" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}><span className="section-quick-nav__dot" aria-hidden="true"/><span>상단으로</span></button>
        <MoveButton id="show-search" label="공연 찾기"/>
        <MoveButton id="popular-now" label="많이 선택되는 공연"/>
        <MoveButton id="discover" label="이번 주말 · 장르"/>
        <MoveButton id="my-area" label="내 주변 공연·행사"/>
        <MoveButton id="showday-now" label="티켓오픈·공연소식"/>
        <MoveButton id="today-shows" label="오늘 공연"/>
        <MoveButton id="upcoming-shows" label="진행·예정 공연"/>
        <div className="section-quick-nav__divider"/>
        <div className="section-quick-nav__label section-quick-nav__label--accent">빠른찾기</div>
        <button type="button" className="section-quick-nav__quick" onClick={()=>quick("child_weekend")}><span className="section-quick-nav__dot"/><span>아이와</span></button>
        <button type="button" className="section-quick-nav__quick" onClick={()=>quick("parent_weekend")}><span className="section-quick-nav__dot"/><span>부모님과</span></button>
        <button type="button" className="section-quick-nav__quick" onClick={()=>quick("free_start")}><span className="section-quick-nav__dot"/><span>무료 공연·행사</span></button>
        {hasResults&&<>
          <div className="section-quick-nav__divider"/>
          <MoveButton id="search-results" label="검색 결과"/>
          <button type="button" onClick={()=>sort("distance")}><span className="section-quick-nav__dot"/><span>가까운 순</span></button>
          <button type="button" onClick={()=>sort("date")}><span className="section-quick-nav__dot"/><span>날짜 빠른 순</span></button>
          <button type="button" onClick={()=>sort("recommend")}><span className="section-quick-nav__dot"/><span>추천 순</span></button>
          <MoveButton id="search-condition-save" label="♡ 조건 저장"/>
        </>}
        {hasArena&&<MoveButton id="arena-now" label="ARENA NOW"/>}
      </div>
    </nav>

    <div className="section-quick-nav-mobile">
      <button type="button" className="section-quick-nav-mobile__toggle" aria-expanded={mobileOpen} onClick={()=>setMobileOpen(v=>!v)}>
        <span className="section-quick-nav-mobile__lines" aria-hidden="true"><i/><i/><i/></span>
        빠른 이동
      </button>
      {mobileOpen&&<div className="section-quick-nav-mobile__sheet">
        <div className="section-quick-nav-mobile__head"><strong>SHOWDAY 빠른 이동</strong><button type="button" onClick={()=>setMobileOpen(false)} aria-label="닫기">×</button></div>
        <p className="section-quick-nav-mobile__subhead">빠른찾기</p>
        <div className="section-quick-nav-mobile__grid section-quick-nav-mobile__grid--quick">
          <button type="button" onClick={()=>quick("child_weekend")}>아이와</button>
          <button type="button" onClick={()=>quick("parent_weekend")}>부모님과</button>
          <button type="button" onClick={()=>quick("free_start")}>무료 공연·행사</button>
          <button type="button" onClick={()=>quick("free_near")}>내 주변 무료</button>
        </div>
        <p className="section-quick-nav-mobile__subhead">페이지 이동</p>
        <div className="section-quick-nav-mobile__grid">
          <button type="button" onClick={()=>go("show-search")}>공연 찾기</button>
          <button type="button" onClick={()=>go("my-area")}>내 주변</button>
          <button type="button" onClick={()=>go("showday-now")}>티켓·소식</button>
          <button type="button" onClick={()=>go("today-shows")}>오늘 공연</button>
          <button type="button" onClick={()=>go("upcoming-shows")}>예정 공연</button>
          {hasResults&&<button type="button" onClick={()=>go("search-results")}>검색 결과</button>}
        </div>
      </div>}
    </div>
  </>;
}
