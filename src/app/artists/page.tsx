"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InterestArtistsSection from "@/components/home/InterestArtistsSection";
import type { Show } from "@/types/show";

type ViewMode = "guest" | "member";

export default function ArtistsPage(){
  const [mode,setMode]=useState<ViewMode>("guest");
  const [upcoming,setUpcoming]=useState<Show[]>([]);
  const [popular,setPopular]=useState<Show[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let cancelled=false;
    Promise.all([
      fetch("/api/kopis?type=upcoming&rows=120",{cache:"no-store"}).then(r=>r.json()).catch(()=>({shows:[]})),
      fetch("/api/kopis?type=popular&rows=40",{cache:"no-store"}).then(r=>r.json()).catch(()=>({shows:[]})),
      fetch("/api/manual-shows",{cache:"no-store"}).then(r=>r.json()).catch(()=>({shows:[]})),
    ]).then(([u,p,m])=>{
      if(cancelled)return;
      const manual:Array<Show>=Array.isArray(m?.shows)?m.shows:[];
      setUpcoming([...(Array.isArray(u?.shows)?u.shows:[]),...manual]);
      setPopular(Array.isArray(p?.shows)?p.shows:[]);
    }).finally(()=>{if(!cancelled)setLoading(false)});
    return()=>{cancelled=true};
  },[]);

  const shows=useMemo(()=>Array.from(new Map(upcoming.map(s=>[s.id,s])).values()),[upcoming]);
  return <><Header mode={mode} onModeChange={setMode}/><main className="min-h-screen bg-ink"><InterestArtistsSection shows={shows} popularShows={popular} mode={mode}/>{loading&&<p className="mx-auto max-w-[1180px] px-4 pb-10 text-xs text-muted sm:px-6">아티스트 공연 정보를 확인하는 중입니다.</p>}</main><Footer/></>;
}
