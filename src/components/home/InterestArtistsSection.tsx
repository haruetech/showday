"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { signInWithKakao } from "@/lib/auth";
import { getFollowedArtistIds, toggleArtistFollow } from "@/lib/favorites";
import type { Show } from "@/types/show";

type ViewMode = "guest" | "member";
type ExtendedShow = Show & {
  ticketOpenAt?: string | null;
  bookingOpenAt?: string | null;
  bookingUrl?: string | null;
  ticketUrl?: string | null;
  startDate?: string | null;
  showTime?: string | null;
};
type AlertPrefs = {
  artistNewShow: boolean;
  ticketOpen: boolean;
  freeNearby: boolean;
  savedSearch: boolean;
  ticketLead: "1d" | "1h" | "10m";
};

const ALERT_PREFS_KEY = "showday:alert-prefs:v1";
const DEFAULT_PREFS: AlertPrefs = { artistNewShow:true, ticketOpen:true, freeNearby:false, savedSearch:false, ticketLead:"1h" };

function safePrefs(): AlertPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(ALERT_PREFS_KEY) || "{}") }; }
  catch { return DEFAULT_PREFS; }
}
function cleanArtistName(value?: string) {
  if (!value) return "";
  return value.split(/,|·|\/|\n/)[0]?.trim().slice(0, 40) || "";
}
function artistId(name: string) { return `artist-name:${encodeURIComponent(name.trim())}`; }
function artistNameFromId(id: string) {
  if (!id.startsWith("artist-name:")) return "";
  try { return decodeURIComponent(id.slice("artist-name:".length)); } catch { return ""; }
}
function ticketOpenValue(show: Show) {
  const s = show as ExtendedShow;
  return s.ticketOpenAt || s.bookingOpenAt || "";
}
function bookingUrl(show: Show) {
  const s = show as ExtendedShow;
  return s.bookingUrl || s.ticketUrl || "";
}
function showDateText(show: Show) {
  const s = show as ExtendedShow;
  return show.dateLabel || s.startDate || "일정 확인 중";
}
function toTime(value: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", { month:"long", day:"numeric", hour:"2-digit", minute:"2-digit", hour12:false }).format(d);
}
function showLink(show: Show) { return `/show/${encodeURIComponent(show.id)}`; }

export default function InterestArtistsSection({ shows, mode, popularShows=[] }: { shows: Show[]; mode: ViewMode; popularShows?: Show[] }) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [follows, setFollows] = useState<Set<string>>(new Set());
  const [selectedArtist, setSelectedArtist] = useState("");
  const [prefs, setPrefs] = useState<AlertPrefs>(DEFAULT_PREFS);
  const [notice, setNotice] = useState("");

  useEffect(() => { getFollowedArtistIds().then(setFollows); setPrefs(safePrefs()); }, [mode]);
  useEffect(() => { if (!notice) return; const t=setTimeout(()=>setNotice(""),2200); return()=>clearTimeout(t); }, [notice]);

  const allShows = useMemo(() => Array.from(new Map([...shows,...popularShows].map(s=>[s.id,s])).values()), [shows,popularShows]);
  const knownArtists = useMemo(() => {
    const names = new Set<string>();
    for (const show of allShows) { const name=cleanArtistName(show.artist); if (name.length>=2) names.add(name); }
    return Array.from(names).sort((a,b)=>a.localeCompare(b,"ko"));
  }, [allShows]);
  const rankings = useMemo(() => {
    const map=new Map<string,{name:string;total:number;popular:number;next?:Show}>();
    for (const show of allShows) {
      const name=cleanArtistName(show.artist); if(!name) continue;
      const row=map.get(name)||{name,total:0,popular:0,next:undefined}; row.total+=1;
      if(popularShows.some(p=>p.id===show.id)) row.popular+=1;
      if(!row.next) row.next=show;
      map.set(name,row);
    }
    return Array.from(map.values()).sort((a,b)=>b.popular-a.popular || b.total-a.total || a.name.localeCompare(b.name,"ko")).slice(0,10);
  }, [allShows,popularShows]);
  const matches = useMemo(() => {
    const q=searched.trim().toLowerCase(); if(!q) return [];
    return knownArtists.filter(name=>name.toLowerCase().includes(q)).slice(0,10);
  }, [knownArtists,searched]);
  const savedNames = useMemo(() => Array.from(follows).map(artistNameFromId).filter(Boolean), [follows]);
  const activeArtist = selectedArtist || searched || savedNames[0] || rankings[0]?.name || "";
  const activeShows = useMemo(() => activeArtist ? allShows.filter(s=>cleanArtistName(s.artist)===activeArtist).slice(0,12) : [], [allShows,activeArtist]);

  function submit(e: FormEvent) { e.preventDefault(); const q=query.trim(); if(q){setSearched(q);setSelectedArtist(q);} }
  async function toggle(name: string) {
    if (mode === "guest") { await signInWithKakao(); return; }
    const id=artistId(name); const next=await toggleArtistFollow(id);
    setFollows(prev=>{const copy=new Set(prev);next?copy.add(id):copy.delete(id);return copy;});
    setSelectedArtist(name);
    setNotice(next ? `${name} 관심 아티스트로 등록했습니다.` : `${name} 관심 등록을 해제했습니다.`);
  }
  function saveAlertPrefs(patch: Partial<AlertPrefs>) {
    if(mode==="guest"){void signInWithKakao();return;}
    const next={...prefs,...patch};setPrefs(next);localStorage.setItem(ALERT_PREFS_KEY,JSON.stringify(next));setNotice("알림 설정을 MY SHOWDAY에 저장했습니다.");
  }

  return <section id="interest-artists" className="scroll-mt-24 border-t border-line px-4 py-10 sm:px-6 sm:py-14">
    <div className="mx-auto w-full max-w-[1180px]">
      {notice&&<div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-paper px-4 py-2 text-xs font-black text-white shadow-xl">{notice}</div>}
      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
        <div><p className="text-[11px] font-black tracking-[.18em] text-gold">MY ARTIST</p><h1 className="mt-2 text-2xl font-black tracking-tight text-paper sm:text-4xl">좋아하는 아티스트, 공연과 예매 소식을 한 번에</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-muted">관심 아티스트를 등록하면 현재 확인 가능한 공연예정, 티켓 오픈 정보와 예매 바로가기를 한곳에서 확인할 수 있습니다. 공식 오픈 시간이 확인되지 않은 공연은 임의로 시간을 만들지 않고 ‘미확인’으로 표시합니다.</p></div>
        <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4"><b className="text-sm text-paper">알림 기본 설정</b><p className="mt-1 text-xs leading-5 text-muted">새 공연 + 티켓 오픈을 기본으로 저장하고, MY SHOWDAY에서 언제든 변경합니다.</p><a href="/my?tab=alerts" className="mt-3 inline-flex rounded-full border border-gold/50 px-3 py-2 text-xs font-black text-gold">MY 알림설정 →</a></div>
      </div>

      <form onSubmit={submit} className="mt-7 flex max-w-3xl gap-2 rounded-2xl border border-line bg-white/5 p-2"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="가수·배우·연주자 이름을 입력하세요" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-paper outline-none placeholder:text-muted"/><button className="shrink-0 rounded-xl bg-paper px-5 py-3 text-sm font-black text-white">아티스트 찾기</button></form>

      {savedNames.length>0&&<div className="mt-4 flex flex-wrap gap-2"><span className="py-2 text-[11px] font-black text-muted">내 관심</span>{savedNames.map(name=><button key={name} onClick={()=>{setSelectedArtist(name);setSearched(name);setQuery(name)}} className={`rounded-full border px-3 py-2 text-xs font-bold ${activeArtist===name?"border-gold bg-gold/10 text-gold":"border-line text-paper"}`}>♥ {name}</button>)}</div>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-3xl border border-line bg-white/[.03] p-4 sm:p-5"><div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-black tracking-[.16em] text-gold">ARTIST TOP 10</p><h2 className="mt-1 text-lg font-black text-paper">지금 SHOWDAY에서 공연이 확인되는 아티스트</h2></div><span className="text-[10px] text-muted">공연·박스오피스 데이터 기준</span></div><div className="mt-4 space-y-2">{rankings.length?rankings.map((row,i)=><button key={row.name} onClick={()=>{setSelectedArtist(row.name);setSearched(row.name);setQuery(row.name)}} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${activeArtist===row.name?"border-gold bg-gold/10":"border-line hover:border-gold/50"}`}><span className="w-7 text-center text-sm font-black text-gold">{i+1}</span><div className="min-w-0 flex-1"><b className="block truncate text-sm text-paper">{row.name}</b><span className="mt-1 block text-[10px] text-muted">확인 공연 {row.total}건{row.popular?` · 박스오피스 연관 ${row.popular}건`:""}</span></div><span className="text-xs text-muted">보기 →</span></button>):<p className="py-6 text-center text-sm text-muted">아티스트 데이터를 불러오는 중입니다.</p>}</div></div>

        <div className="rounded-3xl border border-line bg-white/[.03] p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-black tracking-[.16em] text-gold">UPCOMING & TICKET</p><h2 className="mt-1 text-xl font-black text-paper">{activeArtist?`${activeArtist} 공연·예매 일정`:"아티스트를 선택하세요"}</h2></div>{activeArtist&&<button onClick={()=>toggle(activeArtist)} className={`rounded-full px-4 py-2 text-xs font-black ${follows.has(artistId(activeArtist))?"border border-gold text-gold":"bg-paper text-white"}`}>{follows.has(artistId(activeArtist))?"♥ 관심 등록됨":"♡ 관심 아티스트 등록"}</button>}</div>
          {searched&&matches.length>0&&<div className="mt-4 flex flex-wrap gap-2">{matches.map(name=><button key={name} onClick={()=>setSelectedArtist(name)} className="rounded-full border border-line px-3 py-1.5 text-[11px] font-bold text-paper hover:border-gold">{name}</button>)}</div>}
          {activeArtist&&<div className="mt-5 grid gap-3">{activeShows.length?activeShows.map(show=>{const open=ticketOpenValue(show);const book=bookingUrl(show);return <article key={show.id} className="rounded-2xl border border-line bg-ink/30 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><span className="text-[10px] font-black text-gold">공연예정</span><h3 className="mt-1 line-clamp-2 text-sm font-black leading-5 text-paper">{show.title}</h3><p className="mt-2 text-xs text-muted">공연 일정 · <b className="text-paper">{showDateText(show)}</b></p><p className="mt-1 text-xs text-muted">티켓 오픈 · <b className={open?"text-gold":"text-paper"}>{open?toTime(open):"공식 오픈일·시간 미확인"}</b></p></div><div className="flex shrink-0 flex-col gap-2"><a href={showLink(show)} className="rounded-full border border-line px-3 py-2 text-center text-[11px] font-black text-paper">공연 상세</a>{book?<a href={book} target="_blank" rel="noopener noreferrer" className="rounded-full bg-gold px-3 py-2 text-center text-[11px] font-black text-ink">빠른예매 ↗</a>:<span className="rounded-full border border-line px-3 py-2 text-center text-[10px] font-bold text-muted">예매처 확인 중</span>}</div></div></article>}):<div className="rounded-2xl border border-dashed border-line px-4 py-8 text-center"><p className="text-sm font-black text-paper">현재 확인된 예정 공연이 없습니다.</p><p className="mt-2 text-xs leading-5 text-muted">관심 등록을 유지하면 향후 공연 데이터가 들어왔을 때 확인할 수 있도록 준비합니다.</p></div>}</div>}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-white/[.03] p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-black tracking-[.16em] text-gold">ALERT SETTINGS</p><h2 className="mt-1 text-lg font-black text-paper">관심 아티스트 알림 연결</h2><p className="mt-1 text-xs leading-5 text-muted">설정값은 MY SHOWDAY와 공유됩니다. 실제 푸시·카카오 발송은 발송 서버가 연결된 항목부터 동작하도록 분리합니다.</p></div><a href="/my?tab=alerts" className="text-xs font-black text-gold">전체 알림 관리 →</a></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><AlertToggle label="새 공연" desc="등록 아티스트 새 공연" checked={prefs.artistNewShow} onChange={v=>saveAlertPrefs({artistNewShow:v})}/><AlertToggle label="티켓 오픈" desc="예매 시작 시점" checked={prefs.ticketOpen} onChange={v=>saveAlertPrefs({ticketOpen:v})}/><AlertToggle label="무료 행사" desc="내 주변 무료 소식" checked={prefs.freeNearby} onChange={v=>saveAlertPrefs({freeNearby:v})}/><AlertToggle label="저장 조건" desc="조건에 맞는 새 소식" checked={prefs.savedSearch} onChange={v=>saveAlertPrefs({savedSearch:v})}/></div>{prefs.ticketOpen&&<div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted"><b className="mr-1 text-paper">티켓 오픈 사전알림</b>{([['1d','하루 전'],['1h','1시간 전'],['10m','10분 전']] as const).map(([v,label])=><button key={v} onClick={()=>saveAlertPrefs({ticketLead:v})} className={`rounded-full border px-3 py-1.5 font-bold ${prefs.ticketLead===v?"border-gold bg-gold/10 text-gold":"border-line"}`}>{label}</button>)}</div>}</div>
    </div>
  </section>;
}

function AlertToggle({label,desc,checked,onChange}:{label:string;desc:string;checked:boolean;onChange:(v:boolean)=>void}){
  return <button onClick={()=>onChange(!checked)} className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left ${checked?"border-gold/60 bg-gold/10":"border-line"}`}><div><b className="block text-sm text-paper">{label}</b><span className="mt-1 block text-[10px] text-muted">{desc}</span></div><span className={`relative h-6 w-11 shrink-0 rounded-full ${checked?"bg-gold":"bg-white/15"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${checked?"left-6":"left-1"}`}/></span></button>;
}
