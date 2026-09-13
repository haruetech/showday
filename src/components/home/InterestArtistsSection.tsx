"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { signInWithKakao } from "@/lib/auth";
import { getFollowedArtistIds, toggleArtistFollow } from "@/lib/favorites";
import type { Show } from "@/types/show";

type ViewMode = "guest" | "member";

function cleanArtistName(value?: string) {
  if (!value) return "";
  return value.split(/,|·|\/|\n/)[0]?.trim().slice(0, 40) || "";
}

function artistId(name: string) {
  return `artist-name:${encodeURIComponent(name.trim())}`;
}

function artistNameFromId(id: string) {
  if (!id.startsWith("artist-name:")) return "";
  try { return decodeURIComponent(id.slice("artist-name:".length)); } catch { return ""; }
}

export default function InterestArtistsSection({ shows, mode }: { shows: Show[]; mode: ViewMode }) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [follows, setFollows] = useState<Set<string>>(new Set());

  useEffect(() => { getFollowedArtistIds().then(setFollows); }, [mode]);

  const knownArtists = useMemo(() => {
    const names = new Set<string>();
    for (const show of shows) {
      const name = cleanArtistName(show.artist);
      if (name.length >= 2) names.add(name);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b, "ko"));
  }, [shows]);

  const matches = useMemo(() => {
    const q = searched.trim().toLowerCase();
    if (!q) return [];
    return knownArtists.filter((name) => name.toLowerCase().includes(q)).slice(0, 8);
  }, [knownArtists, searched]);

  const savedNames = useMemo(() => Array.from(follows).map(artistNameFromId).filter(Boolean), [follows]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) setSearched(q);
  }

  async function toggle(name: string) {
    if (mode === "guest") { await signInWithKakao(); return; }
    const id = artistId(name);
    const next = await toggleArtistFollow(id);
    setFollows((prev) => { const copy = new Set(prev); next ? copy.add(id) : copy.delete(id); return copy; });
  }

  return (
    <section id="interest-artists" className="scroll-mt-24 border-t border-line px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="max-w-2xl">
          <p className="text-[11px] font-black tracking-[.18em] text-gold">MY ARTIST</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-paper sm:text-3xl">좋아하는 아티스트만 등록하세요</h2>
          <p className="mt-2 text-sm leading-6 text-muted">모르는 아티스트 목록 대신, 원하는 이름을 직접 찾고 관심 아티스트로 저장합니다. 해당 아티스트의 공연을 빠르게 확인할 수 있습니다.</p>
        </div>

        <form onSubmit={submit} className="mt-6 flex max-w-2xl gap-2 rounded-2xl border border-line bg-white/5 p-2">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="가수·배우·연주자 이름을 입력하세요" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-paper outline-none placeholder:text-muted" />
          <button className="shrink-0 rounded-xl bg-paper px-5 py-3 text-sm font-black text-white">아티스트 찾기</button>
        </form>

        {savedNames.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{savedNames.map(name=><button key={name} onClick={()=>{setQuery(name);setSearched(name)}} className="rounded-full border border-gold/50 px-3 py-2 text-xs font-bold text-paper">♡ {name}</button>)}</div>}

        {searched && <div className="mt-6 max-w-3xl rounded-2xl border border-line bg-white/[.03] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3"><b className="text-sm text-paper">‘{searched}’ 검색 결과</b><button onClick={()=>{setSearched("");setQuery("")}} className="text-xs text-muted">닫기</button></div>
          {matches.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{matches.map(name=>{
            const id=artistId(name); const count=shows.filter(s=>cleanArtistName(s.artist)===name).length; const saved=follows.has(id);
            return <div key={name} className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3"><div><b className="text-sm text-paper">{name}</b><p className="mt-1 text-xs text-muted">현재 확인 가능한 공연 {count}건</p></div><button onClick={()=>toggle(name)} className={`rounded-full px-3 py-2 text-xs font-black ${saved?"border border-gold text-gold":"bg-paper text-white"}`}>{saved?"관심 등록됨":"♡ 관심 등록"}</button></div>
          })}</div> : <div className="mt-4"><p className="text-sm text-muted">현재 SHOWDAY 공연 데이터에서는 같은 이름을 찾지 못했습니다.</p><button onClick={()=>toggle(searched)} className="mt-3 rounded-full border border-gold px-4 py-2.5 text-xs font-black text-gold">♡ ‘{searched}’ 관심 아티스트로 등록</button></div>}
        </div>}

        <p className="mt-4 text-xs leading-5 text-muted">관심 아티스트의 새 공연·티켓 오픈 알림은 알림 기능과 연결해 단계적으로 제공할 예정입니다.</p>
      </div>
    </section>
  );
}
