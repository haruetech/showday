"use client";

import { useEffect, useState } from "react";

type SortKind="recommend"|"distance"|"date";

export default function SectionQuickNav(){
  const [hasResults,setHasResults]=useState(false);
  const [hasArena,setHasArena]=useState(false);

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
  }
  function sort(kind:SortKind){
    if(!hasResults){go("show-search");return}
    window.dispatchEvent(new CustomEvent("showday:result-sort",{detail:kind}));
    window.setTimeout(()=>go("search-results"),30);
  }

  return <nav className="section-quick-nav" aria-label="SHOWDAY 도움 메뉴">
    <div className="section-quick-nav__rail">
      <button type="button" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}><span className="section-quick-nav__dot" aria-hidden="true"/><span>상단으로</span></button>
      <button type="button" onClick={()=>go("quick-search")}><span className="section-quick-nav__dot" aria-hidden="true"/><span>{hasResults?"검색조건 바꾸기":"바로 찾기"}</span></button>
      {!hasResults&&<>
        <button type="button" onClick={()=>go("quick-search")}><span className="section-quick-nav__dot" aria-hidden="true"/><span>아이와 이번 주말</span></button>
        <button type="button" onClick={()=>go("quick-search")}><span className="section-quick-nav__dot" aria-hidden="true"/><span>부모님과 공연</span></button>
        <button type="button" onClick={()=>go("quick-search")}><span className="section-quick-nav__dot" aria-hidden="true"/><span>오늘 내 주변</span></button>
        <button type="button" onClick={()=>go("quick-search")}><span className="section-quick-nav__dot" aria-hidden="true"/><span>무료 공연·행사</span></button>
        <button type="button" onClick={()=>go("quick-search")}><span className="section-quick-nav__dot" aria-hidden="true"/><span>아이와 전시·체험</span></button>
        <button type="button" onClick={()=>go("quick-search")}><span className="section-quick-nav__dot" aria-hidden="true"/><span>연인과 전시·데이트</span></button>
      </>}
      {hasResults&&<>
        <button type="button" onClick={()=>go("search-results")}><span className="section-quick-nav__dot" aria-hidden="true"/><span>검색 결과</span></button>
        <button type="button" onClick={()=>sort("distance")}><span className="section-quick-nav__dot" aria-hidden="true"/><span>가까운 순</span></button>
        <button type="button" onClick={()=>sort("date")}><span className="section-quick-nav__dot" aria-hidden="true"/><span>날짜 빠른 순</span></button>
        <button type="button" onClick={()=>sort("recommend")}><span className="section-quick-nav__dot" aria-hidden="true"/><span>추천 순</span></button>
        <button type="button" onClick={()=>go("search-condition-save")}><span className="section-quick-nav__dot" aria-hidden="true"/><span>♡ 조건 저장</span></button>
      </>}
      {hasArena&&<button type="button" onClick={()=>go("arena-now")}><span className="section-quick-nav__dot" aria-hidden="true"/><span>ARENA NOW</span></button>}
    </div>
  </nav>;
}
